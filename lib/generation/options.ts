import type {
  GenerationFormat,
  GenerationStylePreset,
  GenerationTone,
} from "@/types/generation";

export const generationFormats: Array<{
  value: GenerationFormat;
  label: string;
  description: string;
}> = [
  {
    value: "ppt",
    label: "PPT",
    description: "Downloadable slide deck with bullets and speaker notes.",
  },
  {
    value: "markdown",
    label: "MD",
    description: "Documentation-ready Markdown article.",
  },
  {
    value: "sns_cards",
    label: "SNS Cards",
    description: "Card news copy with image prompts.",
  },
  {
    value: "image",
    label: "Image",
    description: "Single visual concept generated from selected nodes.",
  },
];

export const generationTones: Array<{
  value: GenerationTone;
  label: string;
}> = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "marketing", label: "Marketing" },
  { value: "report", label: "Report" },
];

export const generationStylePresets: Array<{
  value: GenerationStylePreset;
  label: string;
  description: string;
}> = [
  {
    value: "executive_clean",
    label: "Executive Clean",
    description: "Quiet neutral layout, crisp hierarchy, boardroom-ready.",
  },
  {
    value: "editorial_warm",
    label: "Editorial Warm",
    description: "Magazine-like composition with warm photography direction.",
  },
  {
    value: "bold_social",
    label: "Bold Social",
    description: "High-contrast hook-first cards for mobile feeds.",
  },
  {
    value: "minimal_technical",
    label: "Minimal Technical",
    description: "Precise diagrams, subtle grid, product documentation feel.",
  },
];

export function stylePresetDescription(preset: GenerationStylePreset) {
  return generationStylePresets.find((style) => style.value === preset)?.description ?? "";
}
