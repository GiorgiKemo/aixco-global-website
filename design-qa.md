# AIXCO 2026 Brandbook Website Alignment - Design QA

- Source visual truth: `C:/Users/Administrator/Desktop/AIXCO_Brandbook_new.pdf`
- Rendered brandbook pages: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/tmp/pdfs/brandbook-new/`
- Desktop implementation captures: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/playwright/brand-after-*-desktop-v1.png`
- Mobile implementation captures: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/playwright/brand-after-*-mobile-v1.png`
- Combined visual comparison: `C:/Users/Administrator/Desktop/OG Websites/aixco-design 2/output/playwright/brandbook-site-comparison.jpg`
- Viewports: 1440 x 1024 desktop; 390 x 844 mobile
- States: hero, philosophy, Dubai legacy, Batumi opportunity, contact, and current-project route

## Visual comparison evidence

The combined comparison places the brandbook's primary horizontal logo, typography-usage page, and approved photo-style page beside the matching local website states. The implementation now uses the official horizontal lockup, the prescribed Gilroy family, #161616 onyx, #FFFFFF white, #E6C767 brand gold, #9C7F3C document gold, #9A9A9A gray, #002147 navy, and #F3EDE1 ivory.

## Findings and fixes

- P1 - Logo system: navigation, hero, About, footer, project page, and not-found page previously assembled the mark and wordmark separately. Fixed with brandbook-derived horizontal dark/gold and light/gold lockups that preserve the official proportions.
- P1 - Color system: the previous theme used warm approximations and a teal secondary. Fixed by replacing shared tokens with the exact new brandbook palette while retaining the darker document gold for accessible text and controls on light surfaces.
- P1 - Typography consistency: hero elements still used legacy system-font variables. Fixed by routing all public display, body, navigation, button, and project typography through the bundled six-weight Gilroy family.
- P2 - Component language: controls and cards were more rounded and glass-heavy than the new editorial examples. Fixed with sharper 2px geometry, restrained shadows, uppercase tracked CTA labels, and clearer gold/onyx borders.
- P2 - Hero actions: pale glass buttons had weak definition over imagery. Fixed with dark translucent outlined secondary actions and a clear gold primary action.
- P2 - Project route: the white shell did not match the document system. Fixed with the brandbook ivory hero and navigation surface while preserving the white investment-case section and onyx project-highlights section.
- P2 - Mobile rhythm: content sections carried excessive empty top space. Reduced the mobile section inset while preserving header clearance and visual breathing room.
- P2 - Contact card wrapping: the email address wrapped awkwardly at desktop. Reduced only the email value scale and protected it from word breaks.

## Verification

- Official assets are sharp and preserve aspect ratio on light and dark surfaces.
- Desktop and mobile layouts have zero horizontal overflow.
- Hero, section, project, and contact states have no clipped headings or controls.
- Existing navigation, language, modal, document, and contact interactions remain in place.
- No visible P0, P1, or P2 mismatch remains against the brandbook rules.

## Follow-up polish

- P3: replace any older photography only when higher-resolution, approved source renders become available; no placeholder or synthetic imagery was introduced.

final result: passed
