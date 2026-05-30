"use client";

import { useState } from "react";
import { toast } from "sonner";
import { NotionSourceForm } from "@/components/notion/notion-source-form";
import { AnalysisResult } from "@/components/analysis/analysis-result";
import { StatusPanel } from "@/components/analysis/status-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysisStatus, useAnalysisView, useCreateAnalysis } from "@/hooks/queries/use-analysis";
import type { AnalyzeRequest } from "@/types/analysis";

export function AnalysisWorkspace() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const createAnalysis = useCreateAnalysis();
  const statusQuery = useAnalysisStatus(analysisId);
  const status = statusQuery.data?.status;
  const viewQuery = useAnalysisView(analysisId, status === "completed");

  function handleSubmit(request: AnalyzeRequest) {
    createAnalysis.mutate(request, {
      onSuccess: (response) => {
        setAnalysisId(response.analysisId);
      },
      onError: () => {
        toast.error("Analysis request failed");
      },
    });
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ralphton</CardTitle>
              <CardDescription>Notion source analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <NotionSourceForm pending={createAnalysis.isPending} onSubmit={handleSubmit} />
            </CardContent>
          </Card>
          <StatusPanel
            analysisId={analysisId}
            pending={createAnalysis.isPending || status === "processing"}
            status={status}
            error={statusQuery.error ?? viewQuery.error}
          />
        </aside>

        <AnalysisResult
          loading={viewQuery.isLoading}
          result={viewQuery.data}
          hasAnalysis={Boolean(analysisId)}
        />
      </div>
    </main>
  );
}
