import type { AnalyzeRequestInput } from "@/lib/validators/analysis";
import type { NormalizedNotionData, NormalizedNotionBlock } from "@/types/notion";

const sampleBlocks: NormalizedNotionBlock[] = [
  {
    id: "block_problem",
    type: "heading_1",
    text: "Problem",
    children: [
      {
        id: "block_problem_detail",
        type: "paragraph",
        text: "Users keep important work in Notion but spend extra time finding relationships and turning pages into reusable content.",
        children: [],
      },
    ],
  },
  {
    id: "block_scope",
    type: "heading_1",
    text: "MVP Scope",
    children: [
      {
        id: "block_scope_notion",
        type: "bulleted_list_item",
        text: "Collect a page or data source through a server-side Notion integration.",
        children: [],
      },
      {
        id: "block_scope_ai",
        type: "bulleted_list_item",
        text: "Normalize blocks before sending compact text and hierarchy to OpenAI.",
        children: [],
      },
      {
        id: "block_scope_view",
        type: "bulleted_list_item",
        text: "Return screen-ready JSON for cards, sections, keywords, and a mindmap graph.",
        children: [],
      },
    ],
  },
];

function notionUrl(id: string) {
  return `https://www.notion.so/${id.replaceAll("-", "")}`;
}

export function createMockNormalizedNotionData(input: AnalyzeRequestInput): NormalizedNotionData {
  if (input.sourceType === "page") {
    return {
      sourceType: "page",
      pageId: input.pageId,
      pageTitle: "Ralphton MVP source page",
      url: notionUrl(input.pageId),
      blocks: sampleBlocks,
    };
  }

  return {
    sourceType: "data_source",
    dataSourceId: input.dataSourceId,
    dataSourceTitle: "Ralphton source data",
    items: [
      {
        pageId: `${input.dataSourceId}_item_1`,
        title: "Notion analysis pipeline",
        url: notionUrl(input.dataSourceId),
        properties: {
          Status: "MVP",
          Priority: "High",
          IncludeContent: input.includePageContent,
        },
        blocks: input.includePageContent ? sampleBlocks : [],
      },
    ],
  };
}
