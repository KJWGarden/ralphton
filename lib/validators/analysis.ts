import { z } from "zod";

export const sourceTypeSchema = z.enum(["page", "data_source"]);

const notionIdSchema = z
  .string()
  .trim()
  .min(8, "Notion ID is required")
  .max(120, "Notion ID is too long");

export const analyzeRequestSchema = z.discriminatedUnion("sourceType", [
  z.object({
    sourceType: z.literal("page"),
    pageId: notionIdSchema,
  }),
  z.object({
    sourceType: z.literal("data_source"),
    dataSourceId: notionIdSchema,
    limit: z.coerce.number().int().min(1).max(20).default(20),
    includePageContent: z.coerce.boolean().default(false),
  }),
]);

export const analysisStatusSchema = z.enum(["processing", "completed", "failed"]);

export const analysisViewSchema = z.object({
  title: z.string().min(1),
  oneLineSummary: z.string().min(1),
  summaryCards: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
  sections: z.array(
    z.object({
      heading: z.string().min(1),
      summary: z.string().min(1),
      bullets: z.array(z.string().min(1)),
    }),
  ),
  mindmap: z.object({
    nodes: z.array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          type: z.enum(["root", "topic", "detail"]),
          sourceId: z.string().optional(),
          notionPageId: z.string().optional(),
          url: z.string().optional(),
          summary: z.string().optional(),
          keywords: z.array(z.string()).optional(),
        }),
      ),
    edges: z.array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        label: z.string().min(1),
      }),
    ),
  }),
  keywords: z.array(z.string().min(1)),
  assumptions: z.array(z.string()),
});

export const analysisViewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "oneLineSummary",
    "summaryCards",
    "sections",
    "mindmap",
    "keywords",
    "assumptions",
  ],
  properties: {
    title: { type: "string" },
    oneLineSummary: { type: "string" },
    summaryCards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "priority"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "summary", "bullets"],
        properties: {
          heading: { type: "string" },
          summary: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
    mindmap: {
      type: "object",
      additionalProperties: false,
      required: ["nodes", "edges"],
      properties: {
        nodes: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "label", "type"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              type: { type: "string", enum: ["root", "topic", "detail"] },
            },
          },
        },
        edges: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["from", "to", "label"],
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              label: { type: "string" },
            },
          },
        },
      },
    },
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    assumptions: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type AnalysisViewInput = z.infer<typeof analysisViewSchema>;
