import { createMockAnalysisView } from "@/lib/analysis/mock-data";
import { collectNotionData } from "@/lib/notion/collect";
import { generateAnalysisView } from "@/lib/openai/analyze";
import { createMockNormalizedNotionData } from "@/lib/notion/mock-data";
import type { AnalyzeRequestInput } from "@/lib/validators/analysis";
import type { AnalysisView } from "@/types/analysis";

function getSourceLabel(input: AnalyzeRequestInput) {
  return input.sourceType === "page" ? input.pageId : input.dataSourceId;
}

export async function runAnalysisPipeline(input: AnalyzeRequestInput): Promise<AnalysisView> {
  const normalizedData = process.env.NOTION_TOKEN
    ? await collectNotionData(input)
    : createMockNormalizedNotionData(input);

  if (!process.env.OPENAI_API_KEY) {
    return createMockAnalysisView(getSourceLabel(input));
  }

  return generateAnalysisView(normalizedData);
}
