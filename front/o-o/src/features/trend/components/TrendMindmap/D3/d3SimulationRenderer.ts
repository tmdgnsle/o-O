import * as d3 from "d3";
import type { Node, Link } from "../../../types/d3mindmapType";
import { getNodeSize } from "./d3NodeGenerator";

interface SimulationConfig {
  width: number;
  height: number;
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
}

export function setupSimulation(
  nodes: Node[],
  links: Link[],
  config: SimulationConfig
) {
  const { width, height, linkDistance, chargeStrength, collisionRadius } =
    config;

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink<Node, Link>(links)
        .id((d) => d.id)
        .distance(linkDistance)
    )
    .force("charge", d3.forceManyBody().strength(chargeStrength))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collision",
      d3.forceCollide().radius((d: any) => getNodeSize(d) / 2 + collisionRadius)
    )
    .alphaDecay(0.05);

  return simulation;
}

export function setupTickHandler(
  nodes: Node[],
  link: d3.Selection<SVGLineElement, Link, SVGGElement, unknown>,
  node: d3.Selection<SVGGElement, Node, SVGGElement, unknown>,
  width: number,
  height: number
) {
  return function ticked() {
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
  };
}

export function setupEndHandler(nodes: Node[]) {
  return function () {
    nodes.forEach((node) => {
      node.fx = node.x;
      node.fy = node.y;
    });
  };
}
