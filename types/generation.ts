import type { MindmapNode } from "@/types/analysis";

export type GenerationFormat = "ppt" | "markdown" | "sns_cards" | "image";

export type GenerationTone = "professional" | "friendly" | "marketing" | "report";

export type GenerationStylePreset =
  | "executive_clean"
  | "editorial_warm"
  | "bold_social"
  | "minimal_technical";

export type GenerationStatus = "draft" | "reviewing" | "approved" | "exporting" | "exported" | "failed";

export type GenerationRequest = {
  analysisId: string;
  nodeIds: string[];
  format: GenerationFormat;
  tone: GenerationTone;
  useImage: boolean;
  stylePreset: GenerationStylePreset;
  customStyle?: string;
};

export type GenerationSlide = {
  title: string;
  bullets: string[];
  speakerNotes: string;
};

export type GenerationCard = {
  headline: string;
  body: string;
  imagePrompt: string;
};

export type GenerationContent = {
  title: string;
  summary: string;
  bodyMarkdown: string;
  slides: GenerationSlide[];
  cards: GenerationCard[];
  imagePrompt: string;
  downloadOptions: string[];
};

export type GenerationAsset = {
  type: "image";
  model: string;
  mimeType: string;
  dataUrl?: string;
  url?: string;
  prompt: string;
};

export type GenerationResponse = {
  generationId: string;
  status: GenerationStatus;
  format: GenerationFormat;
  sourceNodes: MindmapNode[];
  content: GenerationContent;
  assets: GenerationAsset[];
};
