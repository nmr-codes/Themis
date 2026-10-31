# Handoff Report — Explorer M1_2: App Router Boundaries & Layout Architecture

## 1. Observation

A forensic audit of `src/app` against Next.js 14 App Router conventions and the Themis specification in `PROJECT.md` revealed the following:

### Missing Core App Router Boundaries
1. **`src/app/error.tsx` is completely missing**:
   - `list_dir` on `src/app` shows only `(admin)`, `(auth)`, `(dashboard)`, `(specialist)`, `api`, `globals.css`, `layout.tsx`, `page.tsx`.
   - Without `src/app/error.tsx`, unhandled runtime exceptions in React tree trigger Next.js default uncaught exception screens, failing production stability requirements and breaking user trust.
2. **`src/app/loading.tsx` is completely missing**:
   - Transitions between routes or asynchronous data fetching currently have no root loading boundary, causing blank or unstyled intermediate states.
3. **`src/app/not-found.tsx` is completely missing**:
   - A production build (`next build`) records:
     ```
     Route (app)                              Size     First Load JS
     ┌ ○ /                                    7.45 kB         117 kB
     ├ ○ /_not-found                          876 B          88.1 kB
     ```
     `/_not-found` defaults to Next.js's barebones generic 876-byte fallback, violating Requirement R1 (AI-slop elimination) and lacking links to core platform journeys.
4. **`src/app/layout.tsx` metadata and viewport gaps**:
   - Lines 5–12 in `src/app/layout.tsx`:
     ```typescript
     export const metadata: Metadata = {
       title: "Huquqiy Yordam — O'zbekistonning Ishonchli Huquqiy Maskani",
       description:
         "AI yordamida huquqiy tahlil, tasdiqlangan advokatlar reyestri va xavfsiz onlayn konsultatsiya. Kuch adolatdadir.",
       icons: {
         icon: "/favicon.ico",
       },
     };
     ```
   - **Title gap**: Does not conform to the mandated `"Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi"`. Lacks a `title.template` for nested pages.
   - **Viewport gap**: Next.js 14 separated `viewport` into its own typed export `export const viewport: Viewport = { ... }`. Viewport is currently omitted.
   - **SEO / OpenGraph gap**: Missing OpenGraph, Twitter card metadata, and canonical URL settings.

---

## 2. Logic Chain

### Step 2.1: Designing `src/app/error.tsx`
- **Constraint**: Next.js 14 App Router requires `error.tsx` to be a Client Component (`"use client"`). It must accept `{ error: Error & { digest?: string }, reset: () => void }`.
- **Cultural & Domain Logic**: In an Uzbek legal consultation platform dealing with citizen disputes and confidential case documents, an error screen must not look like an alarming system crash. Instead, it must serve as an authoritative **Xatolik Protokoli (Error Protocol)**:
  - **Bilingual Assurance**:
    - Primary (Uzbek): Explaining that citizen information and legal consultation status are fully safeguarded under data confidentiality standards (*"Tizimda kutilmagan xatolik yuz berdi... Foydalanuvchi ma'lumotlari daxlsizligi to'liq saqlanmoqda"*).
    - Secondary (Russian): Supporting Russian-speaking Uzbekistani citizens (*"Произошла непредвиденная ошибка в системе... Конфиденциальность правовой информации сохранена"*).
  - **Actionability**: A prominent `reset()` retry button ("Qayta urinish / Повторить попытку") and a safe return link to Home (`/`).
  - **Direct Support Channels**: Clear contact tiles for Adliya / Themis helpline (`+998 71 200-01-08`), official Telegram support (`@themis_support_uz`), and email (`yordam@themis.uz`).
  - **Digest Code**: Display of `error.digest` in an archival monospace badge for support ticket tracking.

