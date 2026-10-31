# Architectural Inventory & Project Survey Report
**Project:** Themis (Huquqiy Yordam) — Legal Consultation Platform for Uzbekistan  
**Author:** Survey Explorer 1 (gen2)  
**Date:** 2026-10-31  
**Status:** Completed  

---

## 1. Observation

### 1.1 Technical Stack & Configuration Files
- **`package.json`** (`c:\Users\Bro\Desktop\Themis\package.json`):
  - Next.js: `14.2.18` (App Router)
  - React / React-DOM: `^18.3.1`
  - TypeScript: `^5.6.0`
  - Tailwind CSS: `^3.4.0` with `tailwindcss-animate` (`^1.0.7`), `postcss` (`^8.4.0`), `autoprefixer` (`^10.4.0`)
  - Database & Auth: `@supabase/supabase-js` (`^2.45.0`), `@supabase/ssr` (`^0.5.0`)
  - AI SDK: `openai` (`^4.67.0`)
  - Icons: `lucide-react` (`^0.447.0`)
  - UI Primitives: 13 `@radix-ui/react-*` libraries (avatar, checkbox, dialog, dropdown-menu, label, popover, progress, scroll-area, select, separator, slot, tabs, toast)
  - Utilities: `clsx` (`^2.1.1`), `tailwind-merge` (`^2.5.0`), `class-variance-authority` (`^0.7.0`), `date-fns` (`^4.1.0`), `sonner` (`^1.5.0`)
- **`next.config.mjs`** (`c:\Users\Bro\Desktop\Themis\next.config.mjs` lines 1-10):
  Configures image remote patterns for Supabase storage:
  ```js
  const nextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '*.supabase.co' },
      ],
    },
  };
  export default nextConfig;
  ```
- **`tsconfig.json`** (`c:\Users\Bro\Desktop\Themis\tsconfig.json` lines 1-21):
  Target `esnext`, `moduleResolution: "bundler"`, `strict: true`, path alias `"@/*": ["./src/*"]`.
- **`tailwind.config.ts`** (`c:\Users\Bro\Desktop\Themis\tailwind.config.ts` lines 1-50):
  Uses class-based dark mode (`darkMode: ["class"]`), container centered at 1400px max width, HSL CSS variable mapping for colors (`border`, `input`, `ring`, `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`).
- **`components.json`** (`c:\Users\Bro\Desktop\Themis\components.json` lines 1-20):
  Default shadcn/ui configuration with `baseColor: "blue"`, `cssVariables: true`, `css: "src/app/globals.css"`.
- **`src/app/globals.css`** (`c:\Users\Bro\Desktop\Themis\src\app\globals.css` lines 6-32):
  Default blue palette: `--primary: 221.2 83.2% 53.3%` (standard `#2563eb`), generic SaaS styling without legal gravitas or cultural identity.
- **`src/app/layout.tsx`** (`c:\Users\Bro\Desktop\Themis\src\app\layout.tsx` lines 2, 6, 21):
  Default Next.js Google font `Inter`:
  ```tsx
  const inter = Inter({ subsets: ["latin", "cyrillic"] });
  ...
  <body className={inter.className}>
  ```
- **ESLint status**:
  No `.eslintrc.json` or `.eslintrc.js` file exists in the repository. Running `npm run lint` yields:
  ```
  ? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
  ❯  Strict (recommended)
     Base
     Cancel
  ```

---

### 1.2 Routing Structure & Page Inventory (`src/app`)

Total: **18 pages**, **4 layouts**, **1 API route**:

