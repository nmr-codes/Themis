# Handoff Report: Admin Oversight Portal Investigation (M5_3)

**Author**: Explorer M5_3 (`teamwork_explorer`)  
**Target Recipient**: Worker M5  
**Date**: 2026-10-31  
**Project**: Themis (Huquqiy Yordam) — Uzbekistan Legal Consultation Platform  
**Target Route Group**: `src/app/(admin)/admin/*` (Maps to URLs `/admin`, `/admin/specialists`, `/admin/users`, `/admin/consultations`, `/admin/reviews`, `/admin/transactions`)

---

## 1. Observation

### 1.1 Directory & Route Group Architecture
* **Path Discrepancy Note**: The dispatch prompt referenced `src/app/(dashboard)/admin/...`. Direct filesystem inspection via `find_by_name` confirmed that the actual Next.js route group is `src/app/(admin)/admin/...`. In Next.js App Router, `(admin)` and `(dashboard)` are parallel route groups; `(admin)/admin/*` correctly serves all `/admin/*` URLs and isolates the Admin Judicial Sidebar (`src/app/(admin)/layout.tsx`) from the client dashboard layout (`src/app/(dashboard)/layout.tsx`).
* **Active Files Verified**:
  - `src/app/(admin)/layout.tsx` (123 lines)
  - `src/app/(admin)/admin/page.tsx` (181 lines)
  - `src/app/(admin)/admin/specialists/page.tsx` (250 lines)
  - `src/app/(admin)/admin/users/page.tsx` (132 lines)
  - `src/app/(admin)/admin/consultations/page.tsx` (94 lines)
  - `src/app/(admin)/admin/reviews/page.tsx` (84 lines)
  - `src/app/(admin)/admin/transactions/page.tsx` (141 lines)

### 1.2 Build & Test Baseline
* `npm run lint`: **0 errors, 0 warnings** (clean).
* `node tests/e2e/runner.js`: **84/84 tests passed (100% Pass Rate)** across Tiers 1-4.
* `npm run build`: **Compiled successfully; all 27 static pages generated with 0 errors**.

### 1.3 Detailed Page-by-Page Observations & Gaps

#### A. Admin Layout (`src/app/(admin)/layout.tsx`)
* **Observed UI Structure**:
  - Line 27-34: `navItems` array contains 6 routes with Lucide icons (`LayoutDashboard`, `UserCheck`, `Users`, `Calendar`, `Star`, `CreditCard`).
  - Line 29: Hardcoded badge `"1"` on `Litsenziyalar Tekshiruvi` regardless of actual pending specialist count.
  - Line 39: Obsidian sidebar (`bg-[#0B132B] text-white border-r border-[#C59B27]/30`).
  - Lines 105-113: Footnote featuring `ShieldCheck` ("Xavfsizlik Nazorati Faol").
* **Gaps**:
  - The badge `"1"` on `Litsenziyalar Tekshiruvi` is statically hardcoded rather than dynamically reflecting the pending specialist queue.
  - Lacks an administrator persona badge in the sidebar header or footer indicating the active logged-in auditor (e.g. "Bosh Auditor: Admin Moderator").

