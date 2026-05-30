import OpenAI from "openai";
import { getOpenAiConfig, assertOpenAiConfigured } from "@/lib/openai/config";
import { stylePresetDescription } from "@/lib/generation/options";
import {
  generationContentJsonSchema,
  generationContentSchema,
  type GenerationRequestInput,
} from "@/lib/validators/generation";
import type { GenerationAsset, GenerationContent } from "@/types/generation";
import type { MindmapNode } from "@/types/analysis";

export class OpenAiGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAiGenerationError";
  }
}

function selectedNodeContext(nodes: MindmapNode[]) {
  return nodes
    .map((node) =>
      [
        `- ${node.label}`,
        node.summary ? `  summary: ${node.summary}` : "",
        node.url ? `  source: ${node.url}` : "",
        node.keywords?.length ? `  keywords: ${node.keywords.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}

function createGenerationPrompt(request: GenerationRequestInput, nodes: MindmapNode[]) {
  return [
    "Create a review-ready content draft from the selected Notion mindmap nodes.",
    `FORMAT: ${request.format}`,
    `TONE: ${request.tone}`,
    `STYLE_PRESET: ${stylePresetDescription(request.stylePreset)}`,
    request.customStyle ? `CUSTOM_STYLE: ${request.customStyle}` : "",
    "Rules:",
    "- Keep the output grounded in the provided nodes.",
    "- Return all fields in the JSON schema, using empty arrays or empty strings when a field does not apply.",
    "- For PPT, create 5-8 slides.",
    "- For Markdown, create a complete bodyMarkdown document.",
    "- For SNS cards, create 5-8 cards with image prompts.",
    "- For image, create one detailed imagePrompt.",
    "SELECTED_NODES:",
    selectedNodeContext(nodes),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function parseResponseJson(outputText: string): unknown {
  try {
    return JSON.parse(outputText);
  } catch {
    throw new OpenAiGenerationError("OpenAI returned invalid generation JSON.");
  }
}

export async function generateContentDraft(
  request: GenerationRequestInput,
  nodes: MindmapNode[],
): Promise<GenerationContent> {
  const config = assertOpenAiConfigured();
  const client = new OpenAI({ apiKey: config.apiKey });

  const response = await client.responses.create(
    {
      model: config.model,
      instructions:
        "You create structured content drafts for presentations, documentation, social card news, and visual generation. Return only valid JSON.",
      input: createGenerationPrompt(request, nodes),
      text: {
        format: {
          type: "json_schema",
          name: "generation_content",
          schema: generationContentJsonSchema,
          strict: true,
        },
      },
      max_output_tokens: 3000,
      temperature: 0.35,
      store: false,
    },
    { timeout: 45000 },
  );

  if (response.error) {
    throw new OpenAiGenerationError(response.error.message);
  }

  const validated = generationContentSchema.safeParse(parseResponseJson(response.output_text));

  if (!validated.success) {
    throw new OpenAiGenerationError("OpenAI generation JSON did not match the schema.");
  }

  return validated.data;
}

export async function generateImageAsset(
  request: GenerationRequestInput,
  content: GenerationContent,
): Promise<GenerationAsset | null> {
  if (!request.useImage && request.format !== "image" && request.format !== "sns_cards") {
    return null;
  }

  const config = getOpenAiConfig();

  if (!config.apiKey) {
    return null;
  }

  const prompt = [
    content.imagePrompt || content.cards[0]?.imagePrompt || content.title,
    `Style: ${stylePresetDescription(request.stylePreset)}`,
    request.customStyle ? `Custom theme: ${request.customStyle}` : "",
    "Use polished visual composition suitable for the requested content format.",
  ]
    .filter(Boolean)
    .join("\n");

  const client = new OpenAI({ apiKey: config.apiKey });
  const response = await client.images.generate(
    {
      model: config.imageModel,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "auto",
    },
    { timeout: 90000 },
  );

  const image = response.data?.[0];

  if (!image) {
    throw new OpenAiGenerationError("OpenAI image generation returned no image.");
  }

  return {
    type: "image",
    model: config.imageModel,
    mimeType: "image/png",
    dataUrl: image.b64_json ? `data:image/png;base64,${image.b64_json}` : undefined,
    url: image.url,
    prompt,
  };
}
