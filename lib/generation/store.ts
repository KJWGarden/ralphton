import { randomUUID } from "crypto";
import { getAnalysisView } from "@/lib/analysis/store";
import { createApiError } from "@/lib/analysis/errors";
import { generateContentDraft, generateImageAsset, OpenAiGenerationError } from "@/lib/openai/generate-content";
import type { ApiError } from "@/types/analysis";
import type { GenerationResponse } from "@/types/generation";
import type { GenerationRequestInput } from "@/lib/validators/generation";

const generations = new Map<string, GenerationResponse>();

type CreateGenerationResult =
  | {
      data: GenerationResponse;
      status: 200;
    }
  | {
      error: ApiError;
      status: number;
    };

function fallbackContent(request: GenerationRequestInput, title: string) {
  return {
    title,
    summary: "OpenAI key is not configured, so this is a local draft placeholder.",
    bodyMarkdown: `# ${title}\n\nSelect nodes and configure OpenAI to generate the final ${request.format} content.`,
    slides: [
      {
        title,
        bullets: ["Selected Notion nodes are ready", "Configure OpenAI to generate final content"],
        speakerNotes: "Placeholder speaker notes.",
      },
    ],
    cards: [
      {
        headline: title,
        body: "Selected Notion content is ready for card news generation.",
        imagePrompt: `Create a polished visual for ${title}`,
      },
    ],
    imagePrompt: `Create a polished visual for ${title}`,
    downloadOptions: request.format === "markdown" ? ["md", "pdf"] : ["pptx", "pdf", "png"],
  };
}

function downloadOptionsForFormat(format: GenerationRequestInput["format"]) {
  if (format === "ppt") {
    return ["pptx", "pdf"];
  }

  if (format === "markdown") {
    return ["md", "pdf"];
  }

  if (format === "sns_cards") {
    return ["png", "pdf"];
  }

  return ["png"];
}

export async function createGeneration(request: GenerationRequestInput): Promise<CreateGenerationResult> {
  const analysis = getAnalysisView(request.analysisId);

  if (!analysis) {
    return { error: createApiError("ANALYSIS_NOT_FOUND"), status: 404 };
  }

  const sourceNodes = analysis.mindmap.nodes.filter((node) => request.nodeIds.includes(node.id));

  if (sourceNodes.length === 0) {
    return { error: createApiError("VALIDATION_ERROR", "Selected nodes were not found."), status: 422 };
  }

  try {
    const content = process.env.OPENAI_API_KEY
      ? await generateContentDraft(request, sourceNodes)
      : fallbackContent(request, sourceNodes[0].label);
    content.downloadOptions = downloadOptionsForFormat(request.format);
    const imageAsset = await generateImageAsset(request, content);
    const generationId = `generation_${randomUUID()}`;
    const response: GenerationResponse = {
      generationId,
      status: "reviewing",
      format: request.format,
      sourceNodes,
      content,
      assets: imageAsset ? [imageAsset] : [],
    };

    generations.set(generationId, response);
    return { data: response, status: 200 };
  } catch (error) {
    const apiError: ApiError =
      error instanceof OpenAiGenerationError
        ? createApiError("OPENAI_REQUEST_FAILED", error.message)
        : createApiError("OPENAI_REQUEST_FAILED");

    return { error: apiError, status: 500 };
  }
}

export function getGeneration(generationId: string) {
  return generations.get(generationId);
}