#### B. Admin KPI Overview (`src/app/(admin)/admin/page.tsx`)
* **Observed UI Structure**:
  - Lines 52-104: 4 metric cards with static values:
    - Ro'yxatdagi fuqarolar: `1,428` (`+124 ta bu hafta qo'shildi`)
    - Tasdiqlangan advokatlar: `34` (`1 ta litsenziya tekshiruvda`)
    - Konsultatsiyalar: `286` (`98% ijobiy hal etilgan`)
    - Platforma komissiyasi (15%): `formatPrice(7420000)` (`Sof platforma fondi`)
  - Lines 107-129: Critical verification alert banner:
    ```tsx
    114: <h3 className="font-editorial-heading text-xl font-bold text-[#0B132B]">
    115:   Rustam Mahmudov — Jinoyat va fuqarolik ishlari bo'yicha advokat
    116: </h3>
    117: <p className="text-xs text-slate-600 font-mono">
    118:   Adliya Vazirligi litsenziyasi (#ADV-4921) va diplom nusxalari yuklangan
    119: </p>
    ```
* **Critical Inconsistencies & Gaps**:
  - **Data Inconsistency**: In `src/lib/mock-data.ts:164`, Rustam Mahmudov (`spec-3`) is ALREADY verified (`verification_status: "approved"`, `license_number: "#ADV-4921"`), and specializes in Housing/Contracts (`LEGAL_CATEGORIES[3], [8]`), NOT Criminal law!
  - In `src/lib/mock-data.ts:254`, the actual pending specialist awaiting verification is **Shahnoza Alimova** (`spec-5`, `verification_status: "pending"`, `license_number: "#ADV-9920"`, Buxoro viloyati advokatlar palatasi / Adliya Vazirligi).
  - **Static Metrics**: None of the 4 KPI cards read from storage or dynamic collections.
  - **Missing System Audit**: Lacks Lex.uz statutory sync heartbeat indicator and recent platform audit stream.

#### C. Specialist Verification Queue (`src/app/(admin)/admin/specialists/page.tsx`)
* **Observed UI Structure**:
  - Lines 31-75: In-memory React `useState` containing 3 synthetic entries (`spec-pending-1` Nodirbek Salimov, `spec-1` Azizbek Rahimov, `spec-2` Dilnoza Karimova).
  - Lines 79-93: Handlers `handleApprove` and `handleReject` modify only in-memory state; changes are lost immediately upon page refresh or navigation.
  - Lines 158-175: Action buttons in pending list:
    ```tsx
    159: <Button variant="outline" size="sm" onClick={() => setSelectedSpec(spec)}>
    160:   <Eye className="h-3.5 w-3.5" /> Hujjatlarni ko'rish
    161: </Button>
    162: <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(spec.id)}>
    163:   <CheckCircle2 className="h-3.5 w-3.5" /> Tasdiqlash
    164: </Button>
    ```
* **Critical Inconsistencies & Gaps**:
  - **Missing 1-Click Reject**: The card only contains "Hujjatlarni ko'rish" and "Tasdiqlash" (Approve). 1-click "Rad etish" (Reject) is missing from the card and is only reachable inside the dialog (`line 234`). Dispatch requires: `1-click "Tasdiqlash" (Approve) / "Rad etish" (Reject) controls updating status`.
  - **Disconnected from `MOCK_SPECIALISTS`**: Does not load `MOCK_SPECIALISTS` or include canonical pending specialist Shahnoza Alimova (`spec-5`).
  - **Lack of Persistence**: Does not store approval/rejection overrides in `localStorage` (e.g. `themis_specialist_verifications`), violating workflow test continuity (Tier 3 Workflow 5).
  - **Styling**: Uses generic Tailwind classes (`text-slate-900`, `bg-slate-50`, `bg-amber-100`, `bg-emerald-600`) without judicial heritage tokens (`font-editorial-heading`, `legal-seal`, `judicial-crest`, `parchment-card`, `#E2DCD0` borders).

#### D. Users Supervision (`src/app/(admin)/admin/users/page.tsx`)
* **Observed UI Structure**:
  - Lines 14-51: Hardcoded 4 users (`u-1` Azizbek Nurmatov, `u-2` Azizbek Rahimov, `u-3` Dilnoza Karimova, `u-4` Admin Moderator).
  - Lines 80-127: Raw `<table>` with `border-b bg-slate-50 text-slate-500`.
* **Critical Inconsistencies & Gaps**:
  - **Complete Lack of Role Management**: The table is purely read-only text. There are NO buttons, select dropdowns, or modals to change a user's role (`user` ↔ `specialist` ↔ `admin`) or toggle account status (Active / Suspended). Dispatch explicitly requires: `Citizen accounts, role management, consultation monitoring`.
  - **No Integration with Registered Accounts**: Does not merge users registered through `/register` or demo accounts saved in `themis_demo_user`.
  - **Missing Summary Cards**: Lacks summary metric badges for total citizens, advocates, and administrators.

