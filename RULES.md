# 구현 규칙

## 1. 기본 원칙

- 제품은 Notion 데이터를 읽기 쉬운 화면 구조로 바꾸는 운영형 도구다.
- 사용자는 첫 화면에서 바로 Notion 소스를 입력하고 분석을 실행할 수 있어야 한다.
- 문서 정리, API, UI 모두 MVP 범위를 벗어난 기능을 먼저 만들지 않는다.
- 원본 Notion JSON을 그대로 OpenAI API에 전달하지 않는다.
- UI는 Next.js, TailwindCSS, shadcn/ui 조합으로 일관되게 구현한다.

## 2. 기술 스택

- Framework: Next.js App Router
- Language: TypeScript
- Styling: TailwindCSS
- UI: shadcn/ui
- Icons: lucide-react
- Form: react-hook-form, zod
- Server validation: zod
- Client state: Zustand
- Server state/query: TanStack Query
- Mindmap: Three.js, React Three Fiber, Drei
- Image export: html-to-image
- AI: OpenAI API
- Notion: Internal Connection 기반 Notion API

## 3. 디렉터리 규칙

```text
app/
  api/
    notion/
      analyze/
        route.ts
    analyses/
      [analysisId]/
        status/
          route.ts
        view/
          route.ts
  page.tsx
components/
  notion/
  analysis/
  mindmap/
  ui/
hooks/
  queries/
lib/
  notion/
  openai/
  analysis/
  validators/
stores/
types/
```

- `components/ui`는 shadcn/ui 생성 컴포넌트만 둔다.
- 도메인 컴포넌트는 `components/notion`, `components/analysis`, `components/mindmap`에 둔다.
- Notion API 호출 코드는 `lib/notion`에 둔다.
- OpenAI 호출 코드는 `lib/openai`에 둔다.
- 정규화와 분석 상태 관리는 `lib/analysis`에 둔다.
- API request/response schema는 `lib/validators`에 둔다.
- TanStack Query hook은 `hooks/queries`에 둔다.
- Zustand store는 `stores`에 둔다.

## 4. TypeScript 규칙

- 모든 API 입력은 zod schema로 검증한다.
- API 응답 타입은 명시적으로 정의한다.
- `any`는 사용하지 않는다. 외부 API raw response는 `unknown`으로 받은 뒤 정규화한다.
- Notion block type, AI output type, analysis status는 union type으로 고정한다.
- nullable 값은 UI로 전달하기 전에 기본값을 정한다.

## 5. Notion 연동 규칙

- Notion token은 서버 환경변수 `NOTION_TOKEN`으로만 접근한다.
- 프론트엔드에서 Notion API를 직접 호출하지 않는다.
- 페이지 본문은 `blocks.children.list`로 가져온다.
- `has_children`이 `true`인 블록은 재귀적으로 수집한다.
- data source 목록은 cursor 기반 페이지네이션을 처리한다.
- MVP의 data source 기본 조회 개수는 20개로 제한한다.
- connection이 없는 페이지/DB는 `NOTION_ACCESS_DENIED`로 처리한다.

## 6. 정규화 규칙

- OpenAI API에는 정규화된 텍스트와 계층 구조만 전달한다.
- rich text는 plain text로 합친다.
- 지원하지 않는 블록 타입은 버리지 말고 `unsupported` 타입으로 최소 정보만 보존한다.
- heading 계층은 섹션 분할 기준으로 사용한다.
- empty paragraph, divider 등 의미 없는 블록은 AI 입력에서 제외할 수 있다.
- 원문에 없는 결론은 만들지 않고 `assumptions`에 분리한다.

## 7. OpenAI 호출 규칙

