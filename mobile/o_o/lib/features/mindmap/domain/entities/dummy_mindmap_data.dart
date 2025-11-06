import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import 'mindmap.dart';
import 'mindmap_edge.dart';
import 'mindmap_node.dart';

/// 더미 마인드맵 데이터
class DummyMindmapData {
  /// 알고리즘 공부 마인드맵
  static Mindmap getAlgorithmMindmap() {
    return Mindmap(
      id: '1',
      title: '알고리즘 공부 계획',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      nodes: [
        // 중심 노드 (가장 크게)
        const MindmapNode(
          id: 'center',
          text: '알고리즘',
          position: Offset(400, 350),
          color: AppColors.circle_purple,
          width: 140,
          height: 140,
          level: 0,
        ),
        // 1차 자식 노드들 (중간 크기)
        const MindmapNode(
          id: 'data-structure',
          text: '자료구조',
          position: Offset(200, 200),
          color: AppColors.circle_pink,
          width: 100,
          height: 100,
          level: 1,
        ),
        const MindmapNode(
          id: 'sorting',
          text: '정렬',
          position: Offset(150, 480),
          color: AppColors.circle_yellow,
          width: 90,
          height: 90,
          level: 1,
        ),
        const MindmapNode(
          id: 'graph',
          text: '그래프',
          position: Offset(650, 200),
          color: AppColors.circle_orange,
          width: 110,
          height: 110,
          level: 1,
        ),
        const MindmapNode(
          id: 'dp',
          text: '동적계획법',
          position: Offset(600, 500),
          color: AppColors.pink,
          width: 95,
          height: 95,
          level: 1,
        ),
        // 2차 자식 노드들 (작은 크기)
        const MindmapNode(
          id: 'stack-queue',
          text: '스택/큐',
          position: Offset(80, 120),
          color: AppColors.circle_skyblue,
          width: 80,
          height: 80,
          level: 2,
        ),
        const MindmapNode(
          id: 'tree',
          text: '트리',
          position: Offset(60, 280),
          color: AppColors.circle_green,
          width: 75,
          height: 75,
          level: 2,
        ),
        // 2차 자식 노드들 (정렬)
        const MindmapNode(
          id: 'quick-sort',
          text: '퀵정렬',
          position: Offset(60, 600),
          color: AppColors.blue,
          width: 70,
          height: 70,
          level: 2,
        ),
        const MindmapNode(
          id: 'merge-sort',
          text: '병합정렬',
          position: Offset(280, 620),
          color: AppColors.light_blue,
          width: 85,
          height: 85,
          level: 2,
        ),
        // 2차 자식 노드들 (그래프)
        const MindmapNode(
          id: 'dfs',
          text: 'DFS',
          position: Offset(800, 100),
          color: AppColors.purple,
          width: 70,
          height: 70,
          level: 2,
        ),
        const MindmapNode(
          id: 'bfs',
          text: 'BFS',
          position: Offset(760, 320),
          color: AppColors.circle_blue,
          width: 75,
          height: 75,
          level: 2,
        ),
        // YouTube 노드 예시 (Flutter 공식 영상 - 임베딩 허용)
        const MindmapNode(
          id: 'youtube-tutorial',
          text: 'Flutter 소개',
          position: Offset(400, 650),
          color: AppColors.pink,
          width: 80,
          height: 80,
          level: 2,
          contentType: NodeContentType.youtube,
          contentUrl: 'https://www.youtube.com/watch?v=fq4N0hgOWzU',
          description:
              '해당 영상은 SSAFY 15기 프로젝트 위한 학습 영상으로, AI 기반 자바와 지식 관리 도구인 Popo를 소개합니다. 이 어플리케이션을 통해 지식을 효과적으로 정리할 수 있으며, 추후 필요한 지식을 빠르게 검색할 수 있습니다.',
        ),
        // 이미지 노드 예시
        const MindmapNode(
          id: 'image-chart',
          text: '복잡도 비교',
          position: Offset(50, 420),
          color: AppColors.circle_skyblue,
          width: 75,
          height: 75,
          level: 2,
          contentType: NodeContentType.image,
          contentUrl: 'https://picsum.photos/400/300',
          description:
              '여러 이미지는 논은 주차장의 자동차 배치를 보여줍니다. 다양 알고리즘의 공간 및 시간 복잡도를 분석하고, 각각의 트레이드오프를 이해하는 데 도움을 줍니다. 이 이미지를 참고하여 효율적인 알고리즘을 선택할 수 있습니다.여러 이미지는 논은 주차장의 자동차 배치를 보여줍니다. 다양 알고리즘의 공간 및 시간 복잡도를 분석하고, 각각의 트레이드오프를 이해하는 데 도움을 줍니다. 이 이미지를 참고하여 효율적인 알고리즘을 선택할 수 있습니다.여러 이미지는 논은 주차장의 자동차 배치를 보여줍니다. 다양 알고리즘의 공간 및 시간 복잡도를 분석하고, 각각의 트레이드오프를 이해하는 데 도움을 줍니다. 이 이미지를 참고하여 효율적인 알고리즘을 선택할 수 있습니다.여러 이미지는 논은 주차장의 자동차 배치를 보여줍니다. 다양 알고리즘의 공간 및 시간 복잡도를 분석하고, 각각의 트레이드오프를 이해하는 데 도움을 줍니다. 이 이미지를 참고하여 효율적인 알고리즘을 선택할 수 있습니다.',
        ),
      ],
      edges: [
        // 중심에서 1차로
        const MindmapEdge(
          id: 'e1',
          fromNodeId: 'center',
          toNodeId: 'data-structure',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e2',
          fromNodeId: 'center',
          toNodeId: 'sorting',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e3',
          fromNodeId: 'center',
          toNodeId: 'graph',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e4',
          fromNodeId: 'center',
          toNodeId: 'dp',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        // 1차에서 2차로
        const MindmapEdge(
          id: 'e5',
          fromNodeId: 'data-structure',
          toNodeId: 'stack-queue',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        const MindmapEdge(
          id: 'e6',
          fromNodeId: 'data-structure',
          toNodeId: 'tree',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        const MindmapEdge(
          id: 'e7',
          fromNodeId: 'sorting',
          toNodeId: 'quick-sort',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        const MindmapEdge(
          id: 'e8',
          fromNodeId: 'sorting',
          toNodeId: 'merge-sort',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        const MindmapEdge(
          id: 'e9',
          fromNodeId: 'graph',
          toNodeId: 'dfs',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        const MindmapEdge(
          id: 'e10',
          fromNodeId: 'graph',
          toNodeId: 'bfs',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        // YouTube 노드 연결
        const MindmapEdge(
          id: 'e11',
          fromNodeId: 'center',
          toNodeId: 'youtube-tutorial',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        // 이미지 노드 연결
        const MindmapEdge(
          id: 'e12',
          fromNodeId: 'sorting',
          toNodeId: 'image-chart',
          color: Colors.grey,
          strokeWidth: 2,
        ),
      ],
    );
  }

  /// 프로젝트 기획 마인드맵
  static Mindmap getProjectMindmap() {
    return Mindmap(
      id: '2',
      title: '포포 프로젝트',
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
      nodes: [
        // 중심 노드
        const MindmapNode(
          id: 'center',
          text: '포포',
          position: Offset(400, 350),
          color: AppColors.deep_blue,
          width: 130,
          height: 130,
          level: 0,
        ),
        // 1차 노드들
        const MindmapNode(
          id: 'feature',
          text: '주요기능',
          position: Offset(220, 220),
          color: AppColors.circle_pink,
          width: 95,
          height: 95,
          level: 1,
        ),
        const MindmapNode(
          id: 'design',
          text: '디자인',
          position: Offset(600, 220),
          color: AppColors.circle_yellow,
          width: 90,
          height: 90,
          level: 1,
        ),
        const MindmapNode(
          id: 'tech',
          text: '기술스택',
          position: Offset(200, 480),
          color: AppColors.circle_orange,
          width: 100,
          height: 100,
          level: 1,
        ),
        const MindmapNode(
          id: 'schedule',
          text: '일정',
          position: Offset(580, 480),
          color: AppColors.purple,
          width: 85,
          height: 85,
          level: 1,
        ),
        // 2차 노드들
        const MindmapNode(
          id: 'voice',
          text: '음성녹음',
          position: Offset(80, 140),
          color: AppColors.circle_skyblue,
          width: 75,
          height: 75,
          level: 2,
        ),
        const MindmapNode(
          id: 'mindmap',
          text: '마인드맵',
          position: Offset(100, 320),
          color: AppColors.circle_green,
          width: 80,
          height: 80,
          level: 2,
        ),
      ],
      edges: [
        const MindmapEdge(
          id: 'e1',
          fromNodeId: 'center',
          toNodeId: 'feature',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e2',
          fromNodeId: 'center',
          toNodeId: 'design',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e3',
          fromNodeId: 'center',
          toNodeId: 'tech',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e4',
          fromNodeId: 'center',
          toNodeId: 'schedule',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e5',
          fromNodeId: 'feature',
          toNodeId: 'voice',
          color: Colors.grey,
          strokeWidth: 2,
        ),
        const MindmapEdge(
          id: 'e6',
          fromNodeId: 'feature',
          toNodeId: 'mindmap',
          color: Colors.grey,
          strokeWidth: 2,
        ),
      ],
    );
  }

  /// 여행 계획 마인드맵
  static Mindmap getTravelMindmap() {
    return Mindmap(
      id: '3',
      title: '제주도 여행',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      nodes: [
        const MindmapNode(
          id: 'center',
          text: '제주여행',
          position: Offset(400, 350),
          color: AppColors.circle_skyblue,
          width: 130,
          height: 130,
          level: 0,
        ),
        const MindmapNode(
          id: 'day1',
          text: '1일차',
          position: Offset(250, 240),
          color: AppColors.pink,
          width: 90,
          height: 90,
          level: 1,
        ),
        const MindmapNode(
          id: 'day2',
          text: '2일차',
          position: Offset(580, 240),
          color: AppColors.circle_yellow,
          width: 95,
          height: 95,
          level: 1,
        ),
        const MindmapNode(
          id: 'day3',
          text: '3일차',
          position: Offset(220, 480),
          color: AppColors.circle_green,
          width: 85,
          height: 85,
          level: 1,
        ),
        const MindmapNode(
          id: 'food',
          text: '맛집',
          position: Offset(600, 480),
          color: AppColors.circle_orange,
          width: 100,
          height: 100,
          level: 1,
        ),
      ],
      edges: [
        const MindmapEdge(
          id: 'e1',
          fromNodeId: 'center',
          toNodeId: 'day1',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e2',
          fromNodeId: 'center',
          toNodeId: 'day2',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e3',
          fromNodeId: 'center',
          toNodeId: 'day3',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
        const MindmapEdge(
          id: 'e4',
          fromNodeId: 'center',
          toNodeId: 'food',
          color: Colors.grey,
          strokeWidth: 2.5,
        ),
      ],
    );
  }

  /// ID로 마인드맵 가져오기
  static Mindmap? getMindmapById(String id) {
    switch (id) {
      case '1':
        return getAlgorithmMindmap();
      case '2':
        return getProjectMindmap();
      case '3':
        return getTravelMindmap();
      default:
        return null;
    }
  }
}
