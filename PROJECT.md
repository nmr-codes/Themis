# Project: Themis (Huquqiy Yordam) — Legal Consultation Platform for Uzbekistan

## Architecture
Themis is a Next.js 14 (App Router) legal consultation platform designed to connect citizens of Uzbekistan with verified advocates (*advokatlar*) and legal advisors (*huquqshunoslar*), supported by an AI-assisted statutory triage engine grounded in national legislation (*Lex.uz*).

- **Framework**: Next.js 14.2.18 (App Router), React 18.3.1, TypeScript 5.6.0
- **Styling & Design System**: Tailwind CSS 3.4.0 with class-based theming, Radix UI primitives, Lucide icons, Sonner toasts
- **Editorial Design Identity**: Dual-typography pairing (Playfair Display / Serif for judicial authority + Plus Jakarta Sans for interface utility), warm Uzbek heritage palette (Obsidian Ink, Warm Parchment, Samarkand Azure, Bukhara Terracotta, Emerald Verification Seal, Antique Gold)
- **Data & Auth Layer**: Supabase PostgreSQL (16 tables with RLS and automated rating/consultation triggers) + client/server/middleware auth helpers + resilient offline demo persona switcher (`themis_demo_user` in localStorage)
- **AI Triage Layer**: OpenAI GPT-4o-mini structured analysis with local offline statutory rule engine (labor, family, housing, civil law articles)
- **Routing Architecture**:
  - Public routes: `/`, `/specialists`, `/specialists/[id]`, `/login`, `/register`
  - Client portal: `/dashboard`, `/ai-chat`, `/ai-chat/[id]`, `/consultations`, `/consultations/[id]`, `/consultations/[id]/chat`, `/profile`
  - Specialist portal: `/specialist`, `/specialist/requests`, `/specialist/profile`, `/specialist/services`, `/specialist/schedule`, `/specialist/earnings`
  - Admin portal: `/admin`, `/admin/specialists`, `/admin/users`, `/admin/consultations`, `/admin/reviews`, `/admin/transactions`
  - API routes: `/api/ai/chat`

---

