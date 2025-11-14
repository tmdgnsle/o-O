import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import type { TrendKeywordItem } from "../../types/trend";
import {
  getNodeColorByRank,
  createSVGRadialGradient,
} from "@/shared/utils/gradientUtils";
import { useFullscreen } from "@/shared/hooks/useFullscreen"; // 훅 import

interface D3MindmapProps {
  readonly parentKeyword: string;
  readonly childKeywords: TrendKeywordItem[];
  readonly onMoreClick: (remainingKeywords: TrendKeywordItem[]) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  rank?: number;
  isParent?: boolean;
  isMoreButton?: boolean;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export function D3Mindmap({
  parentKeyword,
  childKeywords,
  onMoreClick,
}: D3MindmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const onMoreClickRef = useRef(onMoreClick);

  // 전체화면 감지
  const isFullscreen = useFullscreen();

  // 컨테이너 크기를 상태로 관리
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 더보기 버튼 클릭 상태 추가
  const [isMoreButtonClicked, setIsMoreButtonClicked] = useState(false);

  // onMoreClick이 변경되면 ref 업데이트
  useEffect(() => {
    onMoreClickRef.current = onMoreClick;
  }, [onMoreClick]);

  // 상위 7개만 마인드맵에 표시
  const displayKeywords = useMemo(() => {
    return childKeywords.slice(0, 7);
  }, [childKeywords.map((k) => k.keyword).join(",")]);

  // ResizeObserver로 크기 변경 감지
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // D3 렌더링 (containerSize와 isFullscreen을 의존성에 추가)
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const svg = d3.select(svgRef.current);
    const width = containerSize.width;
    const height = containerSize.height;

    svg.selectAll("*").remove();

    // 전체화면일 때와 일반 화면일 때 다른 스케일 적용
    let scaleFactor: number;

    if (isFullscreen) {
      // 전체화면: 화면 크기에 비례해서 크게
      const baseWidth = 1920;
      const baseHeight = 1080;
      const widthScale = width / baseWidth;
      const heightScale = height / baseHeight;
      scaleFactor = Math.max(widthScale, heightScale, 1.5); // 최소 1.5배
      console.log("전체화면 모드 - Scale factor:", scaleFactor);
    } else {
      // 일반 화면: 기본 크기 유지
      scaleFactor = 1;
      console.log("일반 화면 모드 - Scale factor:", scaleFactor);
    }

    console.log("Screen size:", width, height);

    const linkDistance = 320 * scaleFactor;
    const chargeStrength = -700 * scaleFactor;
    const collisionRadius = 50 * scaleFactor;

    // 노드 데이터 준비
    const nodes: Node[] = [
      {
        id: parentKeyword,
        label: parentKeyword,
        isParent: true,
        x: width / 2,
        y: height / 2,
        fx: width / 2,
        fy: height / 2,
      },
      // 더보기 버튼 (부모 노드 오른쪽에 고정, 화면 크기에 비례)
      {
        id: "__more__",
        label: "더보기",
        isMoreButton: true,
        x: width / 2 + 280 * Math.max(scaleFactor, 1),
        y: height / 2,
        fx: width / 2 + 280 * Math.max(scaleFactor, 1),
        fy: height / 2,
      },
      ...displayKeywords.map((child) => ({
        id: child.keyword,
        label: child.keyword,
        rank: child.rank,
      })),
    ];

    // 링크 데이터 준비 (더보기 버튼 제외)
    const links: Link[] = displayKeywords.map((child) => ({
      source: parentKeyword,
      target: child.keyword,
    }));

    const defs = svg.append("defs");

    // 각 노드별 색상 기반 그림자 필터 생성
    const createColoredShadow = (id: string, color: string) => {
      const filter = defs.append("filter").attr("id", id);
      filter
        .append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 4);
      filter.append("feOffset").attr("dx", 0).attr("dy", 3);

      const colorMatrix = filter.append("feColorMatrix");
      colorMatrix.attr("type", "matrix").attr(
        "values",
        `0 0 0 0 ${parseInt(color.slice(1, 3), 16) / 255}
                         0 0 0 0 ${parseInt(color.slice(3, 5), 16) / 255}
                         0 0 0 0 ${parseInt(color.slice(5, 7), 16) / 255}
                         0 0 0 0.4 0`
      );

      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      return filter;
    };

    // 부모 노드 그림자
    createColoredShadow("shadow-parent", getNodeColorByRank(undefined, true));

    // 더보기 버튼 그림자
    createColoredShadow("shadow-more", "#E5E5E5");

    // 자식 노드 그림자들
    displayKeywords.forEach((child, index) => {
      createColoredShadow(`shadow-${index}`, getNodeColorByRank(child.rank));
    });

