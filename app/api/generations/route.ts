import { createGeneration } from "@/lib/generation/store";
import { createApiError, errorResponse } from "@/lib/analysis/errors";
import { generationRequestSchema } from "@/lib/validators/generation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = generationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(createApiError("VALIDATION_ERROR"), 422);
  }

  const result = await createGeneration(parsed.data);

  if ("data" in result) {
    return Response.json(result.data);
  }

  return errorResponse(result.error, result.status);
}