#### E. Consultations Supervision (`src/app/(admin)/admin/consultations/page.tsx`)
* **Observed UI Structure**:
  - Lines 9-32: Hardcoded 2 consultations (`c-101`, `c-102`).
  - Lines 45-89: Static `<table>` with basic data.
* **Critical Inconsistencies & Gaps**:
  - **Ignored Storage Helper**: Does NOT import or call `getStoredConsultations()` from `src/lib/consultation-storage.ts`. As a result, bookings made by users on `/specialists/[id]` (persisted in `localStorage.getItem("themis_consultations")`) never appear in the admin supervision ledger!
  - **No Status Filtering or Search**: No tabs or dropdown to filter by status (`scheduled`, `completed`, `pending`, `cancelled`, `disputed`).
  - **No Consultation Inspection Modal**: Admin cannot inspect consultation notes, meeting links (`meeting_link`), or intervene in disputes.

#### F. Review Moderation (`src/app/(admin)/admin/reviews/page.tsx`)
* **Observed UI Structure**:
  - Lines 11-30: Hardcoded 2 reviews (`rev-1`, `rev-2`), both 5 stars, both status `active`.
  - Line 58: Rendered stars as unicode string: `{"★".repeat(rev.rating)}`.
  - Lines 65-75: Only one action: `Trash2` button that deletes from local state.
* **Critical Inconsistencies & Gaps**:
  - **Missing Specialist Replies**: In `src/lib/mock-data.ts:70`, `rev-1` includes `specialist_reply: "Arzimaydi, huquqlaringiz doim himoyada bo'lsin!"`. But `/admin/reviews` does NOT render specialist replies anywhere! Dispatch explicitly specifies: `Client reviews, ratings, specialist replies, flag/moderation controls`.
  - **No Flag / Moderation Controls**: Cannot flag a review for investigation (`flagged`) or approve/unflag (`active`). Only "delete" is implemented.
  - **No Status Filtering Tabs**: Lacks tabs for `Barchasi`, `Shubhali / Tekshiruvda` (Flagged), `Tasdiqlangan` (Approved).

#### G. Financial Ledger & Transaction Audit (`src/app/(admin)/admin/transactions/page.tsx`)
* **Observed UI Structure**:
  - Lines 9-46: Hardcoded 3 transactions (`tx-501`, `tx-502`, `tx-503`), all `status: "completed"`.
  - Lines 59-95: 3 hardcoded metric cards.