    // 부모 노드 그라데이션
    createSVGRadialGradient(
      defs,
      "gradient-parent",
      getNodeColorByRank(undefined, true),
      { inner: 0.9, middle: 0.7, outer: 0.4 }
    );

    // 더보기 버튼 그라데이션
    createSVGRadialGradient(defs, "gradient-more", "#E5E5E5", {
      inner: 0.9,
      middle: 0.7,
      outer: 0.4,
    });

    // 자식 노드 그라데이션들
    displayKeywords.forEach((child, index) => {
      createSVGRadialGradient(
        defs,
        `gradient-${index}`,
        getNodeColorByRank(child.rank)
      );
    });

    // Force Simulation 설정
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(linkDistance) // 스케일 적용
      )
      .force("charge", d3.forceManyBody().strength(chargeStrength)) // 스케일 적용
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d: any) => getNodeSize(d) / 2 + collisionRadius) // 스케일 적용
      )
      .alphaDecay(0.05)
      .on("tick", ticked)
      .on("end", () => {
        nodes.forEach((node) => {
          node.fx = node.x;
          node.fy = node.y;
        });
      });

    // 연결선 그리기
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.6);

    // 노드 그룹 생성
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer");

    // 블러 배경 원 (큰 원)
    node
      .append("circle")
      .attr("r", (d) => getNodeSize(d) / 2 + 20)
      .attr("fill", (d, i) =>
        d.isParent
          ? "url(#gradient-parent)"
          : d.isMoreButton
            ? "url(#gradient-more)"
            : `url(#gradient-${i - 2})`
      )
      .attr("opacity", 0.3)
      .style("filter", "blur(12px)");

    // 메인 원
    node
      .append("circle")
      .attr("r", (d) => getNodeSize(d) / 2)
      .attr("fill", (d, i) =>
        d.isParent
          ? "url(#gradient-parent)"
          : d.isMoreButton
            ? "url(#gradient-more)"
            : `url(#gradient-${i - 2})`
      )
      .attr("stroke", (d) =>
        d.isMoreButton && isMoreButtonClicked ? "#6B7280" : "none"
      )
      .attr("stroke-width", (d) =>
        d.isMoreButton && isMoreButtonClicked ? 3 : 0
      )

      .style("filter", (d, i) =>
        d.isParent
          ? "url(#shadow-parent)"
          : d.isMoreButton
            ? "url(#shadow-more)"
            : `url(#shadow-${i - 2})`
      )
      .on("mouseenter", function () {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("r", function (d: any) {
            return (getNodeSize(d) / 2) * 1.1;
          });
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("r", function (d: any) {
            return getNodeSize(d) / 2;
          });
      })
      .on("click", function (event, d: any) {
        event.stopPropagation();

        if (d.isMoreButton) {
          console.log("More button clicked");
          setIsMoreButtonClicked((prev) => !prev);

          // 7개 이후의 키워드들만 전달
          const remainingKeywords = childKeywords.slice(7);
          onMoreClickRef.current(remainingKeywords);
          return;
        }

        const keyword = d.label;
        console.log("Clicked keyword:", keyword);
        navigate(`/trend/${encodeURIComponent(keyword)}`);
      });

    // 텍스트 추가
    node
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("font-size", (d) =>
        d.isParent
          ? "28px"
          : d.isMoreButton
            ? "16px"
            : d.rank === 1
              ? "20px"
              : d.rank === 2
                ? "18px"
                : "16px"
      )
      .attr("font-weight", "bold")
      .attr("fill", "#1F2937")
      .style("pointer-events", "none");

    // 시뮬레이션 tick 이벤트
    function ticked() {
      nodes.forEach((d) => {
        if (d.fx === undefined) {
          const radius = getNodeSize(d) / 2;
          d.x = Math.max(radius + 50, Math.min(width - radius - 50, d.x!));
          d.y = Math.max(radius + 50, Math.min(height - radius - 50, d.y!));
        }
      });

      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }

    // 노드 크기 계산
    function getNodeSize(d: Node) {
      if (d.isParent) return 350;
      if (d.isMoreButton) return 120;
      if (!d.rank) return 160;
      switch (d.rank) {
        case 1:
          return 220;
        case 2:
          return 190;
        case 3:
          return 170;
        case 4:
          return 150;
        case 5:
          return 130;
        default:
          return 120;
      }
    }

    return () => {
      simulation.stop();
    };
  }, [
    parentKeyword,
    displayKeywords,
    navigate,
    containerSize,
    isFullscreen,
    isMoreButtonClicked,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "#F9FAFB" }}
      />
    </div>
  );
}
