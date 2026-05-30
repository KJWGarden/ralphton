import { describe, expect, it } from "vitest";
import { generatePptxAsset } from "./pptx";
import type { GenerationContent } from "@/types/generation";

const content: GenerationContent = {
  title: "Codex Goal Presentation",
  summary: "Selected Notion content converted into a presentation deck.",
  bodyMarkdown: "",
  slides: [
    {
      title: "Goal Overview",
      bullets: ["Connect Notion knowledge", "Create reusable outputs"],
      speakerNotes: "Introduce the problem and the expected outcome.",
    },
    {
      title: "MVP Scope",
      bullets: ["Mindmap first screen", "PPTX generation", "Optional image generation"],
      speakerNotes: "Explain what is in scope for the MVP.",
    },
  ],
  cards: [],
  imagePrompt: "",
  downloadOptions: ["pptx", "pdf"],
};

describe("generatePptxAsset", () => {
  it("creates a downloadable PPTX asset from slide content", async () => {
    const asset = await generatePptxAsset(content);
    const encoded = asset.dataUrl.split(",")[1];

    expect(asset.type).toBe("pptx");
    expect(asset.filename).toBe("codex-goal-presentation.pptx");
    expect(asset.mimeType).toBe("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    expect(asset.dataUrl).toMatch(/^data:application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation;base64,/);
    expect(Buffer.from(encoded, "base64").subarray(0, 2).toString()).toBe("PK");
  });
});
