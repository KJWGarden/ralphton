import type { NormalizedNotionBlock } from "@/types/notion";

type RichTextFragment = {
  plain_text?: unknown;
};

type NotionBlockLike = {
  id?: unknown;
  type?: unknown;
  has_children?: unknown;
  children?: unknown;
  [key: string]: unknown;
};

const supportedBlockTypes = new Set([
  "heading_1",
  "heading_2",
  "heading_3",
  "paragraph",
  "bulleted_list_item",
  "numbered_list_item",
  "to_do",
  "toggle",
  "quote",
  "callout",
  "code",
]);

function plainTextFromRichText(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((fragment: RichTextFragment) =>
      typeof fragment.plain_text === "string" ? fragment.plain_text : "",
    )
    .join("");
}

function getBlockText(block: NotionBlockLike, type: string) {
  const payload = block[type];

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const richText = (payload as { rich_text?: unknown }).rich_text;
  return plainTextFromRichText(richText).trim();
}

export function normalizeBlock(block: NotionBlockLike): NormalizedNotionBlock {
  const rawType = typeof block.type === "string" ? block.type : "unsupported";
  const type = supportedBlockTypes.has(rawType) ? rawType : "unsupported";
  const children = Array.isArray(block.children)
    ? block.children.map((child) => normalizeBlock(child as NotionBlockLike))
    : [];

  return {
    id: typeof block.id === "string" ? block.id : crypto.randomUUID(),
    type: type as NormalizedNotionBlock["type"],
    text: type === "unsupported" ? "" : getBlockText(block, type),
    children,
  };
}

export function blocksToPlainText(blocks: NormalizedNotionBlock[]) {
  const lines: string[] = [];

  function visit(block: NormalizedNotionBlock, depth: number) {
    if (block.text) {
      lines.push(`${"  ".repeat(depth)}${block.text}`);
    }

    block.children.forEach((child) => visit(child, depth + 1));
  }

  blocks.forEach((block) => visit(block, 0));
  return lines.join("\n");
}