## Feature Inventory
Every feature identified during the Survey phase is enumerated below with its assigned milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Multi-Role Registration | Client and specialist onboarding with role selection and validation | M5 | `themis.md` §5 |
| 2 | Unified Login & Demo Switcher | Secure authentication with 1-click test personas (Client, Specialist, Admin) | M5 | `README.md` §5 |
| 3 | Free-form Legal Inquiry | Conversational chat interface for initial legal problem submission | M4 | `themis.md` §6.2 |
| 4 | Legal Category Triage | Classification of citizen problem into 1 of 10 legal branches | M4 | `api/ai/chat` |
| 5 | Statutory Citations | Retrieval of relevant Uzbek legal codes and articles (Lex.uz) | M4 | `themis.md` §6.2 |
| 6 | Advocate Recommendations | AI matching of verified specialists based on category and region | M4 | `themis.md` §8 |
| 7 | Legal Disclaimer Enforcement | Persistent disclaimer regarding preliminary informational scope | M4 | `themis.md` §6.2 |
| 8 | Specialist Full-text Search | Search catalog by name, university, or keywords | M3 | `themis.md` §6.3 |
| 9 | Legal Branch Filtering | Filter catalog by 10 legal categories | M3 | `constants.ts` |
| 10 | Regional Jurisdiction Filter | Filter specialists across 14 regions of Uzbekistan | M3 | `constants.ts` |
| 11 | Online Status Filter | Toggle for specialists currently online and available | M3 | `specialists/page` |
| 12 | Minimum Rating Filter | Filter specialists by average customer score (4.5+, 4.8+) | M3 | `specialists/page` |
| 13 | Specialist Public Bio & Pedigree | Profile displaying university, graduation year, experience, and bio | M3 | `themis.md` §6.4 |
| 14 | Service Tariff Matrix | Cards detailing consultation formats (video/chat), durations, and UZS fees | M3 | `specialists/[id]` |
| 15 | Consultation Booking Modal | Interactive appointment request creation with date/time picker and notes | M3 | `themis.md` §6.4 |
| 16 | Consultation Tracking Tabs | Overview of active vs completed consultations with status badges | M5 | `themis.md` §6.5 |
| 17 | Secure Consultation Chat | Real-time chat room linked to confirmed consultation with simulated replies | M5 | `themis.md` §6.7 |
| 18 | Video Meeting Link Access | Direct launch of secure video consultation session | M5 | `README.md` §4 |
| 19 | Post-Consultation Rating | 1–5 star rating and comment submission | M5 | `themis.md` §10 |
| 20 | Specialist Reply to Review | Specialist's professional response to client review | M5 | `themis.md` §10.1 |
| 21 | Specialist Dashboard Metrics | KPI summary of consultations, pending requests, rating, earnings | M5 | `themis.md` §7.4 |
| 22 | Request Acceptance / Rejection | Manage incoming client booking requests with status updates | M5 | `themis.md` §7.4 |
| 23 | Service & Tariff Management | Create, edit, and delete consultation offerings in UZS | M5 | `themis.md` §7.3 |
| 24 | Weekly Availability Scheduling | Set daily working hours and day-off toggles | M5 | `themis.md` §7.4 |
| 25 | Online Presence Toggle | Real-time switch for instant client availability | M5 | `specialist/schedule` |
| 26 | Financial Earnings & Commission | Ledger view of completed consultations and 15% platform commission | M5 | `themis.md` §9 |
| 27 | Credential Document Upload | Submit diploma, advocate license, or certificates for verification | M5 | `themis.md` §7.1 |
| 28 | Admin KPI Overview | Global system monitoring of users, specialists, consultations, revenue | M5 | `themis.md` §14 |
| 29 | Specialist Credential Verification | Admin review of specialist licenses and 1-click Approve/Reject | M5 | `themis.md` §7.2 |
| 30 | Financial & Commission Audit | Monitor transactions, payment providers, and commission ledger | M5 | `themis.md` §9 |
| 31 | Review & Content Moderation | Inspect flagged reviews and inappropriate feedback | M5 | `themis.md` §10.1 |
| 32 | Audit Logging | Security logging of administrator operations and sensitive views | M5 | `themis.md` §16 |
| 33 | Build & TypeScript Stability | Fix fatal compile error in middleware.ts:40, configure ESLint | M1 | Survey Explorer 1 |
| 34 | Error & Loading Boundaries | Introduce error.tsx, loading.tsx, not-found.tsx App Router conventions | M1 | Survey Explorer 1 |
| 35 | Bespoke Editorial Design System | Serif + sans typography and warm Uzbek heritage palette in Tailwind/CSS | M1 | Survey Explorer 3 |
| 36 | Systemic Route Link Normalization | Fix broken /dashboard/ route prefixes across all navigation links | M2 | Survey Explorer 3 |
| 37 | Editorial Landing Masthead & Hero | Constitutional preamble, interactive legal triage bar, trust ticker | M2 | Survey Explorer 3 |
| 38 | Bespoke Legal Category Directory | Distinctive iconography, active routing, and legal code anchors | M2 | Survey Explorer 3 |
| 39 | Legal Policies & Terms | Authentic privacy policy and terms modals/pages | M2 | Survey Explorer 3 |
| 40 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test runner and test cases | E2E Track | ORIGINAL_REQUEST |
| 41 | E2E 100% Pass & Hardening (Tier 5) | Full verification and adversarial coverage hardening | M6 | ORIGINAL_REQUEST |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Requirement-driven test harness, runner, and test cases (Tiers 1-4), publish `TEST_READY.md` | none | DONE |
| M1 | Foundation, Build Stability & Editorial Design System | Fix `middleware.ts:40` compile error, add `.eslintrc.json`, add App Router error/loading/not-found boundaries, configure typography pairing and warm heritage palette in Tailwind/CSS | none | DONE |
| M2 | Navigation Architecture, Public Landing Page & Editorial Identity | Fix systemic 404 route link bugs (`/dashboard/specialists` -> `/specialists`), rebuild Landing Page (`/`) with Constitutional preamble, interactive triage bar, distinctive category icons with active links, trust tickers, and terms modals | M1 | DONE |
| M3 | Specialist Catalog & Detail Dossier Profiles | Rebuild `/specialists` with Attorney Dossier Cards, responsive fluid filters (10 branches, 14 regions, online status, ratings); rebuild `/specialists/[id]` with verified license dossier (`#ADV-xxxx`, Adliya Vazirligi), tariff matrix, and persistent consultation booking dialog | M1, M2 | DONE |
| M4 | AI Legal Consultation Flow & Statutory Guidance | Rebuild `/ai-chat` and `/ai-chat/[id]` with formal legal memorandum layout, parchment-styled Lex.uz citation cards, safety disclaimers, prompt suggestions for Uzbek legal disputes, and mobile viewport height fixes | M1, M2 | DONE |
| M5 | Secondary Portals Coherence, Consultation Management & Polish | Elevate Auth (`/login`, `/register`), Client Dashboard (`/dashboard`), Consultations & Chat (`/consultations`, `.../chat`), Specialist Portal (`/specialist/*`), Admin Panel (`/admin/*`) with editorial styling, fix console errors, and ensure visual coherence | M1, M2, M3, M4 | DONE |
| M6 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Phase 1: Pass 100% of E2E test suite (Tiers 1-4). Phase 2: Tier 5 adversarial coverage hardening with Challenger stress-testing | E2E, M1-M5 | DONE |

