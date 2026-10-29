# Answer Canvas design QA

**Final result: passed**

## Evidence and normalization

- Source visual truth: [selected Answer Canvas reference](docs/design/answer-canvas-reference.jpg), generated from the user's selected option 2 and revised interaction requirements. Original pixels: 1487 x 1058. Intended CSS frame: approximately 1440 x 1024.
- Implementation: [desktop capture](docs/design/answer-canvas-desktop.jpg), rendered in Chrome at `http://localhost:5173/crs`.
- Desktop browser: 1920 x 882 CSS pixels, device pixel ratio 1. The browser capture contains 1905 x 875 content pixels. The application uses a centered 1440-pixel maximum frame.
- [Full-view comparison](docs/design/answer-canvas-comparison.jpg) places both artifacts in one image. The source is downsampled to 1440 pixels wide. The implementation's centered 1440-pixel application frame is cropped from the wider viewport without scaling. Both use the desktop breakpoint. The reference extends farther vertically than the available screenshot; that lower strip is excluded from fidelity judgments.
- [Focused control comparison](docs/design/answer-canvas-controls.jpg) combines both control regions at the normalized scale so labels, numeric values, units, slider ticks and documentation links remain readable.
- [Mobile capture](docs/design/answer-canvas-mobile.jpg): real application rendered in a 390 x 844 CSS-pixel iframe, device pixel ratio 1, captured through Chrome and cropped to the frame. Native popup capture was unavailable, so a temporary local test harness supplied the narrow viewport. The harness is outside the repository.
- Desktop state: CRS, rules through November 2, 2026, age 30, applying alone, bachelor's degree, IELTS General 6.0 in all four abilities, no work experience or additional points, Experience section selected, estimate 306 / 1200.
- Mobile state: Language section selected, age 30, IELTS General selected, scores empty, estimate 105 / 1200.

## Findings and comparison history

1. Initial comparison: [combined evidence](docs/design/answer-canvas-comparison-initial.jpg). Result was blocked.
   - P2, typography: the main question was undersized compared with the reference. Increased the desktop heading from 48 to 64 pixels and supporting text from 18 to 22 pixels. Field labels increased from 15 to 18 pixels.
   - P2, control spacing: fixed-width numeric inputs left excessive space before the unit. Inputs now size to their entered digits.
   - P2, mobile controls: four language columns provided too little room for sliders and score labels. Reorganized abilities into individually labeled groups and a two-column mobile grid.
2. Revised comparison: the final full-view and focused evidence above show the corrected hierarchy and input spacing. The mobile capture shows two usable language columns with the score and program controls retained in the header.
3. Interaction QA found an animation frame could precede the effect's start timestamp, briefly moving digits away from the target. Clamped animation progress to 0 through 1 and added a regression test covering the older frame, intermediate value and final estimate. Immediate accessible score announcements are independent of the animation.
4. Final comparison: no actionable P0, P1 or P2 differences remain.

## Fidelity surfaces

- **Fonts and typography:** Geist and Geist Mono are bundled locally. The 64-pixel desktop question heading, navy display text, blue numeric values and smaller secondary labels reproduce the reference hierarchy. Mobile headings use 33 pixels. Compact receipt labels accommodate five answer groups.
- **Spacing and layout:** white canvas, slim sticky masthead, horizontal tabs, two-column work controls, optional previous/next controls and answer receipt retain the reference composition. The large numbers are themselves editable; this intentionally consolidates the reference's duplicate numeric fields. Documentation links appear at section headings and beside each scoring field.
- **Colors and tokens:** Ford blue `--color-accent: #003478`, navy ink, white surfaces and restrained grey dividers. Slider fill communicates the current value. Focus and selected states use the accent token.
- **Image quality and assets:** the selected calculator design has no photographic or illustrative assets. The interface uses actual controls and Phosphor icons. The existing Canada map and provincial flags remain actual source assets. No generated raster image is used as application UI.
- **Copy and content:** short field descriptions, factual program names and official source links. Removed promotional descriptions and contrast-based phrasing. Additional Scenarios and Requirements tabs retain existing calculator capabilities.
- **Accessibility and motion:** labeled native inputs, ARIA tabs with arrow/Home/End navigation, persistent values in inactive panels, visible focus styles, native modal dialogs with Escape and focus handling, polite live score announcements, and reduced-motion support.

## Validation

- Browser verified: typed age and work years; language test selection; answer-summary jumps; retained answers after changing sections; score changes from 306 to 384 and 411; score breakdown and dismissal; calculator switching; Ontario physician pathway with 117-point maximum; BC Requirements tab; landing page and map rendering; mobile language layout.
- Console checked on the final production preview: no application warnings or errors. A prior development-server restart interrupted a lazy module request; the subsequent production-preview load rendered the map successfully.
- `bun run typecheck`: passed.
- `bun run test`: 376 tests passed across 22 files, including direct navigation, numeric drafts, live language changes and animation timing.
- `bun run build`: passed.
- `git diff --check`: passed.
- Residual coverage: responsive interaction checks were performed in desktop Chrome and a narrow iframe. No physical touch device or screen-reader session was available.

## Implementation checklist

- [x] Freely accessible answer sections on all six calculators.
- [x] Editable answer receipt and immediate score updates.
- [x] Typed values and sliders for numeric exploration.
- [x] Bilingual bonuses derived from entered test results.
- [x] Requirements and detailed scoring in focused sections or dialogs.
- [x] Responsive layout, keyboard navigation and reduced-motion behavior.
- [x] Combined visual evidence, automated checks and production preview.

final result: passed
