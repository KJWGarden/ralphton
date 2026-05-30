"use client";

import dynamic from "next/dynamic";
import { ExternalLink, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMindmapStore } from "@/stores/mindmap-store";
import type { MindmapEdge, MindmapNode } from "@/types/analysis";

const MindmapCanvas = dynamic(
  () => import("./mindmap-canvas").then((m) => ({ default: m.MindmapCanvas })),
  { ssr: false, loading: () => <div className="h-full animate-pulse rounded bg-neutral-800" /> },
);

type MindmapPreviewProps = {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
};

export function MindmapPreview({ nodes, edges }: MindmapPreviewProps) {
  const focusedNodeId = useMindmapStore((state) => state.focusedNodeId);
  const focusedNode = nodes.find((node) => node.id === focusedNodeId) ?? nodes[0];

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
      <CardContent className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="min-h-[420px] overflow-hidden rounded-md border bg-neutral-950">
          <MindmapCanvas nodes={nodes} edges={edges} />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Selected data</h3>
            {focusedNode ? (
              <div className="space-y-3 rounded-md border p-3 text-sm">
                <div>
                  <div className="font-medium">{focusedNode.label}</div>
                  <div className="text-xs text-muted-foreground">{focusedNode.type}</div>
                </div>
                {focusedNode.summary ? (
                  <p className="text-muted-foreground">{focusedNode.summary}</p>
                ) : null}
                {focusedNode.keywords?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {focusedNode.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {focusedNode.url ? (
                  <Button asChild variant="outline" className="w-full gap-2">
                    <a href={focusedNode.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open Notion
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Relationships</h3>
            <div className="max-h-56 space-y-2 overflow-auto">
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
        </div>
      </CardContent>
    </Card>
  );
}