---

## Interface Contracts

### 1. Route Link Structure Contract (M1/M2 ↔ All Milestones)
All internal navigation links MUST adhere strictly to Next.js route group URLs without `/dashboard` prefixes:
- Specialist catalog: `/specialists` (NOT `/dashboard/specialists`)
- Specialist detail: `/specialists/[id]` (NOT `/dashboard/specialists/[id]`)
- AI consultation list: `/ai-chat` (NOT `/dashboard/ai-chat`)
- AI consultation session: `/ai-chat/[id]` (NOT `/dashboard/ai-chat/[id]`)
- User consultations: `/consultations` (NOT `/dashboard/consultations`)
- Consultation detail: `/consultations/[id]` (NOT `/dashboard/consultations/[id]`)
- Consultation chat: `/consultations/[id]/chat` (NOT `/dashboard/consultations/[id]/chat`)
- User profile: `/profile` (NOT `/dashboard/profile`)
- Client dashboard: `/dashboard`

### 2. Design Tokens & Styling Contract (M1 ↔ M2, M3, M4, M5)
- **Serif Font Class**: `font-serif` applied to judicial headlines, legal statutes, article citations, brand titles.
- **Sans Font Class**: `font-sans` applied to UI elements, buttons, data tables, filter dropdowns, badges.
- **Color Variables**:
  - `bg-background`: `#FAF8F5` (Warm Parchment / Legal Sand)
  - `text-foreground`: `#0B132B` (Obsidian Document Ink)
  - `bg-primary` / `text-primary`: `#0D47A1` (Samarkand Lapis Azure)
  - `accent` / `border-accent`: `#B84A2A` (Bukhara Terracotta)
  - `emerald-seal` / `badge-verified`: `#166534` (Adliya Vazirligi Verified Emerald Seal)
  - `gold-crest`: `#C59B27` (Judicial Ochre & Star Ratings)

### 3. Consultation Booking Persistence Contract (M3 ↔ M5)
When a user books a consultation on `/specialists/[id]`, the handler MUST save the consultation to `localStorage.getItem("themis_consultations")` (or database if authenticated), ensuring it immediately appears in `/consultations` with `status: 'pending'`.

---

## Code Layout
- `src/app/globals.css`: Editorial theme CSS variables, HSL color tokens, typography imports
- `src/app/layout.tsx`: Root layout, Google fonts (Serif + Sans), toast provider
- `src/app/error.tsx`: Root error boundary with graceful fallback
- `src/app/loading.tsx`: Root loading skeleton with editorial watermark
- `src/app/not-found.tsx`: Bespoke 404 page with navigation shortcuts
- `src/lib/supabase/middleware.ts`: Next.js middleware with fixed cookie removal and placeholder check
- `src/components/ui/`: Radix UI primitives with elevated editorial styling
- `src/components/editorial/`: Shared domain components (`TrustBadge`, `StatuteCitation`, `AttorneyDossierCard`, `LegalCategoryCard`)
- `tests/e2e/`: Opaque-box E2E test suite runner and test cases