| Route Group | URL Path | File Path | Type & Purpose |
|---|---|---|---|
| **Public** | `/` | `src/app/page.tsx` | Landing page (Hero, 4-step workflow, categories, features, CTA, footer) |
| **Auth** | `/login` | `src/app/(auth)/login/page.tsx` | Login with Supabase + Quick Demo role presets (User, Specialist, Admin) |
| **Auth** | `/register` | `src/app/(auth)/register/page.tsx` | Registration page with role switch (Mijoz vs Huquqiy mutaxassis) |
| **Dashboard** | `layout` | `src/app/(dashboard)/layout.tsx` | Main application shell: responsive sidebar, topbar, active route state, profile widget, logout |
| **Dashboard** | `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | User home dashboard: greeting banner, quick metrics, recent chats, lawyer shortcuts |
| **Dashboard** | `/dashboard/ai-chat` | `src/app/(dashboard)/ai-chat/page.tsx` | AI conversation list, legal disclaimer box, new chat trigger |
| **Dashboard** | `/dashboard/ai-chat/[id]` | `src/app/(dashboard)/ai-chat/[id]/page.tsx` | Interactive AI consultation chat: citation accordion, lawyer recommendation cards, prompt input |
| **Dashboard** | `/dashboard/specialists` | `src/app/(dashboard)/specialists/page.tsx` | Specialist catalog with search, category filter, region filter, online filter, rating filter |
| **Dashboard** | `/dashboard/specialists/[id]` | `src/app/(dashboard)/specialists/[id]/page.tsx` | Specialist public profile: bio, credentials, services list, reviews, consultation booking dialog |
| **Dashboard** | `/dashboard/consultations` | `src/app/(dashboard)/consultations/page.tsx` | User consultation history: active vs completed tabs, video call launch buttons |
| **Dashboard** | `/dashboard/consultations/[id]` | `src/app/(dashboard)/consultations/[id]/page.tsx` | Consultation details: meeting link, lawyer contact, case description, review submission modal |
| **Dashboard** | `/dashboard/consultations/[id]/chat` | `src/app/(dashboard)/consultations/[id]/chat/page.tsx` | Direct consultation chat between user and lawyer with simulated replies |
| **Dashboard** | `/dashboard/profile` | `src/app/(dashboard)/profile/page.tsx` | Client personal profile settings: name, phone, region, preferred language |
| **Specialist** | `layout` | `src/app/(specialist)/layout.tsx` | Specialist cabinet layout: verification badge, professional navigation links |
| **Specialist** | `/specialist` | `src/app/(specialist)/specialist/page.tsx` | Specialist dashboard: incoming requests KPI, monthly consultations, verification banner |
| **Specialist** | `/specialist/requests` | `src/app/(specialist)/specialist/requests/page.tsx` | Client booking requests queue: Accept/Reject actions |
| **Specialist** | `/specialist/profile` | `src/app/(specialist)/specialist/profile/page.tsx` | Specialist resume editor: education, university, graduation year, credentials upload |
| **Specialist** | `/specialist/services` | `src/app/(specialist)/specialist/services/page.tsx` | Pricing and services management: format (chat/video), duration, price in UZS |
| **Specialist** | `/specialist/schedule` | `src/app/(specialist)/specialist/schedule/page.tsx` | Working hours per day of the week, online availability toggle |
| **Specialist** | `/specialist/earnings` | `src/app/(specialist)/specialist/earnings/page.tsx` | Earnings breakdown: gross receipts, 15% platform fee, net payout |
| **Admin** | `layout` | `src/app/(admin)/layout.tsx` | Admin panel shell: dark theme sidebar with pending verification badge count |
| **Admin** | `/admin` | `src/app/(admin)/admin/page.tsx` | Platform executive KPI overview: user counts, active specialists, total platform fees |
| **Admin** | `/admin/specialists` | `src/app/(admin)/admin/specialists/page.tsx` | Specialist application verification & credential auditing (Approve/Reject) |
| **Admin** | `/admin/users` | `src/app/(admin)/admin/users/page.tsx` | User directory table with role badges and search |
| **Admin** | `/admin/consultations` | `src/app/(admin)/admin/consultations/page.tsx` | Consultation audit log with fees and scheduled timestamps |
| **Admin** | `/admin/reviews` | `src/app/(admin)/admin/reviews/page.tsx` | Review moderation table with delete action for inappropriate feedback |
| **Admin** | `/admin/transactions` | `src/app/(admin)/admin/transactions/page.tsx` | Financial audit of Payme/Click transactions and platform commission |
| **API** | `/api/ai/chat` | `src/app/api/ai/chat/route.ts` | POST endpoint: OpenAI GPT-4o-mini structured JSON responses with robust local legal fallback |

**Missing App Router conventions directly observed**:
- No `error.tsx` in `src/app` or any sub-routes.
- No `loading.tsx` in `src/app` or sub-routes (only one component-level `Suspense` fallback in `specialists/page.tsx`).
- No `not-found.tsx` in `src/app`.

---

### 1.3 Supabase & Database Architecture

- **`supabase/migrations/001_initial_schema.sql`** (489 lines):
  - Extensions: `uuid-ossp`
  - Tables:
    1. `public.profiles` (id, user_id, full_name, phone, email, avatar_url, region, preferred_language, role, timestamps)
    2. `public.legal_categories` (id, name_uz, name_ru, description_uz, description_ru, icon, sort_order) — pre-seeded with 10 categories
    3. `public.specialists` (id, user_id, full_name, phone, email, avatar_url, bio, region, languages, experience_years, education, university, graduation_year, previous_workplaces, verification_status, admin_notes, is_online, rating_avg, rating_count, consultation_count)
    4. `public.specialist_categories` (specialist_id, category_id)
    5. `public.specialist_credentials` (id, specialist_id, credential_type, title, issuer, issue_date, expiry_date, document_url, verification_status, admin_notes)
    6. `public.services` (id, specialist_id, name, description, duration_minutes, price, currency, format, is_active)
    7. `public.availabilities` (id, specialist_id, day_of_week, start_time, end_time, is_available)
    8. `public.ai_conversations` (id, user_id, title, legal_category_id, status)
    9. `public.ai_messages` (id, conversation_id, role, content, sources, recommended_specialists)
    10. `public.consultations` (id, user_id, specialist_id, service_id, ai_conversation_id, status, scheduled_at, started_at, completed_at, cancelled_at, cancellation_reason, meeting_link, user_notes, specialist_notes)
    11. `public.chat_messages` (id, consultation_id, sender_id, content, attachment_url, attachment_name, is_read)
    12. `public.transactions` (id, consultation_id, user_id, specialist_id, amount, platform_fee, specialist_amount, currency, status, payment_provider, payment_id)
    13. `public.reviews` (id, consultation_id, user_id, specialist_id, rating, comment, specialist_reply, status)
    14. `public.notifications` (id, user_id, type, title, message, data, is_read)
    15. `public.complaints` (id, reporter_id, reported_user_id, consultation_id, review_id, type, description, status, admin_notes)
    16. `public.audit_logs` (id, user_id, action, entity_type, entity_id, details, ip_address)
  - Security & Automations:
    - Row-Level Security (RLS) enabled on all 16 tables.
    - PostgreSQL trigger `handle_new_user()` on `auth.users` to populate `profiles`.
    - PostgreSQL trigger `update_specialist_rating()` on `reviews` to update average rating.
    - PostgreSQL trigger `increment_consultation_count()` on `consultations` on completion.

- **Supabase Client Layer**:
  - `src/lib/supabase/client.ts`: Browser client initialization.
  - `src/lib/supabase/server.ts`: Server client (`createServerClient`) and Service Role client (`createServiceClient`).
  - `src/lib/supabase/middleware.ts`: Next.js request middleware session updater.

- **Mock Data Fallbacks**:
  - `src/lib/mock-data.ts`: Predefined data for 3 lawyers (`Azizbek Rahimov`, `Dilnoza Karimova`, `Rustam Mahmudov`) with complete profiles, services, and client reviews.
  - LocalStorage key `themis_demo_user` enables offline testing with User, Specialist, and Admin roles without Supabase credentials.

---

### 1.4 Verbatim Build Verification Output

Running command `npm run build` failed with the following exact compiler output:

```
> themis@0.1.0 build
> next build

  ▲ Next.js 14.2.18
  - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
