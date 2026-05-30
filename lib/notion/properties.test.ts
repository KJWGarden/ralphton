import { describe, expect, it } from "vitest";
import { extractTitle, normalizeProperties } from "./properties";

describe("extractTitle", () => {
  it("returns the first Notion title property as plain text", () => {
    expect(
      extractTitle(
        {
          Name: {
            type: "title",
            title: [{ plain_text: "Project brief" }],
          },
        },
        "fallback",
      ),
    ).toBe("Project brief");
  });

  it("falls back when title text is empty", () => {
    expect(
      extractTitle(
        {
          Name: {
            type: "title",
            title: [],
          },
        },
        "fallback",
      ),
    ).toBe("fallback");
  });
});

describe("normalizeProperties", () => {
  it("normalizes common property types into primitive values", () => {
    expect(
      normalizeProperties({
        Name: {
          type: "title",
          title: [{ plain_text: "Roadmap" }],
        },
        Status: {
          type: "status",
          status: { name: "In Progress" },
        },
        Tags: {
          type: "multi_select",
          multi_select: [{ name: "AI" }, { name: "Notion" }],
        },
        Done: {
          type: "checkbox",
          checkbox: true,
        },
      }),
    ).toEqual({
      Name: "Roadmap",
      Status: "In Progress",
      Tags: ["AI", "Notion"],
      Done: true,
    });
  });
});
