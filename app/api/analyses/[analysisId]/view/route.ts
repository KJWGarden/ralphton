import type { NextRequest } from "next/server";
import { createApiError, errorResponse } from "@/lib/analysis/errors";
import { getAnalysisView } from "@/lib/analysis/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> },
) {
  const { analysisId } = await params;
  const view = getAnalysisView(analysisId);

  if (!view) {
    return errorResponse(createApiError("ANALYSIS_NOT_FOUND"), 404);
  }

  return Response.json(view);
}
