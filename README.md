# Ralphton

Ralphton turns Notion pages and data sources into screen-ready analysis JSON for cards, section summaries, keywords, and a mindmap graph.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS and shadcn-style UI primitives
- TanStack Query for server data
- Zustand for mindmap interaction state
- OpenAI Responses API for structured analysis JSON
- Notion Internal Connection API for page and data source collection

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required server environment variables:

```env
OPENAI_API_KEY=sk_xxxxxxxxx
OPENAI_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-2
NOTION_TOKEN=secret_xxxxxxxxx
NOTION_VERSION=2026-03-11
NEXT_PUBLIC_DEFAULT_NOTION_SOURCE_TYPE=page
NEXT_PUBLIC_DEFAULT_NOTION_SOURCE_ID=sample-page-id
```

`NOTION_TOKEN` is optional during early UI/API development. Without it, the analysis route uses mock normalized Notion data while still exercising the OpenAI structured output path when `OPENAI_API_KEY` is set.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Current API

- `POST /api/notion/analyze`
- `GET /api/analyses/{analysisId}/status`
- `GET /api/analyses/{analysisId}/view`
- `POST /api/generations`
- `GET /api/generations/{generationId}`

Secrets must stay in `.env.local`; that file is ignored by Git.

The first screen automatically starts an analysis using `NEXT_PUBLIC_DEFAULT_NOTION_SOURCE_TYPE` and `NEXT_PUBLIC_DEFAULT_NOTION_SOURCE_ID`. Set those values to a connected Notion page or data source to show a real initial mindmap.

Generation supports PPT drafts, Markdown documentation, SNS card news, and image concepts. Image generation uses `OPENAI_IMAGE_MODEL`, which defaults to `gpt-image-2`.