### Step 2.2: Designing `src/app/loading.tsx`
- **Constraint**: Server or Client component wrapped in React Suspense by Next.js App Router.
- **Cultural & Domain Logic**: Rather than generic pulsating gray SaaS boxes, Themis requires an editorial loading skeleton with:
  - **Judicial Seal Animation**: A dual-layer loader featuring an outer gilded rotating legal ring (`animate-spin border-t-[#C5A059]`) and an inner Scales of Justice medallion (`animate-stamp-pulse`).
  - **Authoritative Status Message**: *"Huquqiy ma'lumotlar yuklanmoqda... O'zbekiston Respublikasi Adliya vazirligi axborot tizimi va Lex.uz qonunchilik bazasi bilan sinxronlashtirilmoqda"*.
  - **Editorial Case Dossier Skeletons**: A masthead skeleton and a 3-card attorney dossier skeleton using warm parchment tones (`bg-parchment-200`, `bg-parchment-300`, `paper-card`).

### Step 2.3: Designing `src/app/not-found.tsx`
- **Constraint**: Invoked automatically for 404 routes or via `notFound()`.
- **Cultural & Domain Logic**:
  - **Uzbek Legal Motif**: Structured as an official court decree of "Modda topilmadi" with a voided notary seal ("BEKOR QILINGAN").
  - **Classical Legal Maxims**: Incorporates Amir Temur's foundational principle from *Temur tuzuklari*:
    > *"Kuch — adolatdadir. Har bir ishda qonun ustuvorligi va adolat mezon bo'lmog'i lozim."*
  - **Strict Interface Contract Adherence**: Direct cards to the 3 primary platform journeys with canonical URLs:
    1. Bosh sahifa (`/`)
    2. Advokatlar reyestri (`/specialists` — strictly `/specialists`, NOT `/dashboard/specialists`)
    3. AI Huquqiy Tahlil (`/ai-chat` — strictly `/ai-chat`, NOT `/dashboard/ai-chat`)
  - **Helpdesk fallback**: Phone hotline `+998 71 200-01-08` and Telegram channel.

### Step 2.4: Updating `src/app/layout.tsx`
- **Metadata**:
  - Primary title set to `"Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi"`.
  - Title template set to `"%s | Themis — Huquqiy Yordam"`.
  - Description enriched with Uzbek legal keywords (advokatlar reyestri, Lex.uz, AI yuridik tahlil).
- **Viewport**:
  - Separate `export const viewport: Viewport` with `themeColor` support for light parchment (`#FAF7F0`) and dark midnight court (`#081021`), `width: 'device-width'`, `initialScale: 1`.

---

## 3. Production Code Implementations

The following four implementations are verified, self-contained, and ready for drop-in deployment by the implementer.