* **Critical Inconsistencies & Gaps**:
  - **Missing Escrow States**: Every transaction is marked `completed`. Uzbek legal escrow requires visual distinction for:
    1. `held` (Eskrou depozitda saqlanmoqda — consultation pending/scheduled, funds held safely).
    2. `completed` (Advokatga o'tkazildi — consultation finished, 85% paid to lawyer, 15% platform fee retained).
    3. `refunded` (Mijozga qaytarildi — cancelled/disputed consultation refund).
  - **Missing Audit Export**: No "Audit hisobotini yuklab olish (CSV / PDF)" action.
  - **No Transaction Detail Modal**: Cannot view fiscal authorization codes, payment provider references (Payme/Click transaction IDs), or Lex.uz invoice receipts.

---

## 2. Logic Chain

### 2.1 UI/UX Judicial Administration Coherence
* **Observation**: The existing admin subpages use default Tailwind classes (`text-slate-900`, `bg-slate-50`, generic `<Card>`) while the main dashboard and specialist portals use the elevated heritage palette (`bg-[#FAF8F5]`, `bg-[#0B132B]`, `font-editorial-heading`, `legal-seal`, `notary-stamp`, `judicial-crest`).
* **Inference**: Admin pages must project supreme regulatory and judicial authority. Replacing generic grey cards and tables with parchment borders (`#E2DCD0`), serif headings (`font-editorial-heading`), monospace license identifiers (`font-mono`), and emerald/gold badges will unify the entire platform under the single editorial design system defined in `PROJECT.md`.

### 2.2 Data Synchronization & Storage Integration
* **Observation**:
  - `src/app/(admin)/admin/consultations/page.tsx` does not use `getStoredConsultations()`.
  - `src/app/(admin)/admin/specialists/page.tsx` ignores `MOCK_SPECIALISTS` and `spec-5` (Shahnoza Alimova).
  - Approvals/rejections are not saved to `localStorage`.
* **Inference**:
  - Next.js client components in the admin portal must read from the unified storage sources on mount (`getStoredConsultations()` for consultations, `MOCK_SPECIALISTS` merged with `themis_specialist_verifications` in `localStorage` for specialists).
  - This ensures when a citizen books a consultation on `/specialists/[id]`, it immediately appears in `/admin/consultations`.
  - When an admin approves Shahnoza Alimova in `/admin/specialists`, her status updates in `localStorage`, reflecting immediately in `/admin` KPI counts and unlocking her visibility in the public catalog as validated in Tier 3 Workflow 5.

### 2.3 Concrete Implementation Blueprint for Worker M5

#### Recommendation 1: Shared Storage Helper for Specialist Verifications (`src/lib/specialist-storage.ts` or inline in specialist page)
Define persistence key `themis_specialist_verifications` mapping specialist IDs to `{ status: "approved" | "rejected" | "pending", admin_notes?: string }`.
```typescript
export interface SpecialistVerificationState {
  [specialistId: string]: {
    status: "pending" | "approved" | "rejected";
    admin_notes?: string;
    verified_at?: string;
  };
}
```
Default verification state seeds `spec-5` as `"pending"` and `spec-1`, `spec-2`, `spec-3`, `spec-4` as `"approved"`.

#### Recommendation 2: Elevate `src/app/(admin)/admin/page.tsx` (KPI Overview)
* Dynamically aggregate:
  - Total users: calculate or display seed `1,428` + any stored user registrations.
  - Verified specialists: count of specialists where `verification_status === 'approved'` (34 verified).
  - Pending specialists: count of specialists with `status === 'pending'`.
  - Active consultations: dynamic count from `getStoredConsultations()`.
  - Platform commission (15%): dynamic sum from transactions / completed consultations.
* Fix Critical Verification Alert:
  - If `spec-5` (Shahnoza Alimova) is pending: display "Shahnoza Alimova — Biznes va soliq huquqi bo'yicha advokat. Litsenziya: #ADV-9920 • Buxoro viloyati advokatlar palatasi / Adliya Vazirligi".
  - If 0 pending: display a calm green banner: "Barcha advokatlar litsenziyalari tasdiqlangan. Yangi arizalar mavjud emas."
* Add Lex.uz legislative sync status badge ("Lex.uz Qonunchilik Bazasi: Sinxronizatsiya Faol").
* Add Recent Audit Stream (recent bookings, verifications, and escrow transactions).

#### Recommendation 3: Rebuild `src/app/(admin)/admin/specialists/page.tsx` (Verification Queue)
* Full Dossier View per specialist card:
  - Full Name, Avatar initials, Region, University Degree (e.g. `Vestminster Xalqaro Universiteti (WIUT) — LLM (2016)`).
  - Monospace License Badge: `#ADV-9920`.
  - Issuing Authority: `Adliya Vazirligi / Buxoro viloyati advokatlar palatasi`.
  - Years of experience, legal branches.
* **1-Click Actions directly on the card**:
  - `Tasdiqlash` (Approve): Green button with `CheckCircle2` icon. Updates status to `approved`, saves to localStorage, fires `toast.success`.
  - `Rad etish` (Reject): Outline button with `XCircle` icon. Updates status to `rejected`, saves to localStorage, fires `toast.error`.
  - `Hujjatlarni tekshirish` (Inspect Dossier): Opens dialog with diploma certificate, license number verification checklist, and chamber registry link.
* Tabs:
  - `Kutilayotgan arizalar` (Pending count)
  - `Tasdiqlangan advokatlar` (Approved count)
  - `Rad etilganlar` (Rejected count)
* Full-text search by name or license number (`#ADV-...`).

#### Recommendation 4: Rebuild `src/app/(admin)/admin/users/page.tsx` (Users Supervision & Role Management)
* Combine initial users with registered accounts from `localStorage.getItem("themis_demo_user")`.
* **Role Management Controls**:
  - Role badge with dropdown menu or quick modal: "Rolni o'zgartirish" (Citizen `user`, Advocate `specialist`, Administrator `admin`).
  - Account status switch: Faol (`active`) / Bloklangan (`suspended`).
  - User Dossier Dialog: view citizen's consultation count, registration date, phone number, and region.
* Tabs / Filters:
  - `Barchasi`
  - `Fuqarolar (Mijozlar)`
  - `Advokatlar & Mutaxassislar`
  - `Ma'murlar`
* Search input by name, email, or telephone.

#### Recommendation 5: Rebuild `src/app/(admin)/admin/consultations/page.tsx` (Consultation Supervision)
* Call `getStoredConsultations()` in `useEffect` to ensure all user bookings are visible.
* Table columns:
  - Consultation ID (`#c-101`)
  - Citizen name & Advocate name
  - Service format (`video`, `chat`) and tariff duration
  - Scheduled date and time
  - Total Fee (e.g. `180,000 UZS`)
  - Platform Commission 15% (`+27,000 UZS`)
  - Specialist Net 85% (`153,000 UZS`)
  - Status badge: `scheduled` (Rejalashtirilgan - blue), `completed` (Yakunlangan - emerald), `pending` (Kutilmoqda - amber), `cancelled` (Bekor qilingan - slate), `disputed` (Nizoli - terracotta).
* Consultation Inspection Modal:
  - Citizen inquiry notes and dispute reason.
  - Video room link button (launches Google Meet / WebRTC session).
  - Status transition override button (e.g. "Yakunlash", "Bekor qilish", "Nizoni hal qilish").

#### Recommendation 6: Rebuild `src/app/(admin)/admin/reviews/page.tsx` (Review Moderation & Specialist Replies)
* Pull reviews from `MOCK_SPECIALISTS` and stored consultation reviews.
* Render each review card with:
  - Star rating with Lucide `Star` filled with `#C59B27`.
  - Client name, specialist name, consultation link.
  - Client review comment in quotation styling.
  - **Specialist reply quote box**:
    ```tsx
    {rev.specialist_reply && (
      <div className="mt-3 p-3 rounded-xl bg-[#FAF0D9]/40 border-l-2 border-[#C59B27] text-xs">
        <span className="font-semibold text-[#845D18] flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Advokatning rasmiy javobi:
        </span>
        <p className="text-slate-700 italic mt-1">&ldquo;{rev.specialist_reply}&rdquo;</p>
      </div>
    )}
    ```
  - Status badge: `active` (Tasdiqlangan), `flagged` (Shubhali / Tekshiruvda), `removed` (Yashirilgan).
* **Moderation Controls**:
  - `Tasdiqlash`: mark active / approved.
  - `Shubhali deb belgilash`: flag for moderation (updates status to `flagged`, applies amber warning badge).
  - `O'chirish`: hide review from public catalog.
* Moderation Filter Tabs: `Barchasi`, `Shubhali / Shikoyat tushgan`, `Tasdiqlangan`.

#### Recommendation 7: Rebuild `src/app/(admin)/admin/transactions/page.tsx` (Financial Ledger & Escrow Audit)
* Provide realistic transaction entries showcasing all 3 escrow lifecycle states:
  1. `completed`: 180,000 UZS (153,000 UZS to lawyer, 27,000 UZS to platform) — Advokat hisobiga o'tkazilgan.
  2. `held`: 250,000 UZS (212,500 UZS held, 37,500 UZS held) — Eskrou depozitda saqlanmoqda (konsultatsiya kutilmoqda).
  3. `refunded`: 120,000 UZS — Mijozga to'liq qaytarilgan (nizo yoki bekor qilish sababli).
* Escrow Metrics Summary:
  - Jami aylanma (Gross GMV)
  - Platforma sof daromadi (15% komissiya)
  - Advokatlarga to'langan mablag' (85% to'lovlar)
  - Muzlatilgan eskrou depoziti (Active Escrow Reserve)
* Filter by Escrow Status (`Barchasi`, `Depozitda (Held)`, `O'tkazilgan (Completed)`, `Qaytarilgan (Refunded)`).
* "Audit hisobotini eksport qilish (CSV / PDF)" action with toast confirmation.
* Transaction Audit Details dialog showing fiscal reference numbers and bank authorization codes.

---

## 3. Caveats

1. **Route Group Pathing**: The original dispatch listed paths as `src/app/(dashboard)/admin/...`. In reality, Next.js routing uses `src/app/(admin)/admin/...`. Worker M5 must edit the files inside `src/app/(admin)/admin/...` and `src/app/(admin)/layout.tsx`. No changes should be made to non-existent `(dashboard)/admin` paths.
2. **E2E Test Stability**: All 84 existing tests in `tests/e2e/runner.js` must continue to pass cleanly without any regression. In particular, Tier 3 Workflow 5 checks `spec-5` (Shahnoza Alimova) having `verification_status: "pending"` by default and transitioning to `"approved"`.
3. **Database vs Local Storage**: In production, Supabase PostgreSQL RLS tables handle these transactions. In local offline demo mode, all administrative state operations must be hydration-safe and persist to `localStorage` so that persona switching and browser refreshes retain admin approvals and booking records.

---

## 4. Conclusion

The Admin Oversight Portal (`/admin/*`) currently functions on static mock data with disconnected in-memory states and misses several critical supervisory features mandated by Milestone 5 and the project requirements:
1. **Specialist Verification**: Lacks 1-click rejection controls on cards, lacks persistence to `localStorage`, and misidentifies the pending applicant (Shahnoza Alimova `#ADV-9920` vs Rustam Mahmudov).
2. **User Supervision**: Completely lacks interactive role management controls (`user`, `specialist`, `admin`) and account status toggles.
3. **Consultation Supervision**: Disconnected from `consultation-storage.ts`, so citizen bookings are invisible in the admin table.
4. **Review Moderation**: Does not render specialist replies and lacks flag/unflag moderation controls.
5. **Financial Ledger**: Lacks escrow accounting states (`held`, `completed`, `refunded`) and audit export actions.
6. **UI/UX Styling**: Uses generic Tailwind slate styling instead of the elevated judicial heritage palette (`#0B132B`, `#FAF8F5`, `#C59B27`, `font-editorial-heading`, `legal-seal`).

Following the recommendations in Section 2 will bring the Admin Oversight Portal to 100% production-grade compliance with Milestone 5.

---

## 5. Verification Method

To verify these findings and any subsequent implementation by Worker M5:

1. **Verify Route Files Exist**:
   ```powershell
   Get-ChildItem -Path "c:\Users\Bro\Desktop\Themis\src\app\(admin)\admin" -Recurse
   ```
2. **Execute Automated E2E Test Suite**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected Result*: All 84 tests pass across Tiers 1-4.
3. **Run Next.js Production Build**:
   ```bash
   npm run build
   ```
   *Expected Result*: Build completes with exit code 0; all 27 pages statically generated with zero compile or TypeScript errors.
4. **Run Project Linter**:
   ```bash
   npm run lint
   ```
   *Expected Result*: 0 warnings, 0 errors.
5. **Manual Navigation Verification**:
   - Navigate to `/admin`: Verify KPI overview cards and pending verification banner.
   - Navigate to `/admin/specialists`: Verify Shahnoza Alimova (`#ADV-9920`) is present in the pending tab with 1-click Approve and Reject buttons, and that clicking Approve persists and updates counts.
   - Navigate to `/admin/users`: Verify role management actions (change role dropdown) and citizen accounts.
   - Navigate to `/admin/consultations`: Verify user bookings from `/specialists/[id]` appear with status filtering and session inspection.
   - Navigate to `/admin/reviews`: Verify star ratings, specialist replies, and flag/moderation controls.
   - Navigate to `/admin/transactions`: Verify escrow states (`held`, `completed`, `refunded`), 15% commission split, and audit export.
