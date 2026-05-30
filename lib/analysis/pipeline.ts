import { createMockAnalysisView } from "@/lib/analysis/mock-data";
import { enrichAnalysisViewWithSources } from "@/lib/analysis/enrich";
import { collectNotionData } from "@/lib/notion/collect";
import { generateAnalysisView } from "@/lib/openai/analyze";
import { createMockNormalizedNotionData } from "@/lib/notion/mock-data";
import type { AnalyzeRequestInput } from "@/lib/validators/analysis";
import type { AnalysisView } from "@/types/analysis";

function getSourceLabel(input: AnalyzeRequestInput) {
  return input.sourceType === "page" ? input.pageId : input.dataSourceId;
}

function shouldUseMockNotion(input: AnalyzeRequestInput) {
  return getSourceLabel(input).startsWith("sample-");
}

export async function runAnalysisPipeline(input: AnalyzeRequestInput): Promise<AnalysisView> {
  const normalizedData = process.env.NOTION_TOKEN && !shouldUseMockNotion(input)
    ? await collectNotionData(input)
    : createMockNormalizedNotionData(input);

  if (!process.env.OPENAI_API_KEY) {
    return enrichAnalysisViewWithSources(createMockAnalysisView(getSourceLabel(input)), normalizedData);
  }

  return enrichAnalysisViewWithSources(await generateAnalysisView(normalizedData), normalizedData);
}
