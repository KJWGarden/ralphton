import { createAnalysis } from "@/lib/analysis/store";
import { createApiError, errorResponse } from "@/lib/analysis/errors";
import { analyzeRequestSchema } from "@/lib/validators/analysis";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = analyzeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(createApiError("VALIDATION_ERROR"), 422);
  }

  return Response.json(createAnalysis(parsed.data));
}
