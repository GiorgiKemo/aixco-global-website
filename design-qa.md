# AIXCO Contact Emails - Design QA

- Source visual truth: `C:/Users/ADMINI~1/AppData/Local/Temp/codex-clipboard-c858906b-8c0a-4601-81fa-fc54eda83920.png`
- Implementation HTML: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/email/aixco-contact-request-preview.html`
- Customer call-confirmation preview: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/email/aixco-call-request-confirmation-preview.html`
- Customer message-confirmation preview: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/email/aixco-message-confirmation-preview.html`
- Desktop implementation evidence: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/email/aixco-contact-request-preview-desktop-v3-stitched.png`
- Mobile implementation evidence: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/email/aixco-contact-request-preview-mobile-v2-top.png` and `aixco-contact-request-preview-mobile-v3-bottom.png`
- Full-view comparison: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/email/aixco-contact-email-qa-full.png`
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

- Email-specific Vitest suite: 8 tests passed.
- Lead-capture service Vitest suite: 9 tests passed.
- Full Vitest suite: 199 tests passed across 44 files.
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

# AIXCO Mobile Story Menu - Design QA

- Source visual truth: `C:/Users/ADMINI~1/AppData/Local/Temp/codex-clipboard-17ecedbd-44ce-45d2-b6af-86351dc8a6e9.png`
- Browser-rendered implementation: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/playwright/menu-after-iteration-1.png`
- Full-view comparison: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/playwright/menu-comparison.png`
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

- 41 focused Vitest checks passed across the menu and motion suites.
- Production build and TypeScript passed.
- Phone widths: 320, 390, and 403 px have no horizontal overflow; drawer width equals viewport width.
- Tablet width: 768 px uses a 384 px right-side drawer.
- Navigation interaction: selecting About closes the dialog, removes the body lock, and navigates to `#about`.
- Browser console: zero errors.

final result: passed
