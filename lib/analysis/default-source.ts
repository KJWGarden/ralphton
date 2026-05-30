import type { AnalyzeRequest } from "@/types/analysis";

export function getDefaultAnalyzeRequest(): AnalyzeRequest {
  const sourceType = process.env.NEXT_PUBLIC_DEFAULT_NOTION_SOURCE_TYPE;
  const sourceId = process.env.NEXT_PUBLIC_DEFAULT_NOTION_SOURCE_ID ?? "sample-page-id";

  if (sourceType === "data_source") {
    return {
      sourceType: "data_source",
      dataSourceId: sourceId,
      limit: 20,
      includePageContent: false,
    };
  }

  return {
    sourceType: "page",
    pageId: sourceId,
  };
}