- system prompt는 정보 구조화 역할만 담당한다.
- user prompt에는 정규화된 Notion 데이터와 출력 JSON schema를 포함한다.
- JSON 외 텍스트를 받으면 실패로 처리하거나 재시도한다.
- 출력은 zod schema로 검증한다.
- 20,000자 이하 정규화 텍스트는 단일 호출로 처리한다.
- 20,000자 초과 정규화 텍스트는 섹션별 요약 후 최종 통합한다.
- OpenAI raw response는 사용자에게 직접 노출하지 않는다.

## 8. API 규칙

- API route는 입력 검증, 서비스 호출, 응답 변환만 담당한다.
- 비즈니스 로직은 `lib` 내부 함수로 분리한다.
- 성공 응답은 항상 JSON으로 반환한다.
- 실패 응답은 `{ error: { code, message } }` 구조를 따른다.
- stack trace, token, raw provider response는 클라이언트 응답에 포함하지 않는다.
- 분석 상태는 `processing`, `completed`, `failed`만 사용한다.

## 8.1 상태 및 Query 관리 규칙

- Zustand는 클라이언트 UI 상태와 3D interaction 상태만 관리한다.
- TanStack Query는 서버 데이터 조회, 캐싱, 재시도, mutation, polling을 관리한다.
- Notion 검색 결과, 마인드맵 조회, 생성 결과 조회, export 상태 조회는 TanStack Query `useQuery`로 관리한다.
- 마인드맵 생성, 콘텐츠 생성, export 요청은 TanStack Query `useMutation`으로 관리한다.
- mutation 성공 후 관련 query key를 invalidate한다.
- 선택된 node IDs, hover node, focus node, panel open 상태, camera mode, graph filter는 Zustand로 관리한다.
- 서버에서 받은 원본 query response를 Zustand에 복사해 저장하지 않는다.
- Zustand에는 서버 저장 전 로컬 draft와 사용자의 현재 조작 상태만 둔다.
- query key는 도메인별로 고정한다. 예: `["notion-search", query]`, `["mindmap", mindmapId]`, `["generation", generationId]`.
- loading, error, empty, success 상태 UI는 TanStack Query 상태값을 기준으로 표시한다.

## 9. UI 스타일 규칙

- TailwindCSS utility class를 기본으로 사용한다.
- shadcn/ui 컴포넌트를 먼저 사용하고, 직접 만든 primitive는 최소화한다.
- 버튼, 입력, select, switch, accordion, dialog, tabs는 shadcn/ui 기준으로 통일한다.
- 아이콘은 lucide-react를 사용한다.
- 페이지는 대시보드형 레이아웃으로 구성한다.
- 카드 안에 또 다른 카드가 반복 중첩되지 않게 한다.
- 랜딩 페이지처럼 과한 히어로 섹션을 만들지 않는다.
- 색상은 neutral 기반에 상태색만 제한적으로 사용한다.

## 10. shadcn/ui 사용 규칙

- 분석 입력 패널은 `Card`, `Input`, `Select`, `Switch`, `Button`으로 구성한다.
- 상태 표시는 `Badge`, `Progress`, `Skeleton`, `Alert`를 사용한다.
- 결과 요약은 `Card`와 `Badge`로 표시한다.
- 섹션 상세는 `Accordion`으로 표시한다.
- JSON 보기와 미리보기 전환은 `Tabs`를 사용한다.
- 긴 JSON 또는 로그는 `ScrollArea` 안에 둔다.
- 위험한 재실행/삭제성 액션은 `AlertDialog`를 사용한다.
- toast는 `sonner`를 사용한다.

## 11. 레이아웃 규칙

- 첫 화면은 입력 영역과 결과 영역을 한 페이지에서 확인할 수 있게 구성한다.
- 데스크톱은 좌측 입력 패널, 우측 결과 패널의 2열 레이아웃을 기본으로 한다.
- 모바일은 입력, 상태, 결과 순서의 1열 레이아웃으로 전환한다.
- 고정폭 카드 남발 대신 화면 폭을 효율적으로 사용한다.
- 마인드맵 영역은 최소 높이를 고정해 로딩/결과 전환 시 레이아웃이 흔들리지 않게 한다.
- 텍스트가 버튼이나 배지 밖으로 넘치지 않게 한다.

