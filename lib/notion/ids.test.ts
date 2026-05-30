import { describe, expect, it } from "vitest";
import { extractNotionId, formatNotionId } from "./ids";

describe("formatNotionId", () => {
  it("formats a compact 32 character Notion ID as a UUID", () => {
    expect(formatNotionId("370f47dcd26280f6a4b5c18df5390cad")).toBe(
      "370f47dc-d262-80f6-a4b5-c18df5390cad",
    );
  });
});

describe("extractNotionId", () => {
  it("extracts the page ID from a Notion copy link", () => {
    expect(
      extractNotionId(
        "https://www.notion.so/Codex-Community-Meetup-Busan-Mini-Ralphthon-with-Codex-Goal-370f47dcd26280f6a4b5c18df5390cad?source=copy_link",
      ),
    ).toBe("370f47dc-d262-80f6-a4b5-c18df5390cad");
  });

  it("accepts an already hyphenated Notion UUID", () => {
    expect(extractNotionId("370f47dc-d262-80f6-a4b5-c18df5390cad")).toBe(
      "370f47dc-d262-80f6-a4b5-c18df5390cad",
    );
  });

  it("extracts IDs from Notion page query parameters", () => {
    expect(
      extractNotionId("https://www.notion.so/workspace?v=abc&p=370f47dcd26280f6a4b5c18df5390cad"),
    ).toBe("370f47dc-d262-80f6-a4b5-c18df5390cad");
  });

  it("returns null for invalid input", () => {
    expect(extractNotionId("not a notion id")).toBeNull();
  });
});
