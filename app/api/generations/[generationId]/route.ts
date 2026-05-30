import type { NextRequest } from "next/server";
import { createApiError, errorResponse } from "@/lib/analysis/errors";
import { getGeneration } from "@/lib/generation/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const { generationId } = await params;
  const generation = getGeneration(generationId);

  if (!generation) {
    return errorResponse(createApiError("ANALYSIS_NOT_FOUND", "Generation ID does not exist."), 404);
  }

  return Response.json(generation);
}
