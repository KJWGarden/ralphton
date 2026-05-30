"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { useMindmapStore } from "@/stores/mindmap-store";
import { computeMindmapLayout } from "@/lib/mindmap/layout";
import type { MindmapNode, MindmapEdge, MindmapNodeType } from "@/types/analysis";

const NODE_COLOR: Record<MindmapNodeType, string> = {
  root: "#f97316",
  topic: "#60a5fa",
  detail: "#a78bfa",
};

const NODE_SIZE: Record<MindmapNodeType, number> = {
  root: 0.55,
  topic: 0.38,
  detail: 0.24,
};

function NodeMesh({ node, position }: { node: MindmapNode; position: [number, number, number] }) {
  const { hoveredNodeId, selectedNodeIds, setHoveredNodeId, setFocusedNodeId, toggleNodeSelection } =
    useMindmapStore();
  const isHovered = hoveredNodeId === node.id;
  const isSelected = selectedNodeIds.includes(node.id);
  const size = NODE_SIZE[node.type];
  const color = isSelected ? "#fbbf24" : NODE_COLOR[node.type];

  return (
    <group position={position}>
      <mesh
        scale={isHovered || isSelected ? 1.25 : 1}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHoveredNodeId(node.id);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          setHoveredNodeId(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          setFocusedNodeId(node.id);
          toggleNodeSelection(node.id);
        }}
      >
        <sphereGeometry args={[size, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <Text
        position={[0, size + 0.28, 0]}
        fontSize={node.type === "root" ? 0.32 : 0.24}
        color="white"
        anchorX="center"
        anchorY="bottom"
        maxWidth={3.5}
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {node.label}
      </Text>
    </group>
  );
}

function EdgeLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  return <Line points={[from, to]} color="#374151" lineWidth={1.5} />;
}

type MindmapCanvasProps = {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
};

export function MindmapCanvas({ nodes, edges }: MindmapCanvasProps) {
  const positions = useMemo(() => computeMindmapLayout(nodes, edges), [nodes, edges]);

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 14, 16], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        {edges.map((edge, i) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) {
            return null;
          }
          return <EdgeLine key={i} from={from} to={to} />;
        })}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) {
            return null;
          }
          return <NodeMesh key={node.id} node={node} position={pos} />;
        })}
      </Suspense>
      <OrbitControls makeDefault enablePan dampingFactor={0.1} />
    </Canvas>
  );
}
