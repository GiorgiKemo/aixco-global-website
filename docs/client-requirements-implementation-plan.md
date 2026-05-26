# Client requirements — implementation plan

**Source:** `client-requirements-transcript.md` (WhatsApp voice note, 2026-05-25)  
**Workspace:** aixco-design 2 (Next.js App Router)  
**Status:** Planning only — no site changes in this document  
**Reference site for Swiss legacy:** [x-co-group.com](https://x-co-group.com)

---

## Executive summary

The client wants the **regular** AIXCO marketing site repositioned from an **investment-firm / fund / participation** narrative to a **real-estate operations** story: **buy, sell, broker, and administer property**. Regulatory sensitivity is the driver: language that presents AIXCO as a “pure investment firm” must be removed or reframed.

Concrete asks from the voice note:

| Theme | Client intent |
| --- | --- |
| **Messaging** | Real-estate platform, not investment company |
| **Hero pricing** | Replace “starting from €1,000” with **€10,000** and/or **10% down payment** framing (e.g. €50k flat → “from €5,000”) plus explanation |
| **Entry story** | Lead with **buy a flat**; history as **legacy timeline** |
| **Dubai** | Remove **fund** wording; show **real-estate volume** (bought/sold, in progress); mark as **legacy** (no longer actively investing there) |
| **History** | **Switzerland** (~CHF 1.1B real estate, from Swiss site) → **Dubai** (turnover figures) → **Batumi/Georgia** (current opportunity) |
| **Current focus** | **Opportunity-driven / revenue-based** positioning in Batumi; client will rewrite final copy |
| **Scope** | **Regular site first**; **energy** topic explicitly deferred |
| **Swiss content** | Pull from [x-co-group.com](https://x-co-group.com) and integrate |

Today’s codebase is centered on **“Quality Real Estate Participation”**, **€1,000** entry copy, **Dubai Fund I/II** cards, bond + apartment participation routes, and metrics like **“Raised Capital”** and **“Investment Returns”**. A phased copy + structure refactor (with a new **Legacy / Our journey** section) is required before launch-quality compliance with the brief.

---

## Messaging repositioning (investment firm → real estate buy/sell/broker)

### Regulatory / tone goal

Remove or replace copy that implies:

- Regulated **investment firm** or **fund manager** positioning  
- **Collective investment** / **fund** products (especially Dubai)  
- Generic **“invest” / “investor” / “participation”** where **property purchase, brokerage, or administration** is meant  

Prefer:

- **Buy and sell real estate**  
- **Broker** intermediaries and **property administration**  
- **Opportunity-driven** / **revenue-based** language for Batumi (client-approved phrasing TBD)  
- **Legacy** for Switzerland and Dubai track record  

### Where investment language lives today (high level)

| Area | Current framing | Action |
| --- | --- | --- |
| Brand line | “Quality Real Estate Participation” (`company.tagline`, hero kicker) | Rebrand to real-estate services (TBD with client) |
| Hero | “private partners… join selected real estate projects” + €1,000 | Real-estate entry + new price model + footnote |
| About | “real estate holding company… financial investments… co-investing in portfolios… investor trust” | Brokerage / transactions / property services |
| Metrics | “Raised Capital”, “Investment Returns”, “4.2X” | Replace with transaction volume, GDV, markets served (client figures) |
| Dubai section | `dubaiFunds`, Fund I/II titles, fund galleries | Legacy real-estate portfolio stats; rename components/data |
| Participate | Bond route + “invest”; “Ways to Participate” | “Ways to work with AIXCO” — buy flat, broker, admin (bond TBD) |
| How it works | “investing directly” | Buy / broker / developer workflows |
| FAQs | “minimum investment”, “structured participation” | Minimum purchase / down payment; direct purchase |
| Philosophy | Swiss heritage + “investment platform” (`aixco-philosophy.ts`) | Align with legacy timeline; soften “investment platform” |
| News ticker | “Fund I”, “investor demand”, “EUR 1,000” | Real-estate headlines only |
| Chatbot | “Dubai funds”, “investment”, €1,000 FAQ | Match new site copy |
| Legacy articles | Heavy “investors” SEO (`legacy-insights.ts`) | Out of scope for phase 1 or separate SEO pass |
| i18n | 6 languages mirror all of the above | Update `translations.ts`, `site-content-translations.ts`, `I18nProvider.tsx` |

**Bond route:** Client did not mention removing the 6% bond in the voice note; it **does** read as a financial product. **Confirm with client** whether bond stays, moves to footnote, or is removed for regulatory alignment.

---

## Hero and pricing changes (€1,000 → €10,000 or 10% down payment)

### Current implementation

| Location | Line / constant | Reference |
| --- | --- | --- |
| Hero price CTA | `heroPriceText = "Starting from €1,000"` | `src/components/sections/hero/hero-ui.ts` L8 |
| Hero intro | `heroIntroText` (participation / private partners) | `src/components/sections/hero/hero-ui.ts` L5–6 |
| Hero UI | Renders `tx(heroPriceText)` linking to `#faqs` | `src/components/sections/hero/HeroComposition.tsx` L98–115 |
| Nav CTA | `cta.start`: “Starting from €1,000” | `src/i18n/I18nProvider.tsx` L28; `NavControls.tsx`, `NavMeasurement.tsx` |
| SEO | `pageDescription` includes €1,000 | `src/i18n/I18nProvider.tsx` L32 |
| Metadata | `layout.tsx` — participation-focused description | `src/app/layout.tsx` L9–11 |
| Translations | `"Starting from €1,000"`, intro with €1,000 | `src/i18n/translations.ts` L118–130 |
| Contact | “from €1,000” | `src/components/sections/Contact.tsx` L88 |
| FAQ | “entry point starts from €1,000” | `src/data/site.ts` L351 |
| Legacy slug footer | “Starting from EUR 1,000” | `src/app/aixco-global-op2/[slug]/page.tsx` ~L100 |
| Tests | `Hero.test.tsx` L155, L229–236; `website-chatbot.test.ts`; `FAQs.test.tsx` | Update assertions |

### Recommended UX (pending client choice)

**Option A — Round headline number:**  
`Starting from €10,000` + short FAQ/modal: “Typical entry reflects a 10% reservation on selected Batumi apartments from €50,000.”

**Option B — Down-payment model (client example):**  
`Starting from €5,000` + subline: “Illustrative 10% down payment on a €50,000 apartment. Final terms depend on project and purchase agreement.”

**Option C — Dual line:**  
Primary: `Apartments from €50,000` · Secondary: `From €5,000 down (10%)`  

Implement chosen option in `hero-ui.ts` once; wire explanation to FAQs (`#faqs` anchor already used by hero price link).

---

## Dubai section changes (remove funds; legacy volume framing)

### Current structure

- **Data:** `dubaiFunds` in `src/data/site.ts` L36–70 — `Fund I`, `Fund II`, IRR/performance language  
- **UI:** `Dubai.tsx` → `DubaiFundCard`, `DubaiFundAssetGallery`, `data-fund-*` attributes  
- **Galleries:** `fundAssetGalleries` labels “Fund I/II asset image gallery” in `dubai-data.ts` L16–29  
- **i18n:** Fund names in `site-content-translations.ts` L9–16+  
- **Tests:** `Dubai.test.tsx` asserts fund card layout and “Fund I Eden House…” copy  

### Target structure

1. Section eyebrow: **“Dubai · Legacy portfolio”** (or “Our history in Dubai”)  
2. Replace fund cards with **project / development cards**: Eden House (Canal & Park), Dubai Healthcare City  
3. Stats emphasize **real estate volume**: units, total development value, bought/sold, status (completed / in progress / realized) — use client-supplied figures  
4. Remove: “Fund I/II”, “Target Net IRR”, “GP Commitment”, “Performance 4.9x” unless client explicitly wants performance as **historical realized sale** not **fund return**  
5. Optional badge: **“Legacy market — not accepting new investments in Dubai”**  

### Refactor notes

- Rename types: `DubaiFund` → `DubaiLegacyProject` (or keep internal IDs `fund-1`/`fund-2` temporarily to avoid asset path churn)  
- Rename `dubaiFunds` → `dubaiLegacyProjects` in `SiteContent` (`site-content.ts`, `site-content-context`, Supabase JSON if used)  
- Update `data-fund-*` test selectors to `data-dubai-project-*` in a dedicated PR to avoid breaking tests mid-migration  

---

## Legacy narrative (Switzerland → Dubai → Batumi)

### Client story arc

```text
[Today] Buy a flat in Batumi (primary CTA)
    ↓
[Legacy] Switzerland — CHF 1.1B in real estate (x-co-group.com)
    ↓
[Legacy] Dubai — volume / turnover (no fund language)
    ↓
[Now] Georgia / Batumi — opportunity-driven participation
```

### Gap in codebase

There is **no Switzerland section** and **no chronological “Our journey”** block on the homepage. Swiss references exist only in:

- `PhilosophyCallout.tsx` — “Swiss discipline…”  
- `src/data/aixco-philosophy.ts` — Swiss residential market origin  
- `src/views/AixcoPhilosophyPage.tsx`  

### Proposed homepage addition

Insert **after About** (or merge About + Legacy):

| Block | Content source | Suggested ID |
| --- | --- | --- |
| Switzerland legacy | x-co-group.com (CHF 1.1B, years, markets) | `#legacy` or `#history` |
| Dubai legacy | Repurposed Dubai section | `#dubai` (keep hash) |
| Current opportunity | Existing Batumi section | `#batumi` |

Update `HOME_SECTION_IDS` in `src/components/nav/nav-data.ts` L20 if new anchor added.

### Philosophy page

Keep `/aixco-philosophy` but align hero/stats with **legacy timeline** rather than “investment platform” (`aixco-philosophy.ts` L57–58).

---

## Scope and phasing

### Phase 1 — Regular site (client priority)

- Hero, About, metrics, Participate, How it works, FAQs, Contact  
- Dubai legacy reframing  
- New or expanded Legacy / Switzerland block  
- Batumi as “current opportunity” (light copy pass)  
- Nav, metadata, chatbot, news ticker  
- All 6 languages in i18n files  
- Tests and translation coverage tests  

### Phase 2 — Deferred (explicitly out of scope now)

- **Energy** section: strings exist in `src/i18n/translations.ts` L62, L713–769 but **no route** under `src/app/` — do not add until client requests  
- **Legacy insight articles** (`legacy-insights.ts`): investor-heavy SEO; batch update or noindex later  
- **Supabase CMS** overrides: if production content is edited in DB, mirror schema/content migrations  

### Phase 3 — Client copy freeze

Client said they will **rewrite all texts** — implement structure + placeholder compliant copy, then swap in final prose.

---

## File-by-file change list

### Content source of truth

| File | Changes |
| --- | --- |
| `src/data/site.ts` | `company.tagline`; `metrics` labels/values; rename/restructure `dubaiFunds`; FAQ minimum amount; `participationRoutes` / `journeys` investor wording; `partners` “investment firm” strings L245–252 |
| `src/data/news.ts` | Remove/replace fund & EUR 1,000 ticker items L18–20, L46–50 |
| `src/data/aixco-philosophy.ts` | Replace “investment platform” / investor capital lines with legacy + real-estate services |

### New files (recommended)

| File | Purpose |
| --- | --- |
| `src/data/legacy-timeline.ts` | Switzerland, Dubai, Batumi chapters (stats + copy keys) |
| `src/components/sections/LegacyTimeline.tsx` | Homepage timeline UI |
| `src/components/sections/LegacyTimeline.test.tsx` | Section tests |

### Homepage layout

| File | Changes |
| --- | --- |
| `src/views/HomePage.tsx` | Insert `LegacyTimeline` (or `SwitzerlandLegacy`) between About and PhilosophyCallout or after Philosophy |
| `src/components/sections/DeferredHomeSectionsContent.tsx` | Order: Dubai (legacy) → Batumi (current) — document in nav labels |

### Hero

| File | Changes |
| --- | --- |
| `src/components/sections/hero/hero-ui.ts` | `heroPriceText`, `heroIntroText`; optional `heroPriceFootnote` |
| `src/components/sections/hero/HeroComposition.tsx` | Render footnote if added; kicker/tagline keys |
| `src/components/sections/Hero.test.tsx` | New price strings and intro copy |

### About & callouts

| File | Changes |
| --- | --- |
| `src/components/sections/About.tsx` | L29 holding/investor paragraph → brokerage + legacy pointer |
| `src/components/sections/PhilosophyCallout.tsx` | L16–19 Swiss discipline → link to legacy timeline / philosophy |

### Dubai

| File | Changes |
| --- | --- |
| `src/components/sections/Dubai.tsx` | Legacy header; rename props `fund` → `project` |
| `src/components/sections/dubai/DubaiFundCard.tsx` | Rename file/component; remove fund title renderer dependency on “Fund” |
| `src/components/sections/dubai/DubaiFundAssetGallery.tsx` | Gallery labels |
| `src/components/sections/dubai/dubai-data.ts` | `fundAssetGalleries` labels; export names |
| `src/components/sections/dubai/DubaiStatCard.tsx` | `data-fund-highlight-tile` → neutral attribute |
| `src/components/sections/Dubai.test.tsx` | Full selector and copy updates |

### Batumi & Participate

| File | Changes |
| --- | --- |
| `src/components/sections/Batumi.tsx` | Eyebrow: “Current opportunity” / Batumi focus |
| `src/components/sections/Participate.tsx` | L189–194 participation intro; bond block L129–137; section title keys |
| `src/components/sections/Participate.test.tsx` | Copy assertions |

### How it works, Team, Partners, Contact

| File | Changes |
| --- | --- |
| `src/components/sections/HowItWorks.tsx` | L31 “investing directly” |
| `src/components/sections/Contact.tsx` | L85–88 €1,000 registration copy |
| `src/components/sections/Partners.tsx` | Modal copy from `site.ts` partners (investment firm) |
| `src/components/Modals.tsx` | Login/register “participation journey” strings L59–62 |

### Navigation & shell

| File | Changes |
| --- | --- |
| `src/components/nav/nav-data.ts` | Optional `nav.legacy`; `HOME_SECTION_IDS` |
| `src/i18n/I18nProvider.tsx` | `cta.start`, `pageTitle`, `pageDescription`, keyed nav strings |
| `src/components/nav/NavControls.tsx` | Uses `cta.start` — no logic change if key updated |
| `src/app/layout.tsx` | Metadata title/description — remove “participation” / €1,000 |

### i18n

| File | Changes |
| --- | --- |
| `src/i18n/translations.ts` | All participation/investment/€1,000/fund strings (~28+ keys per grep) |
| `src/i18n/site-content-translations.ts` | Fund names, FAQ, journeys, partners, legal |
| `src/i18n/asset-translations.ts` | “Fund I/II asset image gallery” L2–9 |
| `src/i18n/I18nProvider.tsx` | Supplemental news strings L245–278 |
| `src/i18n/translation-coverage.test.ts` | New keys for timeline + renamed content |

### Chatbot

| File | Changes |
| --- | --- |
| `src/lib/chatbot/website-chatbot.ts` | Company profile L179; Dubai fund loop L236–246; fallbacks L362, L395, L403; synonym map `invest` L89–90 |
| `src/lib/chatbot/website-chatbot.test.ts` | Minimum amount answer |
| `src/components/ChatWidget.tsx` | Welcome message L65 — remove “Dubai funds” |
| `src/components/ChatWidget.test.tsx` | Optional message updates |

### Backend / API

| File | Changes |
| --- | --- |
| `src/lib/backend/site-content.ts` | Type rename `dubaiFunds` if renamed; defaults |
| `supabase/*` (if any) | Content seeds matching new schema |

### Philosophy & legacy routes

| File | Changes |
| --- | --- |
| `src/views/AixcoPhilosophyPage.tsx` | Display stats/sections from updated philosophy data |
| `src/app/aixco-philosophy/page.tsx` | Metadata |
| `src/app/aixco-global-op2/[slug]/page.tsx` | Footer EUR 1,000 L100 |
| `src/data/legacy-insights.ts` | Phase 2 — investor SEO (10 articles) |

### Tests (non-exhaustive)

| File | Changes |
| --- | --- |
| `src/components/sections/FAQs.test.tsx` | Minimum amount copy |
| `src/components/sections/About.test.tsx` | About paragraph |
| `src/components/sections/PhilosophyCallout.test.tsx` | Headline strings |
| `src/i18n/I18nProvider.test.tsx` | `cta.start` |
| `src/home-performance.test.ts` | If section order changes |

---

## Copy replacements table (draft — client to finalize)

English source strings only. Update all locales via `translations.ts` / `site-content-translations.ts` / `I18nProvider.tsx`.

| Old copy (representative) | New draft copy | Primary location(s) |
| --- | --- | --- |
| Quality Real Estate Participation | Real estate you can buy, sell, and manage | `site.ts` tagline; hero kicker; metadata |
| Participate where growth, stability… private partners… join selected real estate projects. | Buy, sell, and broker real estate with AIXCO—from apartment purchases in Batumi to end-to-end property administration. | `hero-ui.ts` L5–6 |
| Starting from €1,000 | Starting from €5,000* (*example 10% down on a €50,000 apartment) **OR** Starting from €10,000 — **client to choose** | `hero-ui.ts` L8; `I18nProvider` `cta.start` |
| (none) | *Reservation/down-payment terms vary by project. See FAQs. | New FAQ + hero footnote |
| disciplined real estate holding company… financial investments… co-investing in portfolios… investor trust | Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf—today focused on Batumi, with a legacy track record in Switzerland and Dubai. | `About.tsx` + `translations.ts` |
| Raised Capital | Real estate transacted (label TBD) | `site.ts` metrics |
| Investment Returns | Historical value created (label TBD) | `site.ts` metrics |
| Fund I Eden House The Canal & Eden House The Park | Eden House — The Canal & The Park (Dubai) | `site.ts` dubaiFunds[0].name |
| Fund II Dubai Healthcare City | Dubai Healthcare City (legacy development) | `site.ts` dubaiFunds[1].name |
| Dubai (section title only) | Dubai · Legacy portfolio | `Dubai.tsx` L34–35 |
| Performance: 4.9x / Target Net IRR | Volume sold · Units delivered · Status: realized / in progress (**client figures**) | `site.ts` fund details |
| Ways to Participate | How to work with AIXCO | Nav `nav.participate`; section eyebrow |
| How Customers/Partners Profit | Buy, broker, or list property | `Participate.tsx` heading |
| Choose the route… subscribe to the AIXCO 6% bond… | Buy a Batumi apartment, partner as a broker, or speak to us about property administration. (**Bond TBD**) | `Participate.tsx` L192–194 |
| What is the minimum investment amount? | What is the minimum amount to reserve or buy? | `site.ts` FAQ |
| The entry point starts from €1,000… | Typical entry starts from €5,000 (10% on selected €50,000 apartments) or €10,000 depending on project—**confirm with client** | `site.ts` FAQ answer |
| structured participation | direct purchase or brokerage mandate | FAQs, Modals |
| Whether you are investing directly… | Whether you are buying property, brokering clients… | `HowItWorks.tsx` L31 |
| AIXCO Fund I reaches a new Dubai portfolio milestone | AIXCO completes Eden House phase in Dubai legacy portfolio | `news.ts` |
| New overview explains participation from EUR 1,000 | New guide: buying Batumi apartments from €50,000 | `news.ts` |
| Participate in selected Batumi… starting from €1,000 | Buy selected Batumi apartments with transparent euro pricing from €50,000 (from €5,000 down). | `I18nProvider` pageDescription; `layout.tsx` |
| real estate participation platform | real estate buy-sell-brokerage platform | `website-chatbot.ts` L179 |
| Dubai funds | Dubai legacy projects | `ChatWidget.tsx`, chatbot fallbacks |
| Swiss discipline, real asset ownership… | From Switzerland to Dubai to Batumi—disciplined real estate execution since 2009. | `PhilosophyCallout.tsx` |
| (none — new) | Switzerland: CHF 1.1 billion in real estate activity (legacy) — source x-co-group.com | New `legacy-timeline.ts` |
| Batumi development update highlights new investor demand | Batumi development update: strong buyer demand | `news.ts` |

---

## Open questions for client follow-up

1. **Hero price:** €10,000 flat, €5,000 (10% of €50k), or show apartment price (€50k) with down-payment subline?  
2. **Bond route:** Keep 6% bond on site, reword, or remove for regulatory positioning?  
3. **Dubai figures:** Exact legacy stats (volume bought/sold, CHF/USD/EUR, in-progress vs exited)?  
4. **Switzerland:** Confirm CHF 1.1B wording and which facts to import from x-co-group.com (years, entity names, disclaimers).  
5. **“Opportunity-driven / revenue-based investors”:** Final approved phrase for Batumi?  
6. **Dubai status:** Confirm explicit “no new investments in Dubai” badge?  
7. **Administer real estate:** Which services to list (property management, rental admin, etc.)?  
8. **Metrics bar:** Which six stats replace “Raised Capital” and “Investment Returns”?  
9. **Energy site:** Timeline for phase 2?  
10. **Legal review:** Will compliance sign off on draft before translation?  

---

## Prioritized implementation order

1. **Client decisions** on hero pricing model, bond fate, and Dubai/Switzerland figures (block copy freeze).  
2. **Content model** — Add `legacy-timeline.ts`; rename `dubaiFunds` → legacy projects in `site.ts` + `SiteContent` type.  
3. **Hero + nav CTA + metadata** — `hero-ui.ts`, `I18nProvider.tsx`, `layout.tsx`, `Contact.tsx` (€1,000 removal).  
4. **About + metrics** — Reposition metrics away from investment fundraising language.  
5. **Legacy timeline section** — New homepage section + nav anchor; integrate Switzerland from x-co-group.com.  
6. **Dubai section refactor** — UI rename, fund → project copy, legacy badge, gallery labels.  
7. **Batumi section** — “Current opportunity” framing; keep property cards.  
8. **Participate + How it works + FAQs** — Buy/broker/admin journeys; FAQ down-payment explanation.  
9. **Philosophy + news ticker** — Align supporting pages.  
10. **Chatbot knowledge base** — `website-chatbot.ts` + widget welcome.  
11. **i18n pass** — DE, RU, KA, TR, AR for all changed keys.  
12. **Tests** — Hero, Dubai, FAQs, chatbot, translation coverage.  
13. **QA** — Manual pass for “fund”, “investment firm”, “€1,000”, “investor” on rendered homepage.  
14. **Phase 2 backlog** — Energy routes, legacy-insights SEO articles, Supabase content sync.  

---

## Requirement → codebase mapping (quick reference)

| Client requirement | Primary files |
| --- | --- |
| Not a pure investment firm | `site.ts`, `About.tsx`, `translations.ts`, `Participate.tsx`, `aixco-philosophy.ts`, partners in `site.ts` |
| Buy / sell / broker / administer | New legacy section + Participate/HowItWorks/FAQs; hero intro |
| €1,000 → €10k or 10% down | `hero-ui.ts`, `I18nProvider.tsx`, `site.ts` FAQ, `Contact.tsx` |
| Dubai: no funds; volume only | `site.ts` dubaiFunds, `Dubai*.tsx`, `dubai-data.ts`, `site-content-translations.ts` |
| Dubai + CH as legacy | New `LegacyTimeline.tsx`; refactor `Dubai.tsx` |
| Switzerland CHF 1.1B | New data from x-co-group.com (no existing section) |
| Batumi current focus | `Batumi.tsx`, `batumi-data.ts`, hero CTA flow |
| Regular site only; defer energy | No `src/app` energy route; ignore `translations.ts` Energy keys until phase 2 |
| Client rewrites copy | Treat table above as draft; structure first |

---

*Document generated for implementation planning. Do not commit `client-requirements-transcript.md` or `_transcribe_raw.json` (listed in `.gitignore`).*
