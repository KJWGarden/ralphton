import type { NextRequest } from "next/server";
import { createApiError, errorResponse } from "@/lib/analysis/errors";
import { getAnalysisStatus } from "@/lib/analysis/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> },
) {
  const { analysisId } = await params;
  const status = getAnalysisStatus(analysisId);

  if (!status) {
    return errorResponse(createApiError("ANALYSIS_NOT_FOUND"), 404);
  }

  return Response.json(status);
}
