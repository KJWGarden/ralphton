"use client";

import { ExternalLink, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMindmapStore } from "@/stores/mindmap-store";
import type { MindmapEdge, MindmapNode } from "@/types/analysis";

type MindmapPreviewProps = {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
};

export function MindmapPreview({ nodes, edges }: MindmapPreviewProps) {
  const selectedNodeIds = useMindmapStore((state) => state.selectedNodeIds);
  const focusedNodeId = useMindmapStore((state) => state.focusedNodeId);
  const toggleNodeSelection = useMindmapStore((state) => state.toggleNodeSelection);
  const setFocusedNodeId = useMindmapStore((state) => state.setFocusedNodeId);

  return (
    <Card className="min-h-[520px]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Mindmap
          </CardTitle>
          <Badge variant="secondary">{nodes.length} nodes</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1fr_240px]">
        <div className="relative min-h-[420px] overflow-hidden rounded-md border bg-neutral-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative flex h-full min-h-[420px] items-center justify-center p-6">
            <div className="grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-3">
              {nodes.map((node) => {
                const selected = selectedNodeIds.includes(node.id);
                const focused = focusedNodeId === node.id;

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={[
                      "min-h-24 rounded-md border bg-white/95 p-3 text-left text-neutral-950 shadow-lg transition",
                      selected ? "border-emerald-500 ring-2 ring-emerald-400" : "border-white/20",
                      focused ? "scale-[1.03]" : "",
                    ].join(" ")}
                    onClick={() => {
                      toggleNodeSelection(node.id);
                      setFocusedNodeId(node.id);
                    }}
                  >
                    <span className="mb-2 inline-flex rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                      {node.type}
                    </span>
                    <span className="block text-sm font-semibold leading-tight">{node.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Edges</h3>
            <div className="space-y-2">
              {edges.map((edge) => (
                <div key={`${edge.from}-${edge.to}`} className="rounded-md border p-2 text-xs">
                  <div className="font-medium">
                    {edge.from}
                    {" -> "}
                    {edge.to}
                  </div>
                  <div className="text-muted-foreground">{edge.label}</div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2" disabled={!focusedNodeId}>
            <ExternalLink className="h-4 w-4" />
            Open source
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