## 12. 상태 UI 규칙

- 초기 상태: 입력 폼과 최근 분석 placeholder를 표시한다.
- 처리 중: progress, skeleton, 취소 불가 안내를 표시한다.
- 완료: summary cards, sections, mindmap, keywords를 표시한다.
- 실패: 복구 가능한 메시지와 원인별 action을 표시한다.
- 빈 결과: Notion 권한 또는 문서 내용 부족 가능성을 안내한다.

## 13. 에러 메시지 규칙

- `NOTION_ACCESS_DENIED`: Notion 페이지 또는 DB에 integration connection을 추가하라고 안내한다.
- `NOTION_PAGE_NOT_FOUND`: page ID 형식을 확인하라고 안내한다.
- `NOTION_DATA_SOURCE_NOT_FOUND`: data source ID와 connection 권한을 확인하라고 안내한다.
- `NOTION_RATE_LIMITED`: 잠시 후 재시도하라고 안내한다.
- `OPENAI_REQUEST_FAILED`: 분석 생성에 실패했음을 안내한다.
- `OPENAI_INVALID_JSON`: AI 응답 구조가 유효하지 않아 재시도가 필요하다고 안내한다.
- `ANALYSIS_NOT_FOUND`: 분석 ID가 없거나 만료되었음을 안내한다.

## 14. 접근성과 사용성 규칙

- 모든 form input은 label과 연결한다.
- icon-only button에는 `aria-label`을 제공한다.
- loading, disabled, error 상태를 명확히 구분한다.
- keyboard navigation이 가능한 shadcn/ui 컴포넌트를 사용한다.
- 색상만으로 상태를 전달하지 않고 텍스트와 아이콘을 함께 사용한다.

## 15. 보안 규칙

- `.env.local`은 커밋하지 않는다.
- 서버 로그에 token과 raw request header를 남기지 않는다.
- 클라이언트 번들에 `NOTION_TOKEN`, `OPENAI_API_KEY`가 포함되지 않게 한다.
- 사용자가 입력한 ID는 서버에서 검증한 뒤 provider API에 전달한다.
- 분석 결과 저장 시 원본 Notion 전문 저장 여부를 명확히 분리한다.

## 16. 테스트 규칙

- Notion normalizer는 block fixture 기반 단위 테스트를 작성한다.
- AI output parser는 valid/invalid JSON 케이스를 테스트한다.
- API route는 입력 누락, 잘못된 source type, provider error를 테스트한다.
- UI는 loading, completed, failed 상태를 각각 확인한다.
- 긴 문서 분할 로직은 20,000자 경계 조건을 테스트한다.

## 17. MVP 완료 기준

- 사용자가 page ID를 입력해 분석을 시작할 수 있다.
- 서버가 Notion 페이지 속성과 본문 블록을 수집한다.
- 서버가 정규화 데이터를 만든다.
- OpenAI 응답이 고정 JSON schema를 통과한다.
- 결과 화면이 카드, 섹션, 키워드, 마인드맵을 렌더링한다.
- 실패 상태에서 사용자가 다음 조치를 이해할 수 있다.
- UI가 shadcn/ui와 TailwindCSS 기준으로 일관된다.

## 18. 금지 사항

- Notion token을 프론트엔드에서 사용하는 것
- OpenAI API에 Notion raw JSON 전체를 그대로 보내는 것
- AI 응답을 검증 없이 화면에 렌더링하는 것
- shadcn/ui와 다른 디자인 시스템을 섞는 것
- MVP 전에 OAuth, 결제, 관리자 콘솔을 먼저 구현하는 것
- 한 화면에 랜딩 페이지식 홍보 섹션을 우선 배치하는 것
