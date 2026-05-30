import type { MindmapNode, MindmapEdge } from "@/types/analysis";

export function computeMindmapLayout(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  if (nodes.length === 0) return positions;

  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  for (const edge of edges) {
    if (!childrenMap.has(edge.from)) childrenMap.set(edge.from, []);
    childrenMap.get(edge.from)!.push(edge.to);
    parentMap.set(edge.to, edge.from);
  }

  const root =
    nodes.find((n) => n.type === "root") ??
    nodes.find((n) => !parentMap.has(n.id)) ??
    nodes[0];

  positions.set(root.id, [0, 0, 0]);

  type QueueItem = {
    nodeId: string;
    parentPos: [number, number, number];
    angle: number;
    spread: number;
    depth: number;
  };

  const queue: QueueItem[] = [];
  const rootChildren = childrenMap.get(root.id) ?? [];
  const rootCount = rootChildren.length || 1;

  rootChildren.forEach((childId, i) => {
    queue.push({
      nodeId: childId,
      parentPos: [0, 0, 0],
      angle: (i / rootCount) * Math.PI * 2,
      spread: (Math.PI * 2) / rootCount,
      depth: 1,
    });
  });

  while (queue.length > 0) {
    const { nodeId, parentPos, angle, spread, depth } = queue.shift()!;
    const radius = depth === 1 ? 5 : 3;
    const pos: [number, number, number] = [
      parentPos[0] + Math.cos(angle) * radius,
      0,
      parentPos[2] + Math.sin(angle) * radius,
    ];
    positions.set(nodeId, pos);

    const children = childrenMap.get(nodeId) ?? [];
    const n = children.length || 1;
    children.forEach((childId, i) => {
      queue.push({
        nodeId: childId,
        parentPos: pos,
        angle: angle - spread / 2 + (spread / n) * (i + 0.5),
        spread: spread / 2,
        depth: depth + 1,
      });
    });
  }

  nodes.forEach((node, i) => {
    if (!positions.has(node.id)) {
      positions.set(node.id, [(i % 5) * 2.5, 0, -12 + Math.floor(i / 5) * 2.5]);
    }
  });

  return positions;
}