Failed to compile.

./src/lib/supabase/middleware.ts:40:40
Type error: No value exists in scope for the shorthand property 'value'. Either declare one or provide an initializer.

  38 |             request: { headers: request.headers },
  39 |           });
> 40 |           response.cookies.set({ name, value, ...options });
     |                                        ^
  41 |         },
  42 |       },
  43 |     });
```

---

## 2. Logic Chain

1. **Build Failure Cause Analysis**:
   - In `src/lib/supabase/middleware.ts`, lines 35-41:
     ```ts
     remove(name: string, options: CookieOptions) {
       request.cookies.set({ name, value: "", ...options });
       response = NextResponse.next({
         request: { headers: request.headers },
       });
       response.cookies.set({ name, value, ...options });
     }
     ```
   - The method parameters for `remove` are `(name: string, options: CookieOptions)`. There is no `value` parameter declared in this scope.
   - On line 36, the author wrote `{ name, value: "", ...options }` correctly.
   - On line 40, the author used shorthand `{ name, value, ...options }`, referencing the non-existent identifier `value`.
   - In `src/lib/supabase/server.ts` line 23, the identical cookie removal method is correctly implemented as:
     `cookieStore.set({ name, value: "", ...options })`.
   - Therefore, line 40 in `middleware.ts` is an uninitialized shorthand bug and must be changed to `{ name, value: "", ...options }`.

2. **Supabase Environment Fallback Logic Gap**:
   - `src/lib/supabase/middleware.ts` line 16 checks:
     `supabaseUrl.includes("your-project") || supabaseKey.includes("your-anon-key")`.
   - However, `.env.local` contains:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://placeholder-domain.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
     ```
   - Because neither `"placeholder-domain"` contains `"your-project"` nor `"placeholder-anon-key"` contains `"your-anon-key"`, the middleware bypass condition evaluates to `false`. It then proceeds to instantiate `@supabase/ssr` with dummy domain `placeholder-domain.supabase.co`, leading to DNS resolution failures or network timeouts on every server request.
   - To make the demo mode 100% resilient offline, the check must include `"placeholder"` checks or test whether the URL is valid/reachable.

