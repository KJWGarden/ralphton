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
NOTION_TOKEN=secret_xxxxxxxxx
NOTION_VERSION=2026-03-11
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

Secrets must stay in `.env.local`; that file is ignored by Git.
