"use client";

import { Download, FileText, ImageIcon, Loader2, Presentation, Rows3, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generationFormats, generationStylePresets, generationTones } from "@/lib/generation/options";
import { useCreateGeneration } from "@/hooks/queries/use-generation";
import { useMindmapStore } from "@/stores/mindmap-store";
import type {
  GenerationFormat,
  GenerationResponse,
  GenerationStylePreset,
  GenerationTone,
} from "@/types/generation";
import type { MindmapNode } from "@/types/analysis";

type GenerationPanelProps = {
  analysisId: string;
  nodes: MindmapNode[];
};

const formatIcons: Record<GenerationFormat, React.ReactNode> = {
  ppt: <Presentation className="h-4 w-4" />,
  markdown: <FileText className="h-4 w-4" />,
  sns_cards: <Rows3 className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
};

function GenerationPreview({ generation }: { generation: GenerationResponse }) {
  const imageAsset = generation.assets.find((asset) => asset.type === "image");
  const downloadableAssets = generation.assets.filter((asset) => asset.dataUrl || asset.url);

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{generation.content.title}</h3>
          <Badge variant="secondary">{generation.format}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{generation.content.summary}</p>
      </div>

      {generation.content.slides.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Slides</h4>
          {generation.content.slides.slice(0, 3).map((slide) => (
            <div key={slide.title} className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium">{slide.title}</div>
              <div className="text-muted-foreground">{slide.bullets.join(" / ")}</div>
            </div>
          ))}
        </div>
      ) : null}

      {generation.content.bodyMarkdown ? (
        <div className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-sm">
          <pre className="whitespace-pre-wrap font-sans">{generation.content.bodyMarkdown}</pre>
        </div>
      ) : null}

      {downloadableAssets.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {downloadableAssets.map((asset, index) => {
            const href = asset.dataUrl ?? asset.url;
            const label = asset.type === "pptx" ? "Download PPTX" : "Download image";

            return href ? (
              <Button key={`${asset.type}-${index}`} asChild variant="outline" size="sm" className="gap-2">
                <a href={href} download={"filename" in asset ? asset.filename : undefined}>
                  <Download className="h-4 w-4" />
                  {label}
                </a>
              </Button>
            ) : null;
          })}
        </div>
      ) : null}

      {imageAsset?.dataUrl || imageAsset?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageAsset.dataUrl ?? imageAsset.url}
          alt={generation.content.title}
          className="aspect-square w-full max-w-sm rounded-md border object-cover"
        />
      ) : null}
    </div>
  );
}

export function GenerationPanel({ analysisId, nodes }: GenerationPanelProps) {
  const selectedNodeIds = useMindmapStore((state) => state.selectedNodeIds);
  const focusedNodeId = useMindmapStore((state) => state.focusedNodeId);
  const fallbackNode = nodes.find((node) => node.sourceId || node.url) ?? nodes[0];
  const activeNodeIds =
    selectedNodeIds.length > 0
      ? selectedNodeIds
      : focusedNodeId
        ? [focusedNodeId]
        : fallbackNode
          ? [fallbackNode.id]
          : [];
  const selectedNodes = nodes.filter((node) => activeNodeIds.includes(node.id));
  const createGeneration = useCreateGeneration();
  const [format, setFormat] = useState<GenerationFormat>("ppt");
  const [tone, setTone] = useState<GenerationTone>("professional");
  const [useImage, setUseImage] = useState(false);
  const [stylePreset, setStylePreset] = useState<GenerationStylePreset>("executive_clean");
  const [customStyle, setCustomStyle] = useState("");
  const [generation, setGeneration] = useState<GenerationResponse | null>(null);

  function submit() {
    createGeneration.mutate(
      {
        analysisId,
        nodeIds: activeNodeIds,
        format,
        tone,
        useImage,
        stylePreset,
        customStyle: customStyle.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          setGeneration(response);
          toast.success("Generation is ready");
        },
        onError: () => {
          toast.error("Generation failed");
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Generate</CardTitle>
            <CardDescription>PPTX deck, MD, SNS cards, or image from selected nodes</CardDescription>
          </div>
          <Badge variant="secondary">{selectedNodes.length} selected</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {generationFormats.map((item) => (
            <button
              key={item.value}
              type="button"
              className={[
                "rounded-md border p-3 text-left text-sm transition",
                format === item.value ? "border-primary bg-primary text-primary-foreground" : "bg-background",
              ].join(" ")}
              onClick={() => setFormat(item.value)}
            >
              <span className="mb-2 flex items-center gap-2 font-medium">
                {formatIcons[item.value]}
                {item.label}
              </span>
              <span className="block text-xs opacity-80">{item.description}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tone">
              Tone
            </label>
            <select
              id="tone"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={tone}
              onChange={(event) => setTone(event.target.value as GenerationTone)}
            >
              {generationTones.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
            <span>
              <span className="block font-medium">Visual asset generation</span>
              <span className="text-muted-foreground">Adds a GPT Image 2 image; PPT still exports PPTX</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-input"
              checked={useImage || format === "image"}
              disabled={format === "image"}
              onChange={(event) => setUseImage(event.target.checked)}
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Style or theme</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {generationStylePresets.map((item) => (
              <button
                key={item.value}
                type="button"
                className={[
                  "rounded-md border p-3 text-left text-sm transition",
                  stylePreset === item.value ? "border-primary bg-secondary" : "bg-background",
                ].join(" ")}
                onClick={() => setStylePreset(item.value)}
              >
                <span className="block font-medium">{item.label}</span>
                <span className="block text-xs text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Optional custom style or theme"
            value={customStyle}
            onChange={(event) => setCustomStyle(event.target.value)}
          />
        </div>

        <Button className="w-full gap-2" disabled={activeNodeIds.length === 0 || createGeneration.isPending} onClick={submit}>
          {createGeneration.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
          Generate
        </Button>

        {generation ? <GenerationPreview generation={generation} /> : null}
      </CardContent>
    </Card>
  );
}
