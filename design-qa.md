# AIXCO Contact Emails - Design QA

- Source visual truth: user-approved AIXCO contact-request mock (conversation attachment; not committed)
- Generated previews: `output/email/` (local QA artifacts; intentionally git-ignored)
- Mobile implementation evidence: `output/email/aixco-contact-request-preview-mobile-v2-top.png` and `output/email/aixco-contact-request-preview-mobile-v3-bottom.png`
- Full-view comparison: `output/email/aixco-contact-email-qa-full.png`
- Focused comparisons: `aixco-contact-email-qa-top.png`, `aixco-contact-email-qa-message.png`, and `aixco-contact-email-qa-bottom.png`
- Viewports: desktop comparison normalized to the source's 911 px canvas; mobile 390 x 844
- State: populated website contact request with reference, requester, interest, full message, reply action, request context, and footer

## Findings

- No actionable P0, P1, or P2 differences remain.
- P3 - The approved mock has a slight tonal variation across the gold reference panel, while the implementation uses a flat brand-gold fill. The flat fill is intentional: it follows the brandbook token, remains predictable across email clients, and preserves the same hierarchy and contrast.
- P3 - The exact Gilroy face cannot be assumed inside external inboxes. The template requests Gilroy first, then falls back to Avenir Next, Segoe UI, Arial, and Helvetica with matched weights, line heights, and tracking.
- The call and message confirmations use the exact approved wording from `Message for Phone call request and email website.docx`, with the generated AIX reference added as a functional identifier.
- Both customer confirmations follow the new brandbook's primary horizontal logo, document palette, Gilroy-first hierarchy, and recommended readable line length.

## Full-view comparison evidence

The side-by-side full comparison confirms the approved composition: ivory surround, 790 px white email canvas, official dark horizontal logo, thin gold rule, large black headline, gold request-reference block, two-column desktop contact area, ivory message field with a gold left rail, black reply action, ruled context list, and centered navy footer. Major-region proportions, alignment, color balance, and total vertical rhythm now closely match the source.

The full implementation image was assembled from browser-rendered viewport segments because the in-app browser's automatic full-page stitch repeated frames. The unstitched focused comparisons are the authoritative evidence for typography and content rendering around the segment boundaries.

## Focused comparison evidence

- Header and contact area: logo scale, rule length, headline weight, gold reference panel, two-column split, and content alignment follow the selected mock.
- Message and action: message line length, ivory treatment, gold rail, generous padding, and the final 16 px reply label match the source's prominence without clipping.
- Context and footer: five operational context rows remain readable, the safe referrer remains linked, and footer height, navy token, centered wordmark, and location line match the source.
- Mobile: contact cells stack below 520 px, the long email remains visible, the reply action fits the content column, and the page has no horizontal overflow.

## Comparison history

1. Initial implementation finding - P2: the earlier 640 px email and smaller type were substantially denser than the 790 px approved visual. Fix: expanded the desktop canvas to 790 px, set 46 px content gutters, enlarged headline/body values, and increased section rhythm. Post-fix evidence: `aixco-contact-email-qa-full.png` and `aixco-contact-email-qa-top.png`.
2. Second-pass finding - P2: the reply action was visibly narrower and lighter than the source. Fix: increased the action to 16 px bold type with 20 x 32 px padding while retaining the square black/gold treatment. Post-fix mobile evidence: `aixco-contact-request-preview-mobile-v3-bottom.png`; the control remains fully in bounds.
3. Final pass: no actionable P0/P1/P2 mismatch remained. Only the acceptable P3 email-client constraints above remain.

## Required fidelity surfaces

- Fonts and typography: strong geometric sans hierarchy, email-safe fallbacks, readable 18-20 px body/value copy on desktop, 16 px message copy on mobile, controlled line height, and no clipping or truncation.
- Spacing and layout rhythm: 790 px desktop frame, 46 px gutters, square sections, generous vertical spacing, and a clean 390 px mobile stack.
- Colors and visual tokens: approved onyx `#161616`, white `#FFFFFF`, brand gold `#E6C767`, document gold `#9C7F3C`, navy `#002147`, gray `#9A9A9A`, and ivory `#F3EDE1`.
- Image quality and asset fidelity: official AIXCO horizontal dark logo rendered from a transparent PNG derivative; no recreated logo, placeholder, custom SVG, or CSS drawing.
- Copy and content: dynamic reference, name, email, interest, message, page, locale, timezone, referrer, and viewport are complete and escaped. User-agent data remains in the plain-text fallback but is intentionally omitted from the visual context list to match the approved design.

## Verification

- Email and lead-capture suites: covered by `npm run test:coverage`; use the CI result as the current source of truth.
- Full Vitest suite: run `npm run test:coverage`; CI records the current test/file totals and enforces whole-source coverage floors.
- ESLint: passed.
- Production build and TypeScript: passed.
- Browser-rendered desktop and 390 x 844 mobile checks for the internal request email and both customer confirmations: passed.
- Mobile layout: `scrollWidth` 375 within a 390 px viewport; no horizontal overflow.
- Reply action: one unique link resolving to `mailto:michael.thompson@example.com?subject=Re%3A%20AIX-2026-000018`.
- Logo: loaded successfully with non-zero natural dimensions and the correct alt text.
- Browser console: zero errors.
- No live email was sent, and nothing was pushed or deployed during this design pass.

