import PptxGenJS from "pptxgenjs";
import type { GenerationContent, GenerationSlide, PptxGenerationAsset } from "@/types/generation";

const PPTX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;

function cleanText(value: string, fallback = "") {
  return value.replace(/\s+/g, " ").trim() || fallback;
}

function filenameFromTitle(title: string) {
  const base = cleanText(title, "ralphton-deck")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "ralphton-deck"}.pptx`;
}

function contentSlides(content: GenerationContent): GenerationSlide[] {
  if (content.slides.length > 0) {
    return content.slides;
  }

  return [
    {
      title: content.title,
      bullets: [content.summary].filter(Boolean),
      speakerNotes: content.summary,
    },
  ];
}

function addFooter(slide: PptxGenJS.Slide, index: number) {
  slide.addText("Ralphton", {
    x: 0.6,
    y: 7.05,
    w: 1.5,
    h: 0.18,
    fontSize: 7,
    color: "94A3B8",
    bold: true,
  });
  slide.addText(String(index).padStart(2, "0"), {
    x: 12.1,
    y: 7.02,
    w: 0.6,
    h: 0.22,
    fontSize: 8,
    color: "94A3B8",
    align: "right",
  });
}

function addTitleSlide(pptx: PptxGenJS, content: GenerationContent) {
  const slide = pptx.addSlide();
  slide.background = { color: "F8FAFC" };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: SLIDE_HEIGHT,
    fill: { color: "F8FAFC" },
    line: { color: "F8FAFC" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.16,
    h: SLIDE_HEIGHT,
    fill: { color: "2563EB" },
    line: { color: "2563EB" },
  });
  slide.addText("NOTION TO PRESENTATION", {
    x: 0.78,
    y: 0.75,
    w: 4,
    h: 0.28,
    fontSize: 8,
    color: "2563EB",
    bold: true,
  });
  slide.addText(cleanText(content.title, "Ralphton Presentation"), {
    x: 0.78,
    y: 1.42,
    w: 10.8,
    h: 1.25,
    fontFace: "Aptos Display",
    fontSize: 34,
    bold: true,
    color: "0F172A",
    fit: "shrink",
    margin: 0,
    breakLine: false,
  });
  slide.addText(cleanText(content.summary), {
    x: 0.82,
    y: 3.04,
    w: 8.3,
    h: 0.95,
    fontSize: 15,
    color: "475569",
    fit: "shrink",
    breakLine: false,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.82,
    y: 4.62,
    w: 3.7,
    h: 0.7,
    fill: { color: "DBEAFE" },
    line: { color: "DBEAFE" },
    rectRadius: 0.08,
  });
  slide.addText("Generated slide deck", {
    x: 1.08,
    y: 4.84,
    w: 3.2,
    h: 0.22,
    fontSize: 11,
    bold: true,
    color: "1D4ED8",
  });
  slide.addNotes(content.summary);
  addFooter(slide, 1);
}

function addAgendaSlide(pptx: PptxGenJS, slides: GenerationSlide[]) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addText("Agenda", {
    x: 0.65,
    y: 0.62,
    w: 4,
    h: 0.4,
    fontSize: 24,
    bold: true,
    color: "0F172A",
  });
  slides.slice(0, 8).forEach((item, itemIndex) => {
    const y = 1.45 + itemIndex * 0.58;
    slide.addText(String(itemIndex + 1).padStart(2, "0"), {
      x: 0.78,
      y,
      w: 0.45,
      h: 0.24,
      fontSize: 9,
      bold: true,
      color: "2563EB",
    });
    slide.addText(cleanText(item.title), {
      x: 1.38,
      y: y - 0.02,
      w: 10.3,
      h: 0.34,
      fontSize: 14,
      color: "1E293B",
      fit: "shrink",
    });
  });
  slide.addNotes(slides.map((item, index) => `${index + 1}. ${item.title}`).join("\n"));
  addFooter(slide, 2);
}

function addContentSlide(pptx: PptxGenJS, item: GenerationSlide, index: number) {
  const slide = pptx.addSlide();
  const bullets = item.bullets.length > 0 ? item.bullets : [item.speakerNotes].filter(Boolean);

  slide.background = { color: "FFFFFF" };
  slide.addText(cleanText(item.title, `Slide ${index}`), {
    x: 0.65,
    y: 0.56,
    w: 10.8,
    h: 0.58,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: "0F172A",
    fit: "shrink",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.67,
    y: 1.28,
    w: 0.8,
    h: 0.05,
    fill: { color: "2563EB" },
    line: { color: "2563EB" },
  });

  bullets.slice(0, 5).forEach((bullet, bulletIndex) => {
    const y = 1.72 + bulletIndex * 0.78;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.84,
      y: y + 0.05,
      w: 0.14,
      h: 0.14,
      fill: { color: "2563EB" },
      line: { color: "2563EB" },
      rectRadius: 0.04,
    });
    slide.addText(cleanText(bullet), {
      x: 1.18,
      y: y - 0.04,
      w: 9.85,
      h: 0.46,
      fontSize: 15,
      color: "334155",
      fit: "shrink",
      breakLine: false,
    });
  });

  if (item.speakerNotes) {
    slide.addNotes(item.speakerNotes);
  }

  addFooter(slide, index);
}

export async function generatePptxAsset(content: GenerationContent): Promise<PptxGenerationAsset> {
  const pptx = new PptxGenJS();
  const slides = contentSlides(content);

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Ralphton";
  pptx.company = "Ralphton";
  pptx.subject = cleanText(content.summary);
  pptx.title = cleanText(content.title, "Ralphton Presentation");
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
  };

  addTitleSlide(pptx, content);
  addAgendaSlide(pptx, slides);
  slides.forEach((slide, index) => addContentSlide(pptx, slide, index + 3));

  const output = await pptx.write({ outputType: "base64" });

  if (typeof output !== "string") {
    throw new Error("PPTX generation did not return base64 output.");
  }

  return {
    type: "pptx",
    mimeType: PPTX_MIME_TYPE,
    dataUrl: `data:${PPTX_MIME_TYPE};base64,${output}`,
    filename: filenameFromTitle(content.title),
  };
}
