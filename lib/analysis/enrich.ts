import type { AnalysisView, MindmapNode } from "@/types/analysis";
import type { NormalizedNotionData, NormalizedNotionDataSourceItem } from "@/types/notion";

function nodeIdFromSourceId(sourceId: string) {
  return `source_${sourceId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function summarizeDataSourceItem(item: NormalizedNotionDataSourceItem) {
  const properties = Object.entries(item.properties)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);

  return properties.length > 0
    ? properties.join(" / ")
    : "Notion data source item ready for content generation.";
}

function mergeNodes(baseNodes: MindmapNode[], sourceNodes: MindmapNode[]) {
  const merged = new Map<string, MindmapNode>();

  for (const node of baseNodes) {
    merged.set(node.id, node);
  }

  for (const node of sourceNodes) {
    merged.set(node.id, {
      ...merged.get(node.id),
      ...node,
    });
  }

  return [...merged.values()];
}

export function enrichAnalysisViewWithSources(
  view: AnalysisView,
  data: NormalizedNotionData,
): AnalysisView {
  if (data.sourceType === "page") {
    const sourceNode: MindmapNode = {
      id: nodeIdFromSourceId(data.pageId),
      type: "root",
      label: data.pageTitle,
      sourceId: data.pageId,
      notionPageId: data.pageId,
      url: data.url,
      summary: view.oneLineSummary,
      keywords: view.keywords,
    };

    return {
      ...view,
      mindmap: {
        nodes: mergeNodes(view.mindmap.nodes, [sourceNode]),
        edges: [
          { from: sourceNode.id, to: "root", label: "analysis" },
          ...view.mindmap.edges,
        ],
      },
    };
  }

  const rootNode: MindmapNode = {
    id: nodeIdFromSourceId(data.dataSourceId),
    type: "root",
    label: data.dataSourceTitle,
    sourceId: data.dataSourceId,
    summary: `${data.items.length} Notion pages from the connected data source.`,
    keywords: view.keywords,
  };

  const itemNodes: MindmapNode[] = data.items.map((item) => ({
    id: nodeIdFromSourceId(item.pageId),
    type: "detail",
    label: item.title,
    sourceId: item.pageId,
    notionPageId: item.pageId,
    url: item.url,
    summary: summarizeDataSourceItem(item),
    keywords: view.keywords.slice(0, 5),
  }));

  return {
    ...view,
    mindmap: {
      nodes: mergeNodes(view.mindmap.nodes, [rootNode, ...itemNodes]),
      edges: [
        ...itemNodes.map((node) => ({
          from: rootNode.id,
          to: node.id,
          label: "page",
        })),
        ...view.mindmap.edges,
      ],
    },
  };
}
