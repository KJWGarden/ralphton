import { describe, expect, it } from "vitest";
import { blocksToPlainText, normalizeBlock } from "./normalize";

describe("normalizeBlock", () => {
  it("converts supported rich text blocks into plain text", () => {
    const block = normalizeBlock({
      id: "block_1",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { plain_text: "Notion " },
          { plain_text: "summary" },
        ],
      },
      children: [],
    });

    expect(block).toEqual({
      id: "block_1",
      type: "paragraph",
      text: "Notion summary",
      children: [],
    });
  });

  it("keeps nested children in the normalized tree", () => {
    const block = normalizeBlock({
      id: "parent",
      type: "toggle",
      toggle: {
        rich_text: [{ plain_text: "Parent" }],
      },
      children: [
        {
          id: "child",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ plain_text: "Child" }],
          },
        },
      ],
    });

    expect(block.children).toHaveLength(1);
    expect(block.children[0]).toMatchObject({
      id: "child",
      type: "bulleted_list_item",
      text: "Child",
    });
  });

  it("preserves unsupported blocks with minimal metadata", () => {
    const block = normalizeBlock({
      id: "unsupported_1",
      type: "bookmark",
      bookmark: {
        url: "https://example.com",
      },
    });

    expect(block).toEqual({
      id: "unsupported_1",
      type: "unsupported",
      text: "",
      children: [],
    });
  });
});

describe("blocksToPlainText", () => {
  it("renders nested normalized blocks as indented text", () => {
    expect(
      blocksToPlainText([
        {
          id: "root",
          type: "heading_1",
          text: "Root",
          children: [
            {
              id: "child",
              type: "paragraph",
              text: "Child",
              children: [],
            },
          ],
        },
      ]),
    ).toBe("Root\n  Child");
  });
});
