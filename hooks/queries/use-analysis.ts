"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnalysisStatusResponse,
  AnalysisViewResponse,
  AnalyzeRequest,
  AnalyzeResponse,
} from "@/types/analysis";

async function postJson<TResponse, TBody>(url: string, body: TBody): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

async function getJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AnalyzeRequest) =>
      postJson<AnalyzeResponse, AnalyzeRequest>("/api/notion/analyze", request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["analysis-status", data.analysisId] });
      void queryClient.invalidateQueries({ queryKey: ["analysis-view", data.analysisId] });
    },
  });
}

export function useAnalysisStatus(analysisId: string | null) {
  return useQuery({
    queryKey: ["analysis-status", analysisId],
    queryFn: () => getJson<AnalysisStatusResponse>(`/api/analyses/${analysisId}/status`),
    enabled: Boolean(analysisId),
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 1200 : false),
  });
}

export function useAnalysisView(analysisId: string | null, completed: boolean) {
  return useQuery({
    queryKey: ["analysis-view", analysisId],
    queryFn: () => getJson<AnalysisViewResponse>(`/api/analyses/${analysisId}/view`),
    enabled: Boolean(analysisId) && completed,
  });
}
