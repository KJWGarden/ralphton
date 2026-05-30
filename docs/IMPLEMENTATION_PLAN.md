# Implementation Plan

This plan follows `RULES.md` and keeps the first milestone focused on a working Notion analysis contract before expanding into 3D rendering and content export.

## Current baseline

- Project scaffold: Next.js App Router, TypeScript, TailwindCSS, shadcn-style UI components.
- API contract: `POST /api/notion/analyze`, `GET /api/analyses/{analysisId}/status`, `GET /api/analyses/{analysisId}/view`.
- State split: TanStack Query for server data, Zustand for mindmap interaction state.
- Provider boundary: Notion and OpenAI config files exist, but real provider calls are intentionally not wired until keys and fixtures are ready.
- Local mock: analysis API returns deterministic mock screen JSON so the UI contract can be tested without secrets.

## Milestone 1: Provider integration

1. Implement Notion client in `lib/notion`.
2. Add recursive `blocks.children.list` collection.
3. Normalize page and data source responses into `types/notion.ts`.
4. Add block fixtures for the normalizer.
5. Replace mock analysis creation with real collect-normalize-analyze flow.

## Milestone 2: AI output validation

1. Call OpenAI with `lib/openai/prompts.ts`.
2. Parse model JSON strictly.
3. Validate output with `analysisViewSchema`.
4. Add retry behavior for invalid JSON.
5. Add long document section splitting at the 20,000 character boundary.

## Milestone 3: 3D mindmap

1. Replace the current HTML mindmap preview with React Three Fiber and Drei.
2. Render card-like vertices with stable dimensions.
3. Add click, selection, focus, and hover side panel behavior.
4. Add level-of-detail behavior for larger node counts.

## Milestone 4: Content generation and export

1. Add generation schemas and API routes.
2. Implement PPT, blog Markdown, and Instagram card draft creation.
3. Add review/edit screens.
4. Add export routes for `pptx`, `md`, `png`, and `pdf`.

## Verification target

- `npm run typecheck`
- `npm run build`
- Normalizer unit tests after fixtures are added
- API route tests for validation, provider errors, and missing analysis IDs
