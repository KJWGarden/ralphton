---
goal_id: ralphton-initial-goal-feature
status: completed
date: 2026-05-30
repository: https://github.com/KJWGarden/ralphton.git
branch: main
primary_docs:
  - MVP.md
  - RULES.md
  - prd_makeimage.txt
---

# Goal: Ralphton MVP Foundation

## Objective

`/Users/kimgarden/dev/ralphton` 폴더를 확인한 뒤, Ralphton의 goal 기능 구현을 시작할 수 있도록 필요한 파일을 생성하고 개선한다.

핵심 방향은 Notion 데이터를 서버에서 수집/정규화하고, OpenAI로 화면 표시용 JSON과 생성 초안을 만든 뒤, 초기 화면에서 마인드맵과 생성 기능을 바로 사용할 수 있는 MVP 기반을 준비하는 것이다.

## Source Context

- `MVP.md`: Notion 검색/분석, 3D 마인드맵, 노드 선택 기반 PPT/블로그/SNS 카드뉴스/이미지 생성 흐름 정의.
- `RULES.md`: Next.js App Router, TypeScript, TailwindCSS, shadcn/ui, Zustand, TanStack Query, Three.js, OpenAI, Notion Internal Connection 기준 구현 규칙.
- `prd_makeimage.txt`: Notion API 수집, 정규화, OpenAI JSON 생성, status/view API, 화면 렌더링 JSON 계약 정의.

## MVP Scope Applied

- Notion page 또는 data source 입력을 받는다.
- Notion API 호출은 서버에서만 수행한다.
- 원본 Notion JSON을 OpenAI에 직접 전달하지 않고 정규화 데이터만 전달한다.
- 분석 결과는 카드, 섹션, 키워드, 마인드맵 그래프로 렌더링 가능한 JSON으로 고정한다.
- 초기 화면에서 기본 Notion 소스를 자동 분석하고 마인드맵을 표시한다.
- 사용자는 마인드맵 노드를 클릭해 상세 정보를 읽고 Notion 원문으로 이동할 수 있다.
- 선택된 노드 또는 기본 source 노드를 기반으로 PPT, Markdown 문서, SNS 카드뉴스, 이미지 초안을 생성한다.
- 이미지 생성은 `OPENAI_IMAGE_MODEL=gpt-image-2` 기준으로 구성한다.
- 이미지 생성 여부는 toggle로 제어하고, 스타일/테마 추천 선택지와 사용자 직접 입력을 지원한다.

## Implementation Rules Applied

- Next.js App Router 기반으로 `app/`, `components/`, `hooks/`, `lib/`, `stores/`, `types/` 구조를 생성했다.
- API 입력은 zod schema로 검증한다.
- 서버 데이터 요청/캐시는 TanStack Query로 분리한다.
- 마인드맵 선택, hover, focus 같은 UI interaction 상태는 Zustand로 관리한다.
- OpenAI 응답은 structured output JSON schema와 zod로 검증한다.
- Notion token과 OpenAI key는 `.env.local`에만 두고 Git에 포함하지 않는다.
- shadcn 스타일 UI primitive와 lucide-react icon을 사용한다.
- 3D 마인드맵은 React Three Fiber/Drei 기반 canvas로 구성한다.
- 커밋 단위로 구현을 나누고 GitHub `main`에 지속적으로 push했다.

## Work Performed

### 1. Repository Scaffold

- 독립 Git 저장소를 `/Users/kimgarden/dev/ralphton`에 초기화했다.
- GitHub remote를 `https://github.com/KJWGarden/ralphton.git`로 설정했다.
- Next.js, TypeScript, TailwindCSS, ESLint, shadcn-style UI 설정을 추가했다.
- `.gitignore`, `.env.example`, `README.md`, `docs/IMPLEMENTATION_PLAN.md`를 추가했다.

### 2. Analysis API

- `POST /api/notion/analyze`
- `GET /api/analyses/{analysisId}/status`
- `GET /api/analyses/{analysisId}/view`

분석 요청은 즉시 `analysisId`를 반환하고, 서버 내부에서 background 방식으로 분석 상태를 `processing`, `completed`, `failed`로 갱신하도록 개선했다.

### 3. Notion Collection Layer

- Notion config, client, error mapper를 추가했다.
- Page retrieve, block children 재귀 수집, data source query 수집 로직을 추가했다.
- Notion block과 properties 정규화 로직을 추가했다.
- Notion token이 없거나 sample ID를 사용할 때는 mock normalized data로 동작하도록 했다.

### 4. OpenAI Analysis Pipeline

- OpenAI Responses API를 사용해 분석 결과를 structured JSON으로 생성한다.
- `analysisViewSchema`와 JSON schema를 통해 모델 출력을 검증한다.
- 응답 timeout을 추가해 OpenAI 요청이 무한 대기하지 않도록 했다.

