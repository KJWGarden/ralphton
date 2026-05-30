import { randomUUID } from "crypto";
import type { AnalysisStatus, AnalysisStatusResponse, AnalysisViewResponse, ApiError } from "@/types/analysis";
import { createApiError } from "@/lib/analysis/errors";
import { NotionApiError } from "@/lib/notion/errors";
import { OpenAiAnalysisError } from "@/lib/openai/analyze";
import type { AnalyzeRequestInput } from "@/lib/validators/analysis";
import { runAnalysisPipeline } from "./pipeline";

type AnalysisRecord = {
  status: AnalysisStatus;
  view?: AnalysisViewResponse;
  error?: ApiError;
  createdAt: string;
  updatedAt: string;
};

const analyses = new Map<string, AnalysisRecord>();

async function processAnalysis(
  analysisId: string,
  input: AnalyzeRequestInput,
  createdAt: string,
) {
  try {
    const view = await runAnalysisPipeline(input);

    analyses.set(analysisId, {
      status: "completed",
      createdAt,
      updatedAt: new Date().toISOString(),
      view: {
        analysisId,
        status: "completed",
        ...view,
      },
    });
  } catch (error) {
    const apiError =
      error instanceof OpenAiAnalysisError
        ? createApiError(error.code, error.message)
        : error instanceof NotionApiError
          ? createApiError(error.code, error.message)
          : createApiError("OPENAI_REQUEST_FAILED");

    analyses.set(analysisId, {
      status: "failed",
      createdAt,
      updatedAt: new Date().toISOString(),
      error: apiError,
    });
  }
}

export function createAnalysis(input: AnalyzeRequestInput) {
  const analysisId = `analysis_${randomUUID()}`;
  const timestamp = new Date().toISOString();

  analyses.set(analysisId, {
    status: "processing",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  void processAnalysis(analysisId, input, timestamp);

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
    error: analysis.error,
  };
}

export function getAnalysisView(analysisId: string): AnalysisViewResponse | undefined {
  return analyses.get(analysisId)?.view;
}
