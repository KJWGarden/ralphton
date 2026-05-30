"use client";

import { useMutation } from "@tanstack/react-query";
import type { GenerationRequest, GenerationResponse } from "@/types/generation";

async function postGeneration(request: GenerationRequest) {
  const response = await fetch("/api/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Generation failed with ${response.status}`);
  }

  return response.json() as Promise<GenerationResponse>;
}

export function useCreateGeneration() {
  return useMutation({
    mutationFn: postGeneration,
  });
}