### 5. Initial Mindmap UX

- 첫 화면에서 기본 Notion source를 자동 분석하도록 했다.
- 분석 결과의 source page/data source를 마인드맵 노드에 보강했다.
- React Three Fiber/Drei 기반 3D 마인드맵 canvas를 추가했다.
- 노드 클릭 시 focus와 selection이 동작하고, 상세 패널에서 요약/키워드/Notion 링크를 보여준다.

### 6. Generation Workflow

- `POST /api/generations`
- `GET /api/generations/{generationId}`

선택된 마인드맵 노드를 기반으로 다음 형식의 draft를 생성한다.

- `ppt`: 실제 발표용 PPTX slide deck, bullets, speaker notes
- `markdown`: 문서화용 Markdown
- `sns_cards`: SNS 카드뉴스 copy와 image prompt
- `image`: GPT Image 2 기반 이미지 asset

초기 노드가 명시적으로 선택되지 않아도 focused node 또는 source node를 자동으로 generation 대상에 포함하도록 수정했다.

`ppt` 형식은 draft JSON만 반환하지 않고, `pptxgenjs`로 실제 `.pptx` 파일 asset을 생성해 다운로드할 수 있도록 했다. 이미지 생성 toggle은 PPT 파일 생성이 아니라 별도의 시각 자료 생성 옵션으로 유지한다.

### 6.1 Mindmap Preview Sizing Fix

- 마인드맵 canvas가 작은 preview처럼 보이던 문제를 수정했다.
- Mindmap preview를 full-width section으로 분리하고 canvas에 안정적인 height/width를 부여했다.
- 상세 패널과 relationship 영역은 긴 텍스트가 layout을 밀지 않도록 `min-w-0`, wrapping, scrolling을 보강했다.

### 7. Image Generation Behavior

- 기본 이미지 모델을 `gpt-image-2`로 설정했다.
- `Image` 포맷은 이미지 생성이 필수다.
- `PPT`, `MD`, `SNS Cards`는 image generation toggle을 통해 이미지 생성 여부를 사용자가 선택할 수 있다.
- 스타일 preset을 제공한다.
  - Executive Clean
  - Editorial Warm
  - Bold Social
  - Minimal Technical
- custom style/theme 텍스트 입력을 OpenAI prompt에 반영한다.

### 8. Notion URL Input Support

- Notion copy link, hyphen 없는 32자리 ID, hyphen 포함 UUID를 모두 입력으로 받을 수 있도록 ID 추출 유틸을 추가했다.
- 예시 입력:

```text
https://www.notion.so/Codex-Community-Meetup-Busan-Mini-Ralphthon-with-Codex-Goal-370f47dcd26280f6a4b5c18df5390cad?source=copy_link
```

위 입력은 다음 page ID로 정규화된다.

```text
370f47dc-d262-80f6-a4b5-c18df5390cad
```

## Verification

실행한 검증:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- Browser check on `http://localhost:3000`
- API smoke checks for analysis and generation

확인된 생성 결과:

- PPT draft 생성 성공
- Markdown draft 생성 성공
- SNS card draft 생성 성공
- GPT Image 2 이미지 asset 생성 성공
- 실제 PPTX slide deck asset 생성 성공
- 초기 선택이 없어도 `Generate` 버튼 활성화 확인
- 마인드맵 preview가 넓은 canvas로 표시되는 것 확인

## Commits

- `0345d87` Initialize Ralphton app scaffold
- `508bb8f` Wire OpenAI analysis pipeline
- `0eb2c56` Add Notion collection layer
- `4058ead` Add Notion tests and project README
- `867a86e` Add initial mindmap and generation workflow
- `c32eacd` Make SNS image generation toggleable
- `f1c9643` Fix generation button activation
- `9f29979` Add goal summary and Notion URL parsing
- `7c46354` Fix mindmap preview sizing

## Current Known Gaps

- PPT는 실제 `.pptx` 다운로드까지 구현했다.
- `pdf`, `md`, `png` export 파일 생성은 아직 draft JSON 또는 이미지 asset 단계이며 후속 구현이 남아 있다.
- 생성 결과를 서버 재시작 후에도 유지하는 persistence layer가 아직 없다.
- Notion OAuth, 다중 사용자, 결제, 관리자 콘솔은 MVP 제외 범위로 남겨두었다.
- 대규모 Notion data source의 graph clustering과 LOD 최적화는 후속 작업이다.

## Next Goals

1. 실제 export API 확장: `md`, `png`, `pdf`.
2. 생성 결과 리뷰/수정 UI 강화.
3. Notion URL 입력 UX polish: 붙여넣기 즉시 ID preview 표시.
4. 분석/생성 결과 persistence 추가.
5. 3D 마인드맵 node card 렌더링과 camera focus interaction 개선.