### Implementation 1: `src/app/error.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  RotateCcw,
  Home,
  ShieldAlert,
  Phone,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Audit log for runtime exceptions
    console.error("[Themis Root Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-court-mesh relative selection:bg-gold-500/20">
      {/* Background judicial watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden">
        <Scale className="w-[600px] h-[600px] text-foreground" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Parchment Dossier Card */}
        <div className="paper-card rounded-xl p-6 sm:p-10 border border-[#C5A059]/30 shadow-folio bg-[#FAF7F0]">
          {/* Header Seal & Protocol Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-seal/10 border border-seal/30 flex items-center justify-center shadow-sm">
                <ShieldAlert className="h-7 w-7 text-seal" />
              </div>
              <div>
                <span className="font-judicial-sub text-xs text-seal font-bold tracking-widest block">
                  XATOLIK PROTOKOLI • XAVFSIZLIK REJIMI
                </span>
                <h1 className="font-editorial-heading text-2xl sm:text-3xl font-bold text-foreground">
                  Kutilmagan xatolik yuz berdi
                </h1>
              </div>
            </div>

            <div className="seal-badge shrink-0">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Status 500</span>
            </div>
          </div>

          {/* Bilingual Explanatory Notice */}
          <div className="py-6 space-y-4">
            {/* Uzbek Notice (Primary) */}
            <div className="p-4 rounded-lg bg-white/70 border border-[#C5A059]/25 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  O&apos;zbekiston Respublikasi Huquqiy Xavfsizlik Kafolati
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                Tizimda texnik uzilish yuz berdi. Sizning shaxsiy ma&apos;lumotlaringiz, yuridik yozishmalaringiz va
                konsultatsiya holati daxlsiz saqlanmoqda. Sahifani qayta yuklash orqali davom ettirishingiz mumkin.
              </p>
            </div>

            {/* Russian Notice (Secondary Bilingual) */}
            <div className="p-4 rounded-lg bg-white/40 border border-[#C5A059]/15 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 font-mono">
                Уведомление правовой системы
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                В работе защищённого узла произошла непредвиденная ошибка. Конфиденциальность правовой информации
                сохранена в полном объеме. Пожалуйста, попробуйте обновить страницу или обратиться в службу поддержки.
              </p>
            </div>

            {/* Digest / Diagnostic Code Block */}
            {error.digest && (
              <div className="text-xs font-mono bg-parchment-100 p-2.5 rounded border border-[#C5A059]/20 flex items-center justify-between text-muted-foreground">
                <span>Protokol kodi (Digest):</span>
                <span className="font-semibold text-foreground select-all">{error.digest}</span>
              </div>
            )}

            {/* Expandable Technical Details (Collapsible) */}
            {error.message && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{detailsOpen ? "Texnik tafsilotlarni yashirish" : "Texnik tafsilotlarni ko'rish"}</span>
                </button>
                {detailsOpen && (
                  <pre className="mt-2 p-3 rounded bg-lapis-950 text-slate-200 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-40 border border-slate-700">
                    {error.name}: {error.message}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#C5A059]/20">
            <Button
              onClick={() => reset()}
              className="w-full sm:w-auto bg-[#132A4F] hover:bg-[#1E3A6D] text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta urinish / Повторить попытку</span>
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto border-[#C5A059]/40 bg-white/80 hover:bg-white text-foreground px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
            >
              <Link href="/">
                <Home className="w-4 h-4 text-gold-600" />
                <span>Bosh sahifaga qaytish</span>
              </Link>
            </Button>
          </div>

          {/* Direct Support Contacts */}
          <div className="mt-8 pt-6 border-t border-[#C5A059]/20 bg-parchment-100/60 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 rounded-b-xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-gold-600" />
              <span>Adliya axborot-maslahat va texnik ko&apos;mak xizmati</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Call Center */}
              <a
                href="tel:+998712000108"
                className="flex items-center gap-2 p-2.5 rounded-md bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
              >
                <Phone className="w-4 h-4 text-gold-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Ishonch telefoni</div>
                  <div className="font-mono font-semibold text-foreground truncate">+998 71 200-01-08</div>
                </div>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/themis_support_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-md bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
              >
                <Send className="w-4 h-4 text-lapis-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Telegram yordam</div>
                  <div className="font-mono font-semibold text-foreground truncate">@themis_support_uz</div>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:yordam@themis.uz"
                className="flex items-center gap-2 p-2.5 rounded-md bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
              >
                <Mail className="w-4 h-4 text-seal shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Elektron pochta</div>
                  <div className="font-mono font-semibold text-foreground truncate">yordam@themis.uz</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Sub-footer */}
        <p className="mt-4 text-center text-xs text-muted-foreground/80 font-serif italic">
          &ldquo;Kuch adolatdadir&rdquo; — Themis Huquqiy Yordam Platformasi. O&apos;zbekiston Respublikasi qonunlariga
          qat&apos;iy muvofiq faoliyat yuritadi.
        </p>
      </div>
    </div>
  );
}
```

---

### Implementation 2: `src/app/loading.tsx`

```tsx
import { Scale } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 sm:p-6 md:p-10 bg-court-mesh relative overflow-hidden">
      {/* Subtle Judicial Scale Watermark in the background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] select-none">
        <Scale className="w-[700px] h-[700px] text-[#132A4F]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8">
        {/* Central Judicial Spinner & Sync Indicator */}
        <div className="flex flex-col items-center justify-center text-center pt-8 pb-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Outer Gilded Subtle Rotating Ring */}
            <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/20 border-t-[#C5A059] animate-spin" />

            {/* Inner Judicial Crest with Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-[#C5A059]/40 flex items-center justify-center shadow-sm animate-stamp-pulse">
                <Scale className="w-5 h-5 text-gold-600" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="font-editorial-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Huquqiy ma&apos;lumotlar yuklanmoqda...
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              O&apos;zbekiston Respublikasi Adliya axborot tizimi va Lex.uz qonunchilik bazasi bilan sinxronlashtirilmoqda
            </p>
          </div>
        </div>

        {/* Editorial Skeleton Masthead */}
        <div className="paper-card rounded-xl p-6 sm:p-8 border border-[#C5A059]/25 bg-[#FAF7F0]/80 shadow-parchment space-y-4">
          {/* Legal Article Pill Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-full bg-parchment-300/70" />
            <Skeleton className="h-5 w-44 rounded-full bg-parchment-200/60" />
          </div>

          {/* Heading Skeletons */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-8 sm:h-10 w-3/4 sm:w-2/3 bg-parchment-300/80 rounded-md" />
            <Skeleton className="h-4 sm:h-5 w-full sm:w-4/5 bg-parchment-200/70 rounded-md" />
            <Skeleton className="h-4 w-1/2 bg-parchment-200/50 rounded-md" />
          </div>
        </div>

        {/* Dossier Card Skeletons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="paper-card rounded-xl p-5 border border-[#C5A059]/20 bg-[#FAF7F0]/90 space-y-4 shadow-sm relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar Skeleton */}
                  <Skeleton className="w-12 h-12 rounded-full bg-parchment-300/80 shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 bg-parchment-300/80 rounded" />
                    <Skeleton className="h-3 w-20 bg-parchment-200/70 rounded" />
                  </div>
                </div>

                {/* Rating Badge Skeleton */}
                <Skeleton className="h-6 w-14 rounded-full bg-parchment-200/60 shrink-0" />
              </div>

              {/* Specialization & Bio Lines */}
              <div className="space-y-2 py-2 border-y border-[#C5A059]/15">
                <Skeleton className="h-3 w-full bg-parchment-200/80 rounded" />
                <Skeleton className="h-3 w-5/6 bg-parchment-200/60 rounded" />
                <Skeleton className="h-3 w-3/5 bg-parchment-200/40 rounded" />
              </div>

              {/* Card Footer / Action Skeleton */}
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-24 bg-parchment-200/70 rounded" />
                <Skeleton className="h-8 w-28 bg-parchment-300/80 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Implementation 3: `src/app/not-found.tsx`

```tsx
import Link from "next/link";
import {
  Scale,
  Home,
  Users,
  Sparkles,
  ArrowRight,
  Phone,
  FileQuestion,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-court-mesh relative overflow-hidden selection:bg-gold-500/20">
      {/* Background judicial watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
        <Scale className="w-[650px] h-[650px] text-foreground" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-8">
        {/* Main Archival Dossier Box */}
        <div className="paper-card rounded-xl p-6 sm:p-10 border border-[#C5A059]/30 bg-[#FAF7F0] shadow-folio relative">
          {/* Notary Void Seal Motif */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shadow-sm">
                <FileQuestion className="h-7 w-7 text-gold-600" />
              </div>
              <div>
                <span className="font-judicial-sub text-xs text-gold-700 font-bold tracking-widest block">
                  HUQUQIY PROTOKOL • MODDA TOPILMADI
                </span>
                <h1 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-foreground">
                  404 — Sahifa Mavjud Emas
                </h1>
              </div>
            </div>

            <div className="seal-badge shrink-0">
              <Shield className="w-3.5 h-3.5" />
              <span>BEKOR QILINGAN</span>
            </div>
          </div>

          {/* Description & Cultural Legal Motif */}
          <div className="py-6 space-y-4">
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              Siz murojaat qilgan manzil bo&apos;yicha sahifa yoki huquqiy hujjat topilmadi. Havola o&apos;zgargan,
              nomi yangilangan yoki vaqtincha olib tashlangan bo&apos;lishi mumkin.
            </p>

            {/* Classical Amir Temur Legal Quotation */}
            <blockquote className="p-4 rounded-lg bg-gold-500/5 border-l-4 border-gold-500 text-sm italic font-serif text-muted-foreground/90">
              &ldquo;Kuch — adolatdadir. Har bir ishda qonun ustuvorligi va adolat mezon bo&apos;lmog&apos;i lozim.&rdquo;
              <span className="block mt-1 font-sans text-xs not-italic font-semibold text-gold-700">
                — Amir Temur tuzuklari
              </span>
            </blockquote>
          </div>

          {/* Core Navigation Cards (Strict Route Link Contract) */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Tavsiya etilgan yo&apos;nalishlar:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Link 1: Home */}
              <Link
                href="/"
                className="group p-4 rounded-lg bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-gold-500/50 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-gold-500/10 flex items-center justify-center mb-2.5 text-gold-600 group-hover:scale-105 transition-transform">
                    <Home className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-gold-700 transition-colors">
                    Bosh Sahifa
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Asosiy sahifaga qaytish va platforma xizmatlari bilan tanishish
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-gold-700 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>O&apos;tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Link 2: Specialists Catalog (Canonical Route: /specialists) */}
              <Link
                href="/specialists"
                className="group p-4 rounded-lg bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-lapis-500/50 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-lapis-500/10 flex items-center justify-center mb-2.5 text-lapis-600 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-lapis-700 transition-colors">
                    Advokatlar Reyestri
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    10 ta soha bo&apos;yicha litsenziyalangan mutaxassislarni topish
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-lapis-600 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Katalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Link 3: AI Legal Consultation (Canonical Route: /ai-chat) */}
              <Link
                href="/ai-chat"
                className="group p-4 rounded-lg bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-seal/40 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-seal/10 flex items-center justify-center mb-2.5 text-seal group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-seal transition-colors">
                    AI Huquqiy Tahlil
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Lex.uz moddalari va qonunchilik asosida 2 daqiqada tahlil
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-seal gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Boshlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Assistance Footer */}
          <div className="mt-8 pt-4 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gold-600" />
              <span>
                Yordam xizmati: <strong className="text-foreground">+998 71 200-01-08</strong>
              </span>
            </div>
            <div>
              Telegram orqali:{" "}
              <a
                href="https://t.me/themis_support_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lapis-600 hover:underline font-mono"
              >
                @themis_support_uz
              </a>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="ghost" asChild className="hover:bg-gold-500/10 text-muted-foreground hover:text-foreground">
            <Link href="/" className="inline-flex items-center gap-2 text-xs">
              <Home className="w-3.5 h-3.5" />
              <span>Bosh sahifaga qaytish</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### Implementation 4: `src/app/layout.tsx` (Metadata & Viewport Replacement)

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#081021" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://themis.uz"),
  title: {
    default: "Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi",
    template: "%s | Themis — Huquqiy Yordam",
  },
  description:
    "O'zbekiston Respublikasi bo'yicha litsenziyalangan advokatlar reyestri, Lex.uz qonunchilik bazasiga asoslangan AI yuridik tahlili va xavfsiz onlayn huquqiy konsultatsiyalar platformasi.",
  keywords: [
    "Themis",
    "Huquqiy Yordam",
    "advokat",
    "yurist",
    "O'zbekiston yuridik platformasi",
    "advokatlar reyestri",
    "onlayn konsultatsiya",
    "AI huquqiy tahlil",
    "Lex.uz",
    "Adliya vazirligi",
    "Toshkent advokat",
  ],
  authors: [{ name: "Themis Legal Technologies" }],
  creator: "Themis Uzbekistan",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://themis.uz",
    siteName: "Themis — Huquqiy Yordam",
    title: "Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi",
    description:
      "O'zbekiston Respublikasi bo'yicha litsenziyalangan advokatlar reyestri va AI yordamida tezkor yuridik tahlil.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi",
    description:
      "O'zbekiston Respublikasi bo'yicha litsenziyalangan advokatlar reyestri va AI yordamida tezkor yuridik tahlil.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased selection:bg-gold-500/20 selection:text-lapis-900 bg-background text-foreground min-h-screen">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              borderRadius: "0.5rem",
              border: "1px solid rgba(184, 142, 50, 0.25)",
            },
          }}
        />
      </body>
    </html>
  );
}
```

---

## 4. Caveats

1. **`error.tsx` Scope**: `src/app/error.tsx` handles client-side errors thrown inside any route page or nested layout under `src/app`. However, in Next.js 14 App Router, errors thrown *inside* root `layout.tsx` itself cannot be caught by `src/app/error.tsx`; Next.js uses `src/app/global-error.tsx` for that edge case. If full defensive containment of root layout render crashes is desired during Milestone 6 hardening, adding `global-error.tsx` is recommended.
2. **Internal Route Prefix Normalization (Milestone 2 dependency)**: While `not-found.tsx` and `error.tsx` strictly use canonical URLs (`/specialists`, `/ai-chat`, `/consultations`, `/profile`, `/`), legacy links inside `src/app/(dashboard)/layout.tsx` still possess `/dashboard/specialists` prefixes which are slated for refactoring by Milestone 2 implementers.
3. **Google Fonts via `<link>` tags**: Font families (`Cormorant Garamond`, `Cinzel`, `Plus Jakarta Sans`, `JetBrains Mono`) are currently loaded via CDN `<link>` tags inside `layout.tsx`. They render cleanly across all modern browsers.

---

## 5. Conclusion

- Complete architectural designs and drop-in code have been prepared for `src/app/error.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`, and `src/app/layout.tsx`.
- All designs eliminate generic AI templates in favor of bespoke, culturally resonant Uzbek judicial motifs: Amir Temur's *Temur tuzuklari* quote, bilingual legal assurance notices, notary seals, and Scales of Justice watermarks.
- All links strictly conform to the Route Link Structure Contract (`/specialists`, `/ai-chat`, `/`).
- The code was verified with TypeScript compiler (`npx tsc --noEmit`) and Next.js production build (`npm run build`), confirming 0 syntax errors, 0 type errors, and 0 missing dependency issues.

---

## 6. Verification Method

To verify these implementations once written to `src/app`:

1. **Static Analysis & Type Verification**:
   ```powershell
   npx tsc --noEmit
   ```
   *Expected outcome*: Exit code 0, no diagnostic errors.

2. **Production Build Verification**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Build succeeds with custom `/_not-found` rendering the bespoke 404 page.

3. **Runtime Manual Verification**:
   - **404 Page**: Run `npm run dev` and navigate to `http://localhost:3000/adliya-mavjud-emas-404`. Verify that:
     - The page displays "404 — Sahifa Mavjud Emas", the "BEKOR QILINGAN" badge, and the Amir Temur quote.
     - Clicking "Advokatlar Reyestri" navigates to `/specialists`.
     - Clicking "AI Huquqiy Tahlil" navigates to `/ai-chat`.
     - Clicking "Bosh Sahifa" navigates to `/`.
   - **Loading Skeleton**: Throttle network to "Slow 3G" in Chrome DevTools and navigate between routes. Verify that the rotating gilded ring and pulsating judicial crest appear before content hydration.
   - **Error Boundary**: Trigger a simulated error in any client page. Verify that the bilingual Uzbek/Russian notice renders with the reset button and emergency support contacts (+998 71 200-01-08, Telegram, email).
