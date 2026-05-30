import type { AnalysisView } from "@/types/analysis";

export function createMockAnalysisView(sourceLabel: string): AnalysisView {
  return {
    title: `${sourceLabel} Analysis`,
    oneLineSummary:
      "Notion content is normalized into cards, sections, keywords, and a mindmap-ready graph.",
    summaryCards: [
      {
        title: "Normalized source",
        description: "Raw Notion blocks are reduced to plain text and hierarchy before AI processing.",
        priority: "high",
      },
      {
        title: "Screen-ready JSON",
        description: "The response shape is fixed so the frontend can render without raw provider data.",
        priority: "high",
      },
      {
        title: "Mindmap contract",
        description: "Nodes and edges are prepared separately from the 3D rendering layer.",
        priority: "medium",
      },
    ],
    sections: [
      {
        heading: "Collection",
        summary: "The server receives a Notion page or data source ID and owns provider access.",
        bullets: ["Token stays on the server", "Input is validated with zod", "Provider raw JSON is not exposed"],
      },
      {
        heading: "Normalization",
        summary: "Blocks are converted into a compact tree for analysis and later rendering.",
        bullets: ["Rich text becomes plain text", "Nested blocks stay nested", "Unsupported types keep minimal metadata"],
      },
      {
        heading: "Visualization",
        summary: "The view response gives the app enough data to show cards, sections, and graph nodes.",
        bullets: ["Summary cards", "Section bullets", "Mindmap nodes and edges"],
      },
    ],
    mindmap: {
      nodes: [
        { id: "root", label: sourceLabel, type: "root" },
        { id: "collect", label: "Collect", type: "topic" },
        { id: "normalize", label: "Normalize", type: "topic" },
        { id: "render", label: "Render", type: "topic" },
        { id: "validate", label: "Validate", type: "detail" },
      ],
      edges: [
        { from: "root", to: "collect", label: "starts with" },
        { from: "collect", to: "normalize", label: "feeds" },
        { from: "normalize", to: "render", label: "becomes" },
        { from: "normalize", to: "validate", label: "requires" },
      ],
    },
    keywords: ["Notion API", "OpenAI", "zod", "mindmap", "Next.js"],
    assumptions: ["This is mock data until NOTION_TOKEN and OPENAI_API_KEY are configured."],
  };
}
