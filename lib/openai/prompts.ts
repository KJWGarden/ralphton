import type { NormalizedNotionData } from "@/types/notion";

export const analysisSystemPrompt = [
  "You structure Notion data into JSON for a web UI.",
  "Do not invent facts that are absent from the source.",
  "Return only valid JSON.",
  "Merge duplicate ideas and keep summaries short.",
  "Put weak inferences in assumptions.",
].join("\n");

export function createAnalysisUserPrompt(data: NormalizedNotionData) {
  return [
    "Analyze the normalized Notion data and return the fixed screen JSON schema.",
    "Required fields: title, oneLineSummary, summaryCards, sections, mindmap, keywords, assumptions.",
    "NOTION_DATA:",
    JSON.stringify(data),
  ].join("\n\n");
}
