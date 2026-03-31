# AGENTS.md

## Project Overview
- Name: `desa-manud-jaya-admin-FE`
- Stack: Next.js 16, React 19, TypeScript, Redux Toolkit, Tailwind CSS v4, Radix UI
- Bootstrapped/generated with v0
- Primary product: admin and vendor portal for Desa Manud Jaya tourism/business workflows

## Runbook
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

## Architecture
- App Router pages live in `app/`
- Shared reusable UI primitives live in `components/ui/`
- Dashboard shell and admin layout components live in `components/dashboard/`
- Vendor-facing dashboard/package components live in `components/partner/`
- Redux store lives in `store/`
- Shared helpers and temporary mock-backed metrics live in `lib/`

## Routing Notes
- `/` redirects to `/login`
- `/dashboard` is role-aware and renders either admin dashboard or vendor dashboard variants
- Admin-focused flows include:
  - `/pusat-persetujuan`
  - `/verifikasi-eco`
  - `/kelola-mitra`
- Vendor-focused flows include:
  - `/kelola-paket`
  - `/profil-bisnis`
  - `/verifikasi-dokumen`
- Additional settings route:
  - `/pengaturan`

## State Management
- Redux Toolkit is the primary client-state layer
- Store is provided in `app/layout.tsx` through `ReduxProvider`
- Auth hydration happens client-side in `store/provider.tsx`
- Main slices:
  - `store/slices/auth-slice.ts`
  - `store/slices/admin-approval-slice.ts`

## API Conventions
- Base URL is read from `NEXT_PUBLIC_API_BASE_URL`
- Current code uses direct `fetch(...)` in several pages and Redux slices
- `lib/api.ts` exists as a shared helper but is not used consistently yet
- Prefer consolidating future API access behind shared helpers/services where practical

## Auth Notes
- Login flow currently calls `POST /auth/login`
- Vendor profile flow currently calls `GET /vendor`
- Supported portal login roles are:
  - `ADMIN`
  - `VENDOR`
- `USER` / traveler accounts must be rejected at login and must not be allowed into this portal
- Any unsupported role should also be rejected with a clear message
- Admin approval flows currently call:
  - `GET /admin/vendors/pending`
  - `POST /admin/vendors/:userId/approve`
  - `POST /admin/vendors/:userId/reject`
- Be careful with auth persistence changes: current code stores token, login user, vendor data, and session password in localStorage

## Role-Based Behavior
- Supported roles currently implemented in the app:
  - `ADMIN`
  - `VENDOR`
- Admin UI uses admin-focused menu items and approval workflows
- Vendor UI changes based on vendor approval/activation status
- Activated vendor states observed in code:
  - `APPROVED`
  - `ACTIVATED`
  - `ACTIVE`

## Admin Dashboard Notes
- The admin dashboard is no longer fully static
- These metrics are currently dynamic and should stay aligned with `pusat-persetujuan` data sources:
  - pending vendor registrations
  - pending tour package approvals
  - pending deletion requests
- Current dynamic sources:
  - pending vendors from `store/slices/admin-approval-slice.ts`
  - pending packages from `GET /admin/packages/pending`
  - deletion requests from `GET /admin/packages/deletion-requests?page=0&size=10`
- These metrics are currently temporary mock-backed values until backend APIs are available:
  - active partners
  - active tour packages
- Temporary mock values live in `lib/admin-dashboard-mock.ts` and should be replaced once the real APIs are ready
- The remaining cards currently stay as-is unless the task explicitly asks to change them

## UI and Styling Conventions
- Use existing `components/ui/*` primitives before introducing new base components
- Use `cn()` from `lib/utils.ts` for conditional class composition
- Keep styling aligned with existing Tailwind utility patterns
- Respect current role-specific visual conventions:
  - admin UI tends toward emerald accents
  - vendor UI tends toward blue accents

## Implementation Guidance
- Prefer small, targeted edits over large rewrites
- Preserve current route structure unless the task explicitly asks for refactoring
- Keep role-based branching explicit and easy to follow
- Reuse Redux hooks from `store/hooks.ts`
- Reuse existing dashboard shell components instead of duplicating layout wrappers
- For new dashboard metrics, prefer extracting reusable fetch/service helpers if the same API logic is needed in multiple screens

## Things to Watch Out For
- `next.config.mjs` currently ignores TypeScript build errors via `typescript.ignoreBuildErrors = true`
- There are many debug `console.log` statements in auth and approval flows
- Some code appears transitional or partially duplicated:
  - `lib/auth.ts` vs Redux auth flow
  - `lib/api.ts` vs direct `fetch` usage
- Some partner routes are placeholders marked under development
- Avoid introducing more auth persistence risk; do not store secrets in localStorage unless explicitly required
- Replace temporary dashboard mock metrics with API-backed values as soon as backend endpoints are available

## Suggested Cleanup Opportunities
- Remove or gate debug logging
- Standardize API access around shared helpers/services
- Revisit localStorage persistence of `sessionPassword`
- Add environment setup documentation for `NEXT_PUBLIC_API_BASE_URL`
- Replace `lib/admin-dashboard-mock.ts` with real API integration when available
- Add tests for auth and approval flows if the repo evolves further
