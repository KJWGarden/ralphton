import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerationPanel } from "@/components/generation/generation-panel";
import { MindmapPreview } from "@/components/mindmap/mindmap-preview";
import type { AnalysisViewResponse } from "@/types/analysis";

type AnalysisResultProps = {
  loading: boolean;
  hasAnalysis: boolean;
  result?: AnalysisViewResponse;
};

export function AnalysisResult({ loading, hasAnalysis, result }: AnalysisResultProps) {
  if (loading) {
    return (
      <section className="grid gap-4">
        <div className="h-32 animate-pulse rounded-lg border bg-card" />
        <div className="h-[520px] animate-pulse rounded-lg border bg-card" />
      </section>
    );
  }

  if (!hasAnalysis || !result) {
    return (
      <section className="grid min-h-[calc(100vh-3rem)] place-items-center rounded-lg border border-dashed bg-background p-8 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-semibold">Notion analysis workspace</h1>
          <p className="text-sm text-muted-foreground">
            Enter a source ID to create the first analysis view.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{result.title}</CardTitle>
              <CardDescription className="max-w-3xl">{result.oneLineSummary}</CardDescription>
            </div>
            <Badge variant="secondary">{result.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {result.summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{card.title}</CardTitle>
                <Badge variant="secondary">{card.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{card.description}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <MindmapPreview nodes={result.mindmap.nodes} edges={result.mindmap.edges} />
        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {result.sections.map((section) => (
              <div key={section.heading} className="space-y-2">
                <h3 className="font-medium">{section.heading}</h3>
                <p className="text-sm text-muted-foreground">{section.summary}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <GenerationPanel analysisId={result.analysisId} nodes={result.mindmap.nodes} />
    </section>
  );
}
