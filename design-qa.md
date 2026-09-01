# Georgia Tax Residency landing page design QA

## Latest QA pass — AIXCO Pathway replacement

Source visual truth: `C:/Users/Administrator/.codex/generated_images/019ff0f5-a20b-75c0-ba0f-b58ff19c189e/exec-240db8a9-ca21-4ea5-a24f-b2af5da2c3ea.png` (selected third generated direction, “The AIXCO Pathway”)

Implementation: `http://127.0.0.1:8081/georgia-tax-residency`

Implementation evidence:

- `output/playwright/georgia-tax-residency-pathway-desktop.png`
- `output/playwright/georgia-tax-residency-pathway-mobile.png`

### Capture normalization

- Desktop CSS viewport: 1280 × 720; browser-rendered screenshot: 1265 × 712 content pixels, excluding the scrollbar gutter.
- Mobile CSS viewport: 390 × 844; browser-rendered screenshot captured at the browser default density.
- Source visual: 1748 × 900; comparison judged by the shared section composition and normalized editorial layout rather than browser chrome.

### State and interactions

- English desktop state with the first pathway stage expanded.
- German language state verified; the pathway eyebrow, title, stage labels, body copy, actions, disclaimer, and navigation all changed to German.
- Stage 2 was opened: Stage 1 closed, Stage 2 expanded, and its action copy appeared.
- Primary consultation action scrolled to `#contact`; the framework action scrolled to `#why`.
- Mobile viewport has three expandable stages and no horizontal overflow (`scrollWidth: 375`, viewport width `390`).
- Browser console: no error entries after the final desktop/mobile captures.

### Full-view comparison evidence

The implementation replaces the calculator with the selected editorial pathway: oversized left-side headline, AIXCO ivory/ink/gold palette, hairline rules, numbered gold route markers, one expanded stage, and a consultation CTA. The section uses live React state for the accordion and existing page navigation for the two conversion paths.

### Focused comparison evidence

The focused pathway region was checked for title weight, line wrapping, stage-marker alignment, expanded-panel spacing, action visibility, and mobile stacking. One initial P2 rhythm issue was found: the section’s top padding pushed the CTA below the desktop viewport. The section-specific padding was tightened and the desktop capture was repeated.

### Required fidelity surfaces

- Fonts and typography: existing Gilroy brand font variables remain in use; the selected title hierarchy is heavier than the removed calculator heading and stays readable at desktop and mobile widths.
- Spacing and layout rhythm: two-column desktop composition collapses to a single column at 820px; stage content aligns beneath its numbered trigger and the mobile CTA spans the available width.
- Colors and visual tokens: AIXCO ivory, deep ink, muted copy, and antique-gold accent tokens are used; no black panel, gradient, or low-contrast overlay was introduced.
- Image quality and asset fidelity: the selected reference contains no photographic asset; the implementation uses the existing real logo and icon library only, with no placeholder imagery or CSS-drawn artwork.
- Copy and content: the new pathway is fully translated for English, German, Polish, Slovenian, and Russian; the 183-day educational link and general-guidance disclaimer remain present.

### Findings

No actionable P0, P1, or P2 findings remain.

### Comparison history

1. Initial implementation review: functional accordion and responsive structure passed, but excess section padding pushed the primary CTA below the desktop viewport.
2. Post-fix review: pathway-specific vertical rhythm was tightened; desktop and mobile captures were repeated, interactions remained functional, and no console errors or overflow remained.

### Implementation checklist

- [x] Remove the calculator UI and calculator state from the public tax-residency page.
- [x] Implement the selected AIXCO Pathway composition.
- [x] Add accessible expand/collapse controls with one open stage at a time.
- [x] Wire consultation and framework actions to existing page sections.
- [x] Translate the replacement section across all five supported languages.
- [x] Verify desktop and mobile layouts, interaction states, overflow, and console output.

final result: passed

---

The earlier QA record below is retained as historical context for the previous calculator-based direction.

Source visual truth: `C:/Users/Administrator/.codex/generated_images/019ff0f5-a20b-75c0-ba0f-b58ff19c189e/exec-c9c2c493-9bc6-4ca8-8e8e-189aa89f4f62.png` (selected Option 3, “The Residence Clock”)

Implementation: `http://127.0.0.1:8081/georgia-tax-residency`

Implementation evidence:

- `output/playwright/georgia-tax-residency-qa-desktop.png`
- `output/playwright/georgia-tax-residency-qa-full.png`
- `output/playwright/georgia-tax-residency-qa-comparison-hero.png`