## Follow-up polish

- P3: after deployment, run one real-message rendering check in Gmail and Outlook because browser rendering cannot reproduce every proprietary inbox engine.

final result: passed

---

# AIXCO Brandbook Typography and Color QA

- Source of truth: `C:/Users/Administrator/Desktop/AIXCO_Brandbook_new.pdf`
- Typography: Gilroy Thin 100, Regular 400, Medium 500, SemiBold 600, ExtraBold 800, and Black 900
- Primary colors: Onyx `#161616`, White `#FFFFFF`, and Gold `#E6C767`
- Supporting colors: document gold `#9C7F3C`, Navy `#002147`, Gray `#9A9A9A`, and Ivory `#F3EDE1`

## Corrections

- Replaced approximate HSL theme values with exact HSL equivalents of the approved brandbook colors.
- Routed legacy UI and display typography aliases through the existing local Gilroy font family.
- Removed the drop shadow from the official hero logo and mark, matching the brandbook logo-usage rules.
- Preserved language-specific font fallbacks for scripts not supported by Gilroy.

## Scope

The changes are token- and typeface-only. The selected portrait-phone hero layout, desktop layout, responsive structure, copy, links, and behavior remain unchanged.

final result: passed

---

# Selected Mobile Hero - Design QA

- Source visual truth: `output/playwright/selected-mobile-hero-reference.png`
- Implementation screenshot: `output/playwright/mobile-hero-selected-390x844-final.png`
- Full-view comparison: `output/playwright/mobile-hero-selected-comparison-final.png`
- Viewport: 390 x 844 CSS pixels
- State: homepage hero, English selected, menus closed, background video paused for capture

## Findings

- No actionable P0, P1, or P2 differences remain in the requested mobile hero composition.
- P3: the comparison shows different frames from the existing rotating hero video. This is expected dynamic content; the source image asset, overlay treatment, and hero media behavior were not changed.

## Full-view comparison evidence

The paired comparison shows the selected hierarchy reproduced at the same viewport: centered kicker and official AIXCO lockup, left-aligned two-line headline, left-aligned supporting statement, full-width Explore action, and equal Register/Contact actions below. The headline and action edges now align to the reference's 16 px phone gutter.

## Focused comparison evidence

A separate crop was not needed because the 780 x 844 paired image keeps the logo, typography, spacing, buttons, and header controls readable at their native mobile height.

## Comparison history

1. Initial local capture - P1: the complete hero stack was vertically and horizontally centered, placing the kicker around the middle of the image and indenting the headline. Fix: scope a new composition to portrait phones, move the hero to the top, keep the brand centered, and allow the statement/actions to use the full content width. Evidence: `mobile-hero-before-selected-layout.png` and `mobile-hero-after-selected-layout-v1.png`.
2. First comparison - P2: the local statement used a 19.5 px gutter and sat about 5-6 px lower than the source. Fix: use a safe-area-aware 16 px gutter and tighten the responsive top offset. Evidence: `mobile-hero-selected-comparison-final.png`.
3. Final pass: no actionable P0/P1/P2 mismatch remains.

## Required fidelity surfaces

- Fonts and typography: existing Gilroy/brand sans family, weights, sizes, tracking, line heights, wrapping, and casing are preserved.
- Spacing and layout rhythm: source-matched top offset, centered brand lockup, 16 px logical gutters, two-line headline, three-line support copy, and CTA spacing are reproduced without horizontal overflow.
- Colors and visual tokens: existing white, onyx transparency, gold action, borders, and overlay tokens are unchanged.
- Image quality and asset fidelity: the existing official logo and hero video/poster assets remain intact; no image, icon, or logo was recreated.
- Copy and content: all hero wording and CTA labels are unchanged.

## Verification

- 390 x 844 final capture: passed with `scrollWidth` equal to the 390 px viewport.
- Additional portrait-phone captures: 320 x 568 and 430 x 932 passed without horizontal overflow or clipped primary actions.
- 768 x 900 tablet capture remains outside the new portrait-phone rule and retains its existing composition.
- Register and Contact Me actions both opened their existing dialogs successfully.
- Final browser render: zero console errors; two existing image-preload/configuration warnings remain unrelated to this layout.
- Targeted CSS suite: 41 tests passed.

final result: passed

---

# AIXCO Mobile Story Menu - Design QA

- Source visual truth: user-provided mobile-menu screenshot (conversation attachment; not committed)
- Browser-rendered QA artifacts: `output/playwright/` (local and git-ignored)
- Full-view comparison: `output/playwright/menu-comparison.png`
- Responsive evidence: `menu-320.png`, `menu-390x844.png`, and `menu-768.png`
- Viewports: 320 x 568, 390 x 844, 403 x 631, and 768 x 900
- State: mobile/tablet story navigation open; active chapter shown; background scroll locked

