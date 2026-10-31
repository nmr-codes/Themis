# Handoff Report: Specialist Portal Investigation & Recommendations

- **Author**: Explorer M5_2 (`teamwork_explorer`)
- **Target Role**: Worker M5
- **Working Directory**: `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m5_2`
- **Target Routes**:
  - `src/app/(specialist)/specialist/page.tsx`
  - `src/app/(specialist)/specialist/requests/page.tsx`
  - `src/app/(specialist)/specialist/profile/page.tsx`
  - `src/app/(specialist)/specialist/services/page.tsx`
  - `src/app/(specialist)/specialist/schedule/page.tsx`
  - `src/app/(specialist)/specialist/earnings/page.tsx`
  - Supporting: `src/app/(specialist)/layout.tsx`, `src/lib/consultation-storage.ts`

---

## 1. Observation

A full static and structural code inspection of the Specialist Portal and associated modules reveals several key functional and visual gaps:

### A. Routing & Layout Architecture
- **Route Group**: The actual Next.js route group is `src/app/(specialist)/specialist/*` (served at `/specialist`, `/specialist/requests`, `/specialist/profile`, `/specialist/services`, `/specialist/schedule`, `/specialist/earnings`).
- **Sidebar & Masthead** (`src/app/(specialist)/layout.tsx:37-51`):
  - Sets the specialist persona as **Azizbek Rahimov** (`#ADV-3810`, Toshkent shahar Advokatlar Palatasi a'zosi, `spec-1`).
  - Good foundational navigation, but sub-pages currently fall back to generic SaaS card styling (`border shadow-sm`, standard slate text) rather than maintaining the elevated editorial and advocate chamber identity.

### B. Specialist Dashboard & KPI Metrics (`src/app/(specialist)/specialist/page.tsx`)
- **Line 75-127**: Metrics are statically hardcoded:
  ```tsx
  <div className="font-editorial-heading text-3xl font-bold text-[#0B132B]">52</div>
  <div className="font-editorial-heading text-3xl font-bold text-[#B84A2A]">2</div>
  <div className="font-editorial-heading text-3xl font-bold text-[#0B132B]">4.9</div>
  <div className="font-editorial-heading text-2xl font-bold text-[#0B132B]">{formatPrice(6800000)}</div>
  ```
- **Line 153-225**: The "Yangi Konsultatsiya So'rovlari" section contains hardcoded static HTML items ("Shaxnoza Alimova", "Jamshid Karimov") that are disconnected from `localStorage.getItem("themis_consultations")`. When a citizen books a consultation via `/specialists/spec-1`, the dashboard never updates.
- **Line 181-187**: The action button only links to `/specialist/requests` with no inline quick-accept or consultation detail modal.

### C. Consultation Request Management (`src/app/(specialist)/specialist/requests/page.tsx`)
- **Line 24-47**: State is initialized with a static mock array (`req-1` pending, `c-101` accepted) completely isolated from `getStoredConsultations()`:
  ```tsx
  const [requests, setRequests] = useState([...]);
  ```
- **Line 49-61**: `handleAccept` and `handleReject` only modify local React component state:
  ```tsx
  const handleAccept = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)));
    toast.success("So'rov qabul qilindi! Konsultatsiya jadvalga kiritildi.");
  };
  ```
  Neither `handleAccept` nor `handleReject` writes to `localStorage` (`themis_consultations`). If an advocate accepts a booking here, the citizen at `/consultations` still sees `status: "pending"`, violating cross-portal consistency.
- **UI Gaps**: Standard generic cards (`Card`, `CardContent`), default border shadows, missing advocate case file docket headers, client contact metadata, and escrow protection badge.

### D. Services & Tariffs (`src/app/(specialist)/specialist/services/page.tsx`)
- **Line 25-52**: State initialized with only 2 services in local memory.
- **Line 59**: Format selection only offers `"video"` or `"chat"`:
  ```tsx
  const [format, setFormat] = useState<"video" | "chat">("video");
  ```
  **Gaps**:
  1. Missing `"written"` (`yozma huquqiy xulosa` / `hujjat tahlili`) format.
  2. Missing **Edit** functionality: `Edit2` is imported on line 4, but never rendered. There is no edit modal, no edit button, and no state handler for editing existing tariffs.
  3. No persistence: Newly added services are lost on browser refresh because they are not saved to `localStorage.getItem("themis_specialist_services")`.
  4. Missing transparent 15% platform commission preview when setting prices.

### E. Availability Schedule & Online Presence (`src/app/(specialist)/specialist/schedule/page.tsx`)
- **Line 13-21**: State contains 7 days including Sunday; legal offices in Uzbekistan typically follow Monday-Saturday working schedules with Sunday as default day off.
- **Line 23 & 70-76**: `isOnlineNow` only toggles local boolean state:
  ```tsx
  <Button variant={isOnlineNow ? "default" : "outline"} size="sm" onClick={() => setIsOnlineNow(!isOnlineNow)}>
  ```
  It does NOT persist to `localStorage.getItem("themis_specialist_online")`. The public catalog at `/specialists` (which filters by `is_online`) cannot reflect the specialist's live presence.
- **Line 37-39**: `handleSave` only fires a toast notification; it does not persist the weekly schedule to `localStorage.getItem("themis_specialist_schedule")`.
- UI is plain form inputs without advocate chamber schedule aesthetics.

### F. Financial Earnings & Platform Commission (`src/app/(specialist)/specialist/earnings/page.tsx`)
- **Line 10-41**: Static array of 3 hardcoded transactions (`tx-501`, `tx-502`, `tx-503`).
- **Line 57-93**: Static summary cards (`6 820 000`, `1 240 000`, `153 000 UZS`).
- Does not derive earnings from completed consultations in `getStoredConsultations()`.
- Does not display the legal formula for platform commission per `themis.md §9` ($Gross - 15\% = Net$).
- Lacks practice ledger filtering, search, export statement simulation, or chamber bank payout information.

### G. Specialist Profile (`src/app/(specialist)/specialist/profile/page.tsx`)
- **Line 68-71**: `handleSave` only triggers `toast.success`, not saving to `localStorage.getItem("themis_specialist_profile")`.
- **Line 303**: "Yangi hujjat" button only executes `toast.info("Hujjat yuklash oynasi ochildi")` without an interactive upload modal.
- Lacks editorial dossier styling to match `/specialists/[id]`.

---

## 2. Logic Chain

1. **User Journey & Cross-Portal Consistency**:
   - In M3, citizen consultation booking was wired to `saveConsultation()` writing to `themis_consultations` in `localStorage` (`src/lib/consultation-storage.ts`).
   - If the Specialist Portal operates purely on disconnected mock arrays in local React state, an advocate logging in as Azizbek Rahimov cannot see or accept real client bookings.
   - Therefore, `/specialist` and `/specialist/requests` MUST hydrate directly from `getStoredConsultations()` and persist status mutations using a new `updateConsultationStatus()` helper.

2. **Compliance with `themis.md §9`**:
   - The product concept specifies a transparent 15% platform commission model:
     - Gross consultation fee paid by citizen into escrow: $100\%$
     - Platform service commission: $15\%$
     - Advocate net payout: $85\%$
   - The earnings page (`/specialist/earnings`) and services page (`/specialist/services`) must prominently display this breakdown so that advocates understand their net earnings.

3. **Practice Management Editorial Identity**:
   - Themis is positioned as a dignified legal institution for Uzbekistan, not a generic SaaS tool.
   - Generic Tailwind cards (`border bg-white text-slate-900`) must be replaced with the project's bespoke design tokens:
     - `.parchment-card` (`#FAF8F5` / `#FDFBF7`) with deckle borders (`#E2DCD0`).
     - Dual-typography: `font-editorial-heading` (`Playfair Display`) for docket titles, case headers, and currency; `Plus Jakarta Sans` for controls and inputs; `font-mono` for license IDs (`#ADV-3810`) and transaction dockets.
     - Official insignia: `.legal-seal` (Emerald Adliya seal), `.judicial-crest` (Antique Gold crest), `.statute-border` (Parchment quote border).

4. **Completeness of Features (CRUD & Formats)**:
   - For `/specialist/services`: Advocates must be able to Create, Read, Update (Edit), and Delete tariffs across all 3 primary formats: Video (`video`), Chat (`chat`), and Written legal opinion (`written`).
   - For `/specialist/schedule`: Monday-Saturday weekly working hours table with day-off toggles and a real-time Online Presence switch syncing with `localStorage`.

---

## 3. Caveats

1. **Authentication Mode**: In development/demo mode, authentication uses the `themis_demo_user` localStorage persona. The specialist persona is Azizbek Rahimov (`spec-1`, `#ADV-3810`). Code changes must retain backward compatibility with demo user switching.
2. **SSR Hydration Safety**: All localStorage reads (`getStoredConsultations`, `themis_specialist_services`, etc.) must be deferred to `useEffect` or client-side checks to prevent Next.js hydration mismatches.
3. **Escrow Realism**: While actual payments in Uzbekistan require licensed gateways (Click/Payme) per `themis.md §9.3`, the front-end simulation must realistically represent escrow ledger states (`Eskrouda saqlanmoqda`, `Depozitdan o'tkazildi`).

---

## 4. Conclusion & Concrete Code Recommendations

Worker M5 should implement the following targeted upgrades:

### Step 1: Extend `src/lib/consultation-storage.ts`
Add a dedicated helper to update consultation status and specialist notes:
```typescript
/**
 * Update consultation status (e.g. accepted, scheduled, completed, cancelled)
 * and persist changes to localStorage.
 */
export function updateConsultationStatus(
  id: string,
  status: StoredConsultation["status"],
  specialist_notes?: string
): StoredConsultation | null {
  if (typeof window === "undefined") return null;
  try {
    const current = getStoredConsultations();
    let updatedItem: StoredConsultation | null = null;
    const updated = current.map((c) => {
      if (c.id === id) {
        let status_label = "Kutilmoqda";
        let status_color = "bg-amber-100 text-amber-800";
        if (status === "accepted" || status === "scheduled" || status === "confirmed") {
          status_label = "Qabul qilingan";
          status_color = "bg-blue-100 text-blue-800";
        } else if (status === "completed") {
          status_label = "Yakunlangan";
          status_color = "bg-emerald-100 text-emerald-800";
        } else if (status === "cancelled") {
          status_label = "Rad etilgan";
          status_color = "bg-rose-100 text-rose-800";
        }
        updatedItem = {
          ...c,
          status,
          status_label,
          status_color,
          ...(specialist_notes ? { specialist_notes } : {}),
        };
        return updatedItem;
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(updated));
    return updatedItem;
  } catch (error) {
    console.error("Failed to update consultation status", error);
    return null;
  }
}
```

---

### Step 2: Elevate `src/app/(specialist)/specialist/page.tsx` (Dashboard)
1. **Dynamic Metrics**:
   - Hydrate `consultations` via `getStoredConsultations()`.
   - Compute:
     - `pendingCount = consultations.filter(c => c.status === "pending").length`
     - `scheduledCount = consultations.filter(c => c.status === "scheduled" || c.status === "accepted").length`
     - `completedCount = 52 + consultations.filter(c => c.status === "completed").length`
     - `totalNetEarnings = 6800000 + consultations.filter(c => c.status === "completed").reduce((sum, c) => sum + (c.price * 0.85), 0)`
2. **Elevated Practice Masthead**:
   - Notary stamp header with advocate chamber credentials (`#ADV-3810`, Toshkent shahar Advokatlar Palatasi).
   - Real-time online indicator and statutory citation from O'zR "Advokatura to'g'risida"gi Qonuni 9-moddasi.
3. **Interactive Pending Requests Section**:
   - Render real bookings from storage.
   - 1-click "Qabul qilish" action calling `updateConsultationStatus(id, "accepted")` inline with instant UI feedback.
4. **Today's Agenda & Quick Docket**:
   - List of today's scheduled consultations with direct links to chat `/consultations/[id]/chat` or video room.

---

### Step 3: Elevate `src/app/(specialist)/specialist/requests/page.tsx` (Request Management)
1. **Storage-Backed Requests**:
   - Merge `getStoredConsultations()` with seed requests on mount.
   - Filter into tabs:
     - `pending`: `status === "pending"`
     - `accepted`: `status === "accepted" || status === "scheduled" || status === "confirmed"`
     - `history`: `status === "completed" || status === "cancelled"`
2. **1-Click Accept & Reject Actions**:
   - `handleAccept(id)`: Call `updateConsultationStatus(id, "accepted")`, toast success, move to accepted tab.
   - `handleReject(id)`: Call `updateConsultationStatus(id, "cancelled")`, toast notification, remove from pending.
3. **Editorial Case Dossier Styling**:
   - Parchment card with client name, phone number, category badge, consultation format icon (video/chat/call), scheduled time chip, quoted problem summary, escrow guarantee indicator, and net earnings preview (Gross - 15% = Net).
   - Accepted requests tab with direct link to `/consultations/[id]/chat` and video room.

---

### Step 4: Elevate `src/app/(specialist)/specialist/services/page.tsx` (Services & Tariffs)
1. **Full CRUD Implementation**:
   - **Create**: Add new tariff with name, description, duration, format, and price.
   - **Edit**: Edit modal dialog pre-filled with selected service data; updates service in state and localStorage.
   - **Delete**: Remove tariff with confirmation toast.
   - **Toggle Active/Inactive**: Enable/disable tariff on public profile.
2. **Three Consultation Formats**:
   - `video`: Video uchrashuv (45 daqiqa)
   - `chat`: Xavfsiz matnli chat (15-30 daqiqa)
   - `written`: Yozma huquqiy xulosa va hujjat ekspertizasi (Rasmiy tahlil)
3. **Transparent 15% Commission Preview**:
   - In both Add and Edit modals, show real-time breakdown:
     - Yalpi narx: `formatPrice(price)`
     - Themis komissiyasi (15%): `-formatPrice(price * 0.15)`
     - Advokatga sof to'lov (85%): `+formatPrice(price * 0.85)`
4. **Persistence**:
   - Save to `localStorage.getItem("themis_specialist_services")` on create/edit/delete.

---

### Step 5: Elevate `src/app/(specialist)/specialist/schedule/page.tsx` (Schedule & Presence)
1. **Instant Online Presence Switch**:
   - Sync with `localStorage.getItem("themis_specialist_online")`.
   - Distinctive active badge with pulsing emerald ring: "Hozir onlayn — fuqarolar tezkor konsultatsiyaga yozilishi mumkin".
2. **Monday to Saturday Weekly Working Hours**:
   - Monday through Saturday table with day-off toggles:
     - Dushanba — Juma: 09:00 — 18:00
     - Shanba: 10:00 — 15:00 (ixtiyoriy / navbatchilik)
     - Yakshanba: Dam olish kuni (qonuniy kafolat)
   - Quick slot preset buttons ("09:00 — 18:00", "14:00 — 20:00").
   - Persistence to `localStorage.getItem("themis_specialist_schedule")` on clicking "Jadvalni saqlash".

---

### Step 6: Elevate `src/app/(specialist)/specialist/earnings/page.tsx` (Financial Ledger)
1. **Legal Framework per `themis.md §9`**:
   - Banner displaying 15% platform commission rules and escrow security guarantee.
2. **Dynamic Ledger**:
   - Aggregate seed transactions + completed bookings from `getStoredConsultations()`.
   - Summary cards:
     - Sof tushum (85%): Calculated from transactions
     - Themis komissiyasi (15%): Total commission deducted
     - Eskrouda saqlanmoqda: Pending funds held for scheduled sessions
     - Yakunlangan dockets: Count of completed sessions
3. **Chamber Accounting Table**:
   - Columns: Operatsiya ID (`#TX-xxxx`), Sana, Mijoz va Mavzu, Xizmat formati, Yalpi to'lov, Komissiya (-15%), Sof tushum (+85%), Holat badge (`To'langan`, `Eskrouda`).
   - Chamber bank disbursement card ("Aloqabank", Hisob raqami: 20208...).
   - "Hisobotni yuklab olish" (Export Statement) button simulation with toast.

---

### Step 7: Elevate `src/app/(specialist)/specialist/profile/page.tsx` (Advocate Dossier)
1. **Persistence**:
   - Hydrate from `localStorage.getItem("themis_specialist_profile")` and persist edits on submit.
2. **Interactive Credential Upload Modal**:
   - Replace the inert toast on "Yangi hujjat" with a full modal allowing the advocate to add a diploma, advocate license (`#ADV-xxxx`), or specialization certificate.
   - Instantly appends the document to the credentials list in "Tekshiruvda" or "Tasdiqlangan" status.
3. **Editorial Styling**:
   - Notary seal, bar chamber affiliation badge, and direct link to view public profile at `/specialists/spec-1`.

---

## 5. Verification Method

To independently verify these recommendations after Worker M5 implementation:

1. **Build & Typecheck**:
   ```bash
   npm run build
   ```
   Must pass with 0 TypeScript or Next.js build errors.
2. **End-to-End Cross-Portal Booking Verification**:
   - Navigate to `/specialists/spec-1`, open booking modal, and book a consultation.
   - Navigate to `/specialist` and `/specialist/requests`: The newly booked consultation must immediately appear in the pending list with client name and legal issue.
   - Click "Qabul qilish" (Accept): Status changes to accepted; navigate to `/consultations` as citizen and confirm the status shows "Qabul qilingan" / "Rejalashtirilgan".
3. **Services CRUD & 15% Commission Verification**:
   - Navigate to `/specialist/services`, click "Yangi tarif qo'shish". Verify all 3 formats (video, chat, written) are available and the 15% platform commission preview is computed accurately.
   - Edit an existing service: Verify the edit modal updates the card.
   - Refresh the page: Verify changes persist from `themis_specialist_services`.
4. **Schedule & Online Toggle Verification**:
   - Navigate to `/specialist/schedule`: Toggle "Onlayn bo'lish". Verify status pill updates to pulsing emerald and persists in `themis_specialist_online`.
   - Update Monday-Saturday hours and save; refresh to verify persistence.
5. **Financial Ledger Verification**:
   - Navigate to `/specialist/earnings`: Verify the table displays gross fee, exact 15% commission deduction, and 85% net advocate payout.
