# AIXCO Global Website

Premium real-estate participation website for AIXCO Global, built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase-backed lead/admin workflows.

## Development

```bash
npm install
npm run dev
```

Local development runs at `http://localhost:8081`.

## Build

```bash
npm run build
```

## Production Preview

```bash
npm run build
npm run preview
```

Production preview runs at `http://localhost:4173`.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run typecheck:test
npm run test:coverage
npm run test:i18n
npm run build
npm audit --omit=dev
node scripts/verify-migration-history.mjs
npm run build && node scripts/verify-production-budgets.mjs
```

CI additionally replays every Supabase migration against an isolated Postgres
instance, lints the resulting schema, starts the production build, and runs
every Chromium browser gate: general rendering, five locales,
language/viewport combinations, Dubai layout, navigation scaling, full mobile
experience, and mobile-only scope.
The same job enforces measured homepage JavaScript/CSS, largest-chunk, and total
JavaScript budgets with modest headroom over the accepted production baseline.

## Environment

Copy `.env.example` to `.env.local` for local development and configure the Supabase and admin dashboard variables before enabling lead capture or `/admin` in production.

The admin dashboard supports individual Supabase Auth identities with mandatory TOTP MFA. See
[`docs/admin-auth-rollout.md`](docs/admin-auth-rollout.md) before changing `ADMIN_AUTH_MODE` in production.

## Production operations

- Vercel hosts the application. GitHub Pages is not a deployment target and
  must remain disabled in the repository settings.
- `Production release gate` is the aggregate required CI check. Protect
  `main` and require this check before merge, and configure Vercel production
  promotion to wait for it. Repository files cannot enforce those two provider
  settings by themselves.
- CI validates that Supabase migration files are append-only, uniquely
  versioned, ordered, non-empty, replayable from zero, schema-lint clean, and
  free of merge markers. A production release that contains a migration must
  apply it before application promotion, then verify `/api/health/contact-pipeline`.
- Supabase `pg_cron`/`pg_net` owns the primary five-minute contact-email cadence
  using URL and bearer values stored in Supabase Vault. The GitHub `Contact
  email recovery worker` is deliberately hourly and drains multiple batches;
  it also verifies the private pipeline health endpoint. GitHub schedules are
  not a five-minute delivery guarantee.
- Resend must send signed delivery events to `/api/webhooks/resend`; provider
  acceptance alone is not treated as inbox delivery. See the Supabase runbook
  for supported events, verification, and safe secret rotation.
- Daily operational retention runs through Vercel Cron. A delayed GitHub job
  provides a second recovery invocation.
- Core Web Vitals use stable 25% production-session sampling by default (set
  `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE` from `0` to `1` to override). Events are
  accepted only from approved same-site origins, bounded, rate-limited, and
  persisted through the server-only telemetry store. Configure
  production alerts for poor LCP/INP/CLS rates and ingestion failures.

Required provider setup and verification details live in
[`supabase/README.md`](supabase/README.md).
