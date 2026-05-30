import type { ApiError, ApiErrorCode } from "@/types/analysis";

const messages: Record<ApiErrorCode, string> = {
  NOTION_ACCESS_DENIED: "Notion page or data source is not connected to the integration.",
  NOTION_PAGE_NOT_FOUND: "Check the Notion page ID format and access.",
  NOTION_DATA_SOURCE_NOT_FOUND: "Check the Notion data source ID and connection access.",
  NOTION_RATE_LIMITED: "Notion rate limit was reached. Try again later.",
  OPENAI_REQUEST_FAILED: "Analysis generation failed.",
  OPENAI_INVALID_JSON: "AI response JSON was invalid and must be retried.",
  ANALYSIS_NOT_FOUND: "Analysis ID does not exist or has expired.",
  VALIDATION_ERROR: "Request payload is invalid.",
};

export function createApiError(code: ApiErrorCode, message = messages[code]): ApiError {
  return { code, message };
}

export function errorResponse(error: ApiError, status = 400) {
  return Response.json({ error }, { status });
}
