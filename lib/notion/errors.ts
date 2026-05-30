import type { ApiErrorCode } from "@/types/analysis";

export class NotionApiError extends Error {
  constructor(
    message: string,
    readonly code: Extract<
      ApiErrorCode,
      | "NOTION_ACCESS_DENIED"
      | "NOTION_PAGE_NOT_FOUND"
      | "NOTION_DATA_SOURCE_NOT_FOUND"
      | "NOTION_RATE_LIMITED"
    >,
  ) {
    super(message);
    this.name = "NotionApiError";
  }
}

export function notionErrorFromStatus(status: number, source: "page" | "data_source") {
  if (status === 401 || status === 403) {
    return new NotionApiError("Notion source is not connected to the integration.", "NOTION_ACCESS_DENIED");
  }

  if (status === 404 && source === "page") {
    return new NotionApiError("Notion page was not found.", "NOTION_PAGE_NOT_FOUND");
  }

  if (status === 404) {
    return new NotionApiError("Notion data source was not found.", "NOTION_DATA_SOURCE_NOT_FOUND");
  }

  if (status === 429) {
    return new NotionApiError("Notion rate limit was reached.", "NOTION_RATE_LIMITED");
  }

  return new NotionApiError("Notion request failed.", "NOTION_ACCESS_DENIED");
}