## Findings

- No actionable P0, P1, or P2 issues remain.
- P3: the 17-section navigation still requires vertical scrolling on short phones. This is intentional; compact 45.6 px targets retain usability and avoid cramped multi-column labels in translated languages.

## Full-view comparison evidence

The side-by-side comparison confirms that the disconnected dark strip and offset white drawer have been removed on phones. The header and navigation now share one ivory surface, the logo switches to a legible dark treatment, controls align within the same header row, and navigation spacing is substantially tighter while preserving clear active-state emphasis.

## Focused comparison evidence

No separate focused crop was needed because the 403 x 631 full-view comparison renders the logo, language control, close control, active item, dividers, typography, and menu spacing at readable size. Additional full-view captures validate the narrow-phone and tablet behaviors.

## Comparison history

1. Initial finding - P1: the phone drawer occupied 92% of the viewport while the header remained visually attached to the dark page underneath, creating a 29-35 px dark strip and a white logo disconnected from the ivory navigation. Fix: use a full-width phone sheet and a unified ivory header with a dark logo. Post-fix evidence: `menu-comparison.png`.
2. Initial finding - P2: 52 px navigation rows and large gaps made the menu feel unusually stretched and exposed fewer destinations. Fix: reduce rows to 45.6 px, tighten gaps and padding, and retain full-size active-state treatment. Post-fix evidence: `menu-after-iteration-1.png` and `menu-390x844.png`.
3. Responsive finding - P2: the same nearly-full-width treatment was not ideal for tablets. Fix: retain a contained 384 px side drawer from 640-1279 px while keeping the unified header. Post-fix evidence: `menu-768.png`.
4. Final pass: no actionable P0/P1/P2 differences remain.

## Required fidelity surfaces

- Fonts and typography: existing Gilroy/legacy UI stack preserved; 0.94 rem navigation text remains crisp with controlled 1.2 line height and no clipping.
- Spacing and layout rhythm: unified 76 px header, compact navigation rhythm, safe-area-aware padding, full-width phone sheet, and 384 px tablet drawer.
- Colors and visual tokens: existing AIXCO ivory background, onyx foreground, and gold active treatment retained consistently across header and drawer.
- Image quality and asset fidelity: official AIXCO horizontal logo remains in use; CSS only changes its open-menu color treatment and does not recreate the asset.
- Copy and content: all 17 navigation labels and their destinations are unchanged.

## Verification

- Menu and motion suites: covered by `npm run test:coverage`; use the CI result as the current source of truth.
- Production build and TypeScript passed.
- Phone widths: 320, 390, and 403 px have no horizontal overflow; drawer width equals viewport width.
- Tablet width: 768 px uses a 384 px right-side drawer.
- Navigation interaction: selecting About closes the dialog, removes the body lock, and navigates to `#about`.
- Browser console: zero errors.

final result: passed

---


# Mobile Navbar Design QA

- Source visual truth: user-provided navbar screenshot (conversation attachment; not committed)
- Implementation evidence: regenerated by the mobile browser gates; local screenshots are intentionally git-ignored
- Viewport: 390 x 844 CSS pixels
- State: Homepage at the top of the page, transparent mobile navbar, English selected, menus closed

## Full-view comparison evidence

The source shows the previous mobile navbar proportions. In the implementation, the AIXCO.GLOBAL logo is visibly larger while the language and menu controls are reduced and remain aligned within the same header row. The implementation has no horizontal overflow.

## Focused region comparison evidence

The navbar itself is the complete scope, so the 390 x 120 implementation crop is also the focused comparison. Measured implementation dimensions are:

- Logo: 144.30 x 30.03 pixels
- Language control: 74.78 x 44 pixels
- Menu control: 44 x 44 pixels

Both controls retain the recommended 44-pixel touch height. The language and burger icons are smaller than the source while preserving clear recognition.

## Required fidelity surfaces

- Fonts and typography: Existing brand font, weight, tracking, and `EN` label are unchanged.
- Spacing and layout rhythm: Logo/control proportions and the inter-control gap are improved; vertical centering is consistent.
- Colors and visual tokens: Existing white controls, dark text, borders, and transparent-at-top behavior are preserved.
- Image quality and asset fidelity: The supplied AIXCO logo asset is preserved and rendered at a larger size without stretching.
- Copy and content: No navigation labels or accessible names changed.

## Findings

No actionable P0, P1, or P2 differences remain within the requested scope.

## Comparison history

- Initial source finding: the logo read too small relative to the language and burger controls.
- Fix: increased the responsive logo width, reduced both controls to 44 pixels, reduced icon sizes, and tightened spacing.
- Post-fix evidence: the combined comparison and measured 390-pixel implementation show the requested visual hierarchy with no overflow.

## Interaction and browser checks

- Language menu opens and closes.
- Mobile navigation menu opens.
- Console errors: none.
- Horizontal overflow: none.

## Follow-up polish

No P3 follow-up is required for this scoped adjustment.

final result: passed
