import { randomUUID } from "crypto";
import type { AnalysisStatusResponse, AnalysisViewResponse } from "@/types/analysis";
import type { AnalyzeRequestInput } from "@/lib/validators/analysis";
import { createMockAnalysisView } from "./mock-data";

type AnalysisRecord = {
  status: "completed";
  view: AnalysisViewResponse;
  createdAt: string;
};

const analyses = new Map<string, AnalysisRecord>();

function getSourceLabel(input: AnalyzeRequestInput) {
  return input.sourceType === "page" ? input.pageId : input.dataSourceId;
}

export function createAnalysis(input: AnalyzeRequestInput) {
  const analysisId = `analysis_${randomUUID()}`;
  const view = createMockAnalysisView(getSourceLabel(input));

  analyses.set(analysisId, {
    status: "completed",
    createdAt: new Date().toISOString(),
    view: {
      analysisId,
      status: "completed",
      ...view,
    },
  });

  return {
    analysisId,
    status: "processing" as const,
  };
}

export function getAnalysisStatus(analysisId: string): AnalysisStatusResponse | undefined {
  const analysis = analyses.get(analysisId);

  if (!analysis) {
    return undefined;
  }

  return {
    analysisId,
    status: analysis.status,
  };
}

export function getAnalysisView(analysisId: string): AnalysisViewResponse | undefined {
  return analyses.get(analysisId)?.view;
}