## Capture normalization

- Desktop CSS viewport: 1280 × 720.
- Browser-rendered desktop screenshot pixels: 1265 × 712 (the browser capture excludes the scrollbar gutter).
- Mobile CSS viewport checked: 390 × 844.
- Mobile capture density: browser default, no device-scale override.
- Source pixels: 748 × 2103. The focused hero comparison uses the source hero crop at 748 × 515 and the implementation desktop capture at 1265 × 712, both normalized to a 620px comparison column in `georgia-tax-residency-qa-comparison-hero.png`.
- The source is a tall art-directed concept board rather than a device screenshot, so the comparison prioritizes the shared hero composition, editorial system, clock mechanism, chapter rhythm, imagery, and conversion structure rather than pixel-identical browser chrome.

## State and interactions

- English desktop, top-of-page state, paper-light theme.
- German, Polish, Slovenian, and Russian language states were selected through the visible language menu on the 390 × 844 viewport; each updated the document language and hero copy without horizontal overflow.
- Mobile menu opened and exposed all five navigation destinations.
- Residence slider was moved to 183 through the rendered control; the live value changed from 96 to 183 and the contextual note changed to the residency state.
- Contact form required-field validation remains active; no live submission was made during QA.
- Browser console: no error entries at the final desktop capture.

## Full-view comparison evidence

The implementation preserves the selected concept’s paper-led AIXCO hierarchy: ivory field, ink typography, champagne-gold rules and CTA, square editorial geometry, split hero, circular residence mechanism, numbered route chapters, real Georgia imagery, and a final consultation form. The implementation uses the repository’s sharp Batumi assets instead of the generated concept’s synthetic skyline; this is an intentional improvement aligned with the request for real, high-quality imagery.

## Focused hero comparison evidence

The source and implementation both use a quiet editorial copy column beside a full-height Georgia city/coast image, with the logo and compact uppercase navigation in the top rule. The implementation’s hero type is intentionally larger at the 1280px viewport to create stronger campaign impact and keep the CTA visible, while the source’s lighter aerial crop is replaced with a real Batumi aerial crop. Both remain legible without text over the image.

## Required fidelity surfaces

- Fonts and typography: Gilroy brand font variables are used for display and body copy, with a restrained uppercase micro-label system and geometric display hierarchy. Translated hero headings were checked for wrapping at 390px.
- Spacing and layout rhythm: split hero, section grid, sticky chapter intro, clock panel, two-column contact surface, and square spacing rules were checked at desktop and mobile. No horizontal overflow was detected at 390px.
- Colors and visual tokens: page uses AIXCO ivory, ink, mineral beige, and champagne-gold tokens; no dominant black surface or low-contrast text overlay is used.
- Image quality and asset fidelity: logo and all visible photography use real repository assets through `next/image`; hero and supporting images have explicit sizing/crops and no placeholder art.
- Copy and content: English, German, Polish, Slovenian, and Russian copy is present for the page’s visible sections, controls, form, language menu, and footer. Tax copy includes a clear “not tax or legal advice” boundary.

## Findings

No actionable P0, P1, or P2 findings remain.

## Comparison history

1. Initial implementation review: layout, palette, typography, imagery direction, and responsive structure matched the selected concept. The browser harness did not dispatch the range control’s synthetic input event reliably, so the control was made explicit with both `onChange` and `onInput` handlers.
2. Post-fix review: the rendered slider moved to 183 and updated the contextual state; language and mobile checks remained clean. No P0/P1/P2 visual or interaction findings remained.

## Follow-up polish

- P3: the generated concept includes a longer city editorial mosaic below the “Why Georgia” chapter; the implementation keeps the page more focused on tax-residency conversion and reuses fewer, higher-quality real images.

## Implementation Checklist

- [x] New separate `/georgia-tax-residency` route.
- [x] Brandbook palette, typography, logo, and editorial geometry.
- [x] Scroll-linked progress, hero parallax, orbital rotation, reveal motion, and reduced-motion fallback.
- [x] Interactive 0–183 day residence control with live contextual state.
- [x] Responsive desktop/mobile layout and five-language copy.
- [x] Working consultation form wired to the existing lead-capture pipeline.
- [x] Consent preferences and analytics inherited through the existing public `ClientShell`.
- [x] Canonical metadata, Open Graph/Twitter image, JSON-LD, and sitemap entry.
- [x] Typecheck, targeted tests, production build, lint, browser interaction, responsive, and console checks.

final result: passed
