# AGENTS.md

Guidance for AI agents working in this repo. It is a React 19 + TypeScript + Tailwind v4 + react-router SPA built with Vite, tested with vitest + Testing Library.

## Commands

- `npm run dev` - local dev server
- `npm run test` - run all vitest tests
- `npm run typecheck` - `tsc --noEmit`
- `npm run build` - typecheck + production build

## Hard rules

- No em-dashes in user-facing copy or code comments. Use hyphens, commas, or restructure. En-dashes only in numeric ranges like "13-24 months".
- When computing what-if or recommendation point gains, simulate by re-running the score function on modified copies of the input. Never hardcode point deltas.
- Run `npm run typecheck` and `npm test` before finishing any change.

## Conventions

- Each calculator is a pure scoring module in `src/lib/<province>/score.ts` (a `score(input)` function) plus a tool page in `src/routes/<province>/`. Use the OINP tool (`src/routes/oinp/OinpTool.tsx`) as the reference pattern.
- Each module also exports `eligibility(input)` returning `{ eligible, reasons }`, surfaced via the shared `EligibilityBanner`. Every scoring field gets a `help` prop linking to the official government doc.
- Tool pages render their score via `ToolSidebar` (pot gauge with total/max, plus a breakdown as `<ScoreCard variant="breakdown" />`). The federal CRS sidebar passes a `draws` prop for a "Breakdown / Historical draws" tab switcher; other tools show a static "Points breakdown" tab.
- The tool switcher at the top of tool pages is `ToolTiles` (`<ToolTiles current="<tool-id>" />`).
- The draws feed (`DrawFeed`) is client-side IRCC JSON (parse `drawNumberURL`, `drawText2`, `drawCRS`, `drawSize`; do not assume the feed filename is stable). Provincial tools do not render it yet.
- The landing page map is `src/components/CanadaMap.tsx`, rendering paths from `@svg-maps/canada` (lazy-loaded via `React.lazy`). Which provinces are clickable is driven by the `PROVINCE_ROUTES` map inside the component.
- Theme: accent is Ford blue `#003478` (`--color-accent` in `src/index.css`). Keep accent-colored UI on this token.

## Testing

- Wrap tool components in `MemoryRouter` when rendering (they use `react-router` `Link`s).
- Mock `DrawFeed` in tool tests: `vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))`.
- Stub `global.fetch` in any test that touches the draws feed.
