import { notionFetch } from "@/lib/notion/client";
import { normalizeBlock } from "@/lib/notion/normalize";
import { extractTitle, normalizeProperties } from "@/lib/notion/properties";
import type { AnalyzeRequestInput } from "@/lib/validators/analysis";
import type {
  NormalizedNotionBlock,
  NormalizedNotionData,
  NormalizedNotionDataSourceItem,
} from "@/types/notion";

type NotionPageResponse = {
  id: string;
  url?: string;
  properties?: Record<string, unknown>;
};

type NotionBlockResponse = {
  id?: string;
  type?: string;
  has_children?: boolean;
  children?: NotionBlockResponse[];
  [key: string]: unknown;
};

type NotionListResponse<T> = {
  results?: T[];
  has_more?: boolean;
  next_cursor?: string | null;
};

async function retrievePage(pageId: string) {
  return notionFetch<NotionPageResponse>(`/pages/${pageId}`, {
    source: "page",
  });
}

async function listBlockChildren(blockId: string, cursor?: string) {
  const query = new URLSearchParams({ page_size: "100" });

  if (cursor) {
    query.set("start_cursor", cursor);
  }

  return notionFetch<NotionListResponse<NotionBlockResponse>>(
    `/blocks/${blockId}/children?${query.toString()}`,
    {
      source: "page",
    },
  );
}

async function queryDataSource(dataSourceId: string, pageSize: number, cursor?: string) {
  return notionFetch<NotionListResponse<NotionPageResponse>>(`/data_sources/${dataSourceId}/query`, {
    method: "POST",
    source: "data_source",
    body: {
      page_size: pageSize,
      start_cursor: cursor,
    },
  });
}

async function collectBlockTree(blockId: string): Promise<NormalizedNotionBlock[]> {
  const blocks: NormalizedNotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const response = await listBlockChildren(blockId, cursor);
    const results = response.results ?? [];

    for (const block of results) {
      const childBlocks = block.has_children && block.id ? await collectBlockTree(block.id) : [];
      blocks.push(normalizeBlock({ ...block, children: childBlocks }));
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

async function collectPage(pageId: string): Promise<NormalizedNotionData> {
  const page = await retrievePage(pageId);

  return {
    sourceType: "page",
    pageId: page.id,
    pageTitle: extractTitle(page.properties, page.id),
    url: page.url ?? "",
    blocks: await collectBlockTree(page.id),
  };
}

async function collectDataSource(input: Extract<AnalyzeRequestInput, { sourceType: "data_source" }>) {
  const items: NormalizedNotionDataSourceItem[] = [];
  let cursor: string | undefined;

  do {
    const remaining = input.limit - items.length;
    const response = await queryDataSource(input.dataSourceId, Math.min(remaining, 100), cursor);
    const results = response.results ?? [];

    for (const page of results) {
      items.push({
        pageId: page.id,
        title: extractTitle(page.properties, page.id),
        url: page.url ?? "",
        properties: normalizeProperties(page.properties),
        blocks: input.includePageContent ? await collectBlockTree(page.id) : [],
      });

      if (items.length >= input.limit) {
        break;
      }
    }

    cursor = items.length < input.limit ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return {
    sourceType: "data_source" as const,
    dataSourceId: input.dataSourceId,
    dataSourceTitle: input.dataSourceId,
    items,
  };
}

export function collectNotionData(input: AnalyzeRequestInput): Promise<NormalizedNotionData> {
  if (input.sourceType === "page") {
    return collectPage(input.pageId);
  }

  return collectDataSource(input);
}