3. **Design System & AI-Slop Assessment (R1)**:
   - Observation: `globals.css` defines `--primary: 221.2 83.2% 53.3%` (#2563eb), which is the generic default shadcn blue.
   - Observation: `layout.tsx` imports and applies `Inter` font directly.
   - Observation: `LandingPage` (`src/app/page.tsx`) uses default generic SaaS patterns:
     - Gradient hero: `from-primary/5 via-background to-primary/10`
     - Rounded pill badge: `bg-primary/10 text-primary`
     - Standard 4-step number grid with circular badges
     - Generic icon-in-square category cards
   - Context: Themis is a legal consultation platform in Uzbekistan dealing with law codes, court disputes, and advocate credentials.
   - Conclusion: The visual language needs to shift from generic SaaS template to an authoritative, trustworthy, editorial identity (deep navy / warm parchment / refined bronze/gold accents, elegant serif headings, structured typographic hierarchy, cultural Uzbek geometric motifs).

---

## 3. Caveats

- **Active Supabase Server**: A live Supabase backend was not connected during this survey; all behavior was validated through offline static analysis, schema inspection, and compilation tests.
- **Payment Gateway Integration**: Click / Payme integrations in the admin and specialist views are currently represented as structural prototypes with transactions mock data rather than live merchant webhooks.
- **ESLint Configuration**: ESLint prompts interactively because `.eslintrc.json` is missing; creating `.eslintrc.json` extending `"next/core-web-vitals"` will allow non-interactive CI linting.

---

## 4. Conclusion

1. **System Readiness**: The platform has a coherent and well-structured foundation of 18 routes, 4 layouts, comprehensive Supabase schema (16 tables), and robust Uzbek legal mock data with rule-based AI fallback.
2. **Immediate Blocker**: Production build `npm run build` is strictly blocked by 1 compile error in `src/lib/supabase/middleware.ts:40`.
3. **Proposed Fix for Implementer**:
   - File: `src/lib/supabase/middleware.ts`
   - Line 40:
     ```diff
     - response.cookies.set({ name, value, ...options });
     + response.cookies.set({ name, value: "", ...options });
     ```
   - Update fallback condition on lines 16-17 to include `"placeholder"`:
     ```diff
     - supabaseUrl.includes("your-project") ||
     - supabaseKey.includes("your-anon-key")
     + supabaseUrl.includes("your-project") ||
     + supabaseUrl.includes("placeholder") ||
     + supabaseKey.includes("your-anon-key") ||
     + supabaseKey.includes("placeholder")
     ```
4. **Design Elevation Targets**:
   - Primary journeys (`/`, `/dashboard/specialists`, `/dashboard/specialists/[id]`, `/dashboard/ai-chat/[id]`) need replacement of the default Inter font and shadcn blue palette with a bespoke legal editorial aesthetic.
   - Introduce global error and loading boundaries (`error.tsx`, `loading.tsx`, `not-found.tsx`).

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Verify Build Error**:
   Run the project build command:
   ```powershell
   npm run build
   ```
   *Expected Output*: Fails at `src/lib/supabase/middleware.ts:40:40` with `Type error: No value exists in scope for the shorthand property 'value'`.

2. **Verify Route Existence**:
   Inspect all 18 routes listed in Section 1.2 using:
   ```powershell
   Get-ChildItem -Recurse -File src/app | Where-Object { $_.Name -like "page.tsx" -or $_.Name -like "route.ts" } | Select-Object FullName
   ```

3. **Verify Design System Variables**:
   Inspect `src/app/globals.css` and `src/app/layout.tsx` to verify font and color definitions.
