# Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing AIXCO Vite React SPA to Next.js App Router without intentional design changes, while replacing old committed `.html` pages with Next-rendered routes.

**Architecture:** Keep the existing React section/component tree and Tailwind design system. Introduce a Next App Router shell with a client provider wrapper for i18n, Supabase-backed content, modals, chat, and scroll/hash behavior. Rebuild legacy HTML insight URLs as data-driven Next pages under `/aixco-global-op2/[slug]`.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Radix UI, Supabase JS, Vitest, Playwright CLI, Vercel.

---

### Task 1: Branch and Baseline

**Files:**
- Create: `docs/superpowers/plans/2026-05-08-nextjs-migration.md`
- Modify: none

- [x] **Step 1: Create migration branch**

Run: `git switch -c codex/nextjs-migration`

Expected: branch changes from `main` to `codex/nextjs-migration`.

- [x] **Step 2: Record baseline checks**

Run: `npm test`

Expected: existing Vitest suite reports current baseline before migration edits.

### Task 2: Next App Router Shell

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/app/client-shell.tsx`
- Create: `src/components/ScrollManager.tsx`
- Move: `src/pages/Index.tsx` to `src/views/HomePage.tsx`
- Move: `src/pages/NotFound.tsx` to `src/views/NotFoundView.tsx`

- [x] **Step 1: Move global app providers into a client shell**

Create `src/app/client-shell.tsx` with `"use client"` and wrap children with `I18nProvider`, `SiteContentProvider`, `UIProvider`, `ScrollManager`, lazy `Modals`, and `ChatWidget`.

- [x] **Step 2: Create the root Next layout**

Create `src/app/layout.tsx` importing `src/index.css`, setting metadata equivalent to the current `index.html`, and rendering `<ClientShell>{children}</ClientShell>`.

- [x] **Step 3: Create the home page**

Create `src/app/page.tsx` that renders the migrated `src/views/HomePage.tsx` default export.

- [x] **Step 4: Create the 404 page**

Create `src/app/not-found.tsx` that renders the existing not-found UI with normal anchors instead of React Router links.

### Task 3: Remove Router/Vite Coupling

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/components/Logo.tsx`
- Delete: `src/components/NavLink.tsx`
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/Participate.tsx`
- Modify: `src/components/sections/HowItWorks.tsx`
- Modify: `src/lib/aixco-live-assets.ts`
- Modify: `src/lib/supabase/client.ts`
- Delete: `src/vite-env.d.ts`

- [x] **Step 1: Replace React Router links with anchors**

Use normal `<a href="/">`, `<a href="/#section">`, and `window.history.pushState`/`replaceState` where needed so hash navigation stays visually identical.

- [x] **Step 2: Replace `useNavigate` calls**

Replace `navigate("/#batumi")` style calls with a small client helper that updates `window.history`, dispatches a popstate event, and calls existing smooth-scroll behavior.

- [x] **Step 3: Replace `useLocation`**

Use a local `pathname/hash` state driven by `window.location`, `hashchange`, `popstate`, and scroll events in the navigation component.

- [x] **Step 4: Replace `import.meta.env`**

Use `process.env.NEXT_PUBLIC_*` in app code and `process.env.NODE_ENV === "test"` for test mode.

### Task 4: Next Config and Package Scripts

**Files:**
- Create: `next.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Modify: `vercel.json`
- Delete: `vite.config.ts`
- Delete: `tsconfig.app.json`
- Delete: `tsconfig.node.json`

- [x] **Step 1: Install Next dependencies**

Run: `npm install next@latest react@latest react-dom@latest eslint-config-next@latest`

Expected: `package.json` and `package-lock.json` include Next and compatible React versions.

- [x] **Step 2: Update scripts**

Change `dev` to `next dev -p 8080`, `build` to `next build`, `preview` to `next start -p 4173`, and keep `test`.

- [x] **Step 3: Configure Next**

Create `next.config.mjs` with Vercel-safe headers matching current media/cache behavior and without the Vite SPA rewrite.

- [x] **Step 4: Configure TypeScript**

Add Next plugin/types to `tsconfig.json` while preserving `@/*` path aliases.

### Task 5: Legacy HTML Pages as Next Routes

**Files:**
- Create: `src/data/legacy-insights.ts`
- Create: `src/app/aixco-global-op2/[slug]/page.tsx`
- Create: `src/app/aixco-global-op2/page.tsx`
- Create: `src/app/sitemap.ts`
- Delete: `public/sitemap.xml`
- Delete: `public/aixco-global-op2/*.html`
- Delete: tracked old `docs/` static build output, preserving `docs/superpowers`

- [x] **Step 1: Extract article metadata/content**

Create a structured data file with slugs, titles, descriptions, kicker text, article sections, and CTA links for the old HTML insight pages.

- [x] **Step 2: Render `.html` legacy routes in Next**

Implement `src/app/aixco-global-op2/[slug]/page.tsx` so `/aixco-global-op2/batumi-short-term-rentals.html` and similar URLs render with the AIXCO design system.

- [x] **Step 3: Add metadata generation**

Generate title, description, canonical, and Open Graph metadata from the structured data.

- [x] **Step 4: Remove old static HTML files**

Delete only the old `.html` files from `public/aixco-global-op2`; keep media, images, documents, and animations.

### Task 6: Verification

**Files:**
- No planned production edits unless verification identifies required fixes.

- [x] **Step 1: Unit tests**

Run: `npm test`

Expected: all existing tests pass or migration-specific failing tests are fixed.

- [x] **Step 2: Production build**

Run: `npm run build`

Expected: Next production build exits successfully.

- [x] **Step 3: Browser audit**

Run the Next dev server and use Playwright against `http://localhost:8081/` for desktop and mobile smoke checks because port 8080 was already in use.

Expected: no console errors, no failed media requests, no horizontal overflow, and home/legacy pages render.
