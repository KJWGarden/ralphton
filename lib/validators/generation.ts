import { z } from "zod";

export const generationFormatSchema = z.enum(["ppt", "markdown", "sns_cards", "image"]);
export const generationToneSchema = z.enum(["professional", "friendly", "marketing", "report"]);
export const generationStylePresetSchema = z.enum([
  "executive_clean",
  "editorial_warm",
  "bold_social",
  "minimal_technical",
]);

export const generationRequestSchema = z.object({
  analysisId: z.string().min(1),
  nodeIds: z.array(z.string().min(1)).min(1),
  format: generationFormatSchema,
  tone: generationToneSchema,
  useImage: z.boolean(),
  stylePreset: generationStylePresetSchema,
  customStyle: z.string().trim().max(500).optional(),
});

export const generationContentSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  bodyMarkdown: z.string(),
  slides: z.array(
    z.object({
      title: z.string().min(1),
      bullets: z.array(z.string().min(1)),
      speakerNotes: z.string(),
    }),
  ),
  cards: z.array(
    z.object({
      headline: z.string().min(1),
      body: z.string().min(1),
      imagePrompt: z.string().min(1),
    }),
  ),
  imagePrompt: z.string(),
  downloadOptions: z.array(z.string().min(1)),
});

export const generationContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "bodyMarkdown", "slides", "cards", "imagePrompt", "downloadOptions"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    bodyMarkdown: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "bullets", "speakerNotes"],
        properties: {
          title: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
          },
          speakerNotes: { type: "string" },
        },
      },
    },
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["headline", "body", "imagePrompt"],
        properties: {
          headline: { type: "string" },
          body: { type: "string" },
          imagePrompt: { type: "string" },
        },
      },
    },
    imagePrompt: { type: "string" },
    downloadOptions: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;
export type GenerationContentInput = z.infer<typeof generationContentSchema>;
