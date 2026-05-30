import OpenAI from "openai";
import { createAnalysisUserPrompt, analysisSystemPrompt } from "@/lib/openai/prompts";
import { assertOpenAiConfigured } from "@/lib/openai/config";
import { analysisViewJsonSchema, analysisViewSchema } from "@/lib/validators/analysis";
import type { ApiErrorCode, AnalysisView } from "@/types/analysis";
import type { NormalizedNotionData } from "@/types/notion";

export class OpenAiAnalysisError extends Error {
  constructor(
    message: string,
    readonly code: Extract<ApiErrorCode, "OPENAI_REQUEST_FAILED" | "OPENAI_INVALID_JSON">,
  ) {
    super(message);
    this.name = "OpenAiAnalysisError";
  }
}

function parseResponseJson(outputText: string): unknown {
  try {
    return JSON.parse(outputText);
  } catch {
    throw new OpenAiAnalysisError("OpenAI returned invalid JSON.", "OPENAI_INVALID_JSON");
  }
}

export async function generateAnalysisView(data: NormalizedNotionData): Promise<AnalysisView> {
  const config = assertOpenAiConfigured();
  const client = new OpenAI({ apiKey: config.apiKey });

  try {
    const response = await client.responses.create(
      {
        model: config.model,
        instructions: analysisSystemPrompt,
        input: createAnalysisUserPrompt(data),
        text: {
          format: {
            type: "json_schema",
            name: "analysis_view",
            schema: analysisViewJsonSchema,
            strict: true,
          },
        },
        max_output_tokens: 3500,
        temperature: 0.2,
        store: false,
      },
      { timeout: 45000 },
    );

    if (response.error) {
      throw new OpenAiAnalysisError(response.error.message, "OPENAI_REQUEST_FAILED");
    }

    const parsed = parseResponseJson(response.output_text);
    const validated = analysisViewSchema.safeParse(parsed);

    if (!validated.success) {
      throw new OpenAiAnalysisError("OpenAI JSON did not match the analysis schema.", "OPENAI_INVALID_JSON");
    }

    return validated.data;
  } catch (error) {
    if (error instanceof OpenAiAnalysisError) {
      throw error;
    }

    throw new OpenAiAnalysisError(
      error instanceof Error ? error.message : "OpenAI request failed.",
      "OPENAI_REQUEST_FAILED",
    );
  }
}
