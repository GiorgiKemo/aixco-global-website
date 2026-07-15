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
npm test
npx tsc --noEmit
npm audit --omit=dev
```

## Environment

Copy `.env.example` to `.env.local` for local development and configure the Supabase and admin dashboard variables before enabling lead capture or `/admin` in production.

The admin dashboard supports individual Supabase Auth identities with mandatory TOTP MFA. See
[`docs/admin-auth-rollout.md`](docs/admin-auth-rollout.md) before changing `ADMIN_AUTH_MODE` in production.
