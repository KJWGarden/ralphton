export type NotionSourceType = "page" | "data_source";

export type AnalysisStatus = "processing" | "completed" | "failed";

export type SummaryPriority = "high" | "medium" | "low";

export type MindmapNodeType = "root" | "topic" | "detail";

export type ApiErrorCode =
  | "NOTION_ACCESS_DENIED"
  | "NOTION_PAGE_NOT_FOUND"
  | "NOTION_DATA_SOURCE_NOT_FOUND"
  | "NOTION_RATE_LIMITED"
  | "OPENAI_REQUEST_FAILED"
  | "OPENAI_INVALID_JSON"
  | "ANALYSIS_NOT_FOUND"
  | "VALIDATION_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
};

export type AnalyzeRequest =
  | {
      sourceType: "page";
      pageId: string;
    }
  | {
      sourceType: "data_source";
      dataSourceId: string;
      limit: number;
      includePageContent: boolean;
    };

export type AnalyzeResponse = {
  analysisId: string;
  status: AnalysisStatus;
};

export type AnalysisStatusResponse = {
  analysisId: string;
  status: AnalysisStatus;
  error?: ApiError;
};

export type SummaryCard = {
  title: string;
  description: string;
  priority: SummaryPriority;
};

export type AnalysisSection = {
  heading: string;
  summary: string;
  bullets: string[];
};

export type MindmapNode = {
  id: string;
  label: string;
  type: MindmapNodeType;
};

export type MindmapEdge = {
  from: string;
  to: string;
  label: string;
};

export type AnalysisView = {
  title: string;
  oneLineSummary: string;
  summaryCards: SummaryCard[];
  sections: AnalysisSection[];
  mindmap: {
    nodes: MindmapNode[];
    edges: MindmapEdge[];
  };
  keywords: string[];
  assumptions: string[];
};

export type AnalysisViewResponse = AnalysisView & {
  analysisId: string;
  status: "completed";
};
