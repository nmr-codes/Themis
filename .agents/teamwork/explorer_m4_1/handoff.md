# Handoff Report — Explorer M4_1: AI Legal Consultation Front-End & Bespoke Legal Memorandum Layout

**Working Directory**: `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m4_1`  
**Target Codebase**: `src/app/(dashboard)/ai-chat/page.tsx`, `src/app/(dashboard)/ai-chat/[id]/page.tsx`, and associated components.  
**Date**: 2026-10-31  

---

## 1. Observation

### 1.1 Current Implementation in `src/app/(dashboard)/ai-chat/page.tsx`
- **Location**: `src/app/(dashboard)/ai-chat/page.tsx:22-144`
- **State management**:
  ```tsx
  // Lines 23-51: Static hardcoded array, no persistence with localStorage or API
  const [conversations] = useState([
    {
      id: "conv-1",
      title: "Ish beruvchi tomonidan ish haqini kechiktirish va asossiz bo'shatish",
      category: "Mehnat huquqi",
      statute: "O'zR Yangi Mehnat Kodeksi • 161, 244-moddalar",
      date: "28-oktabr, 2026",
      status: "Tahlil yakunlangan",
      messages_count: 4,
    },
    ...
  ]);
  ```
- **New Chat Action**:
  Line 70: `<Link href="/ai-chat/new">` opens a new chat session, but when the user conducts a consultation, it never persists into the list because `conversations` is purely in-memory static state.
- **Empty State**:
  If a new user arrives with zero consultations, there is no empty state or category-based prompt launcher to guide them on what legal issues can be submitted.

---

### 1.2 Current Implementation in `src/app/(dashboard)/ai-chat/[id]/page.tsx`
- **Location**: `src/app/(dashboard)/ai-chat/[id]/page.tsx:1-360`
- **AI Slop & Generic Chatbot Bubbles**:
  - Lines 193-213: The UI renders conventional consumer messaging bubbles (`rounded-tr-none` for user, `rounded-tl-none` for AI assistant) reminiscent of WhatsApp / generic ChatGPT clones rather than a formal legal docket or judicial memorandum:
    ```tsx
    // User message bubble:
    <div className={`rounded-2xl p-5 text-sm leading-relaxed ${
      msg.role === "user"
        ? "bg-[#0D1B34] text-white rounded-tr-none shadow-md border border-[#C5A059]/30"
        : "bg-white border-2 border-[#C5A059]/30 rounded-tl-none shadow-parchment space-y-4"
    }`}>
    ```
- **Plain Bulleted Sources without Outbound Lex.uz Links**:
  - Lines 228-247: Statutory citations are rendered as a plain `<ul>` with standard disc bullets, lacking interactive Lex.uz outbound links, article badges, or legal parchment card styling:
    ```tsx
    <ul className="space-y-1 pl-4 list-disc text-slate-700 text-xs">
      {msg.sources.map((src, i) => (
        <li key={i}>
          <span className="font-semibold text-[#0D1B34]">{src.title}</span>
          {src.article && (
            <span className="text-[#8E6F24] font-mono font-medium ml-1.5">
              ({src.article})
            </span>
          )}
        </li>
      ))}
    </ul>
    ```
- **Hardcoded, Rigid Viewport Height & Mobile Keyboard Collision**:
  - Line 156:
    ```tsx
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
    ```
    - `100vh` causes mobile browser viewport jumping on iOS Safari and Android Chrome because the address bar dynamically expands/contracts.
    - When the on-screen mobile keyboard appears, `100vh` does NOT shrink, pushing the sticky textarea input off-screen or obscuring it under the virtual keyboard.
    - Inside `src/app/(dashboard)/layout.tsx:223`, `<main>` has `overflow-y-auto p-4 sm:p-8`. Having an inner `h-[calc(100vh-8rem)]` with `flex-1 overflow-y-auto` causes double scrollbars.
- **Limited, Generic Quick Prompts**:
  - Lines 86-90:
    ```tsx
    const quickPrompts = [
      "Ish haqi kechiktirilganda kompensatsiya",
      "Ijara shartnomasini bekor qilish tartibi",
      "Aliment miqdorini belgilash va undirish",
    ];
    ```
    Only 3 generic prompts, without category taxonomy or authentic legal dispute depth reflecting real Uzbekistan citizen issues (e.g. maternal dismissal protections, tenancy disputes without registration, debt promissory notes, inheritance 6-month claim periods).
- **Specialist Booking Disconnection**:
  - Lines 279-283:
    ```tsx
    <Link href={`/specialists/${spec.id}`} className="shrink-0 self-end sm:self-auto">
      <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-8 gap-1">
        Yozilish <ArrowRight className="h-3 w-3" />
      </Button>
    </Link>
    ```
    Clicking "Yozilish" only navigates to `/specialists/${spec.id}`. The application already has `ConsultationBookingDialog` (`src/components/modals/consultation-booking-dialog.tsx`) which integrates with `themis_consultations` storage, but it is not utilized directly within the AI consultation flow.

---

### 1.3 Design Token & Typography Assets Available in `src/app/globals.css`
- Lines 123-320 of `src/app/globals.css` already provide elevated judicial classes that are currently underutilized:
  - `.font-editorial-heading`: Playfair Display / Serif heading styling
  - `.legal-seal`: Green Adliya Vazirligi verified badge
  - `.judicial-crest`: Antique gold crest styling
  - `.statute-border`, `.statute-border-azure`, `.statute-border-gold`: Deckle borders for legal statutes
  - `.legal-memorandum`: Container with tricolor decorative bar (`#0D47A1` -> `#C59B27` -> `#B84A2A`)
  - `.lex-citation`: Interactive Lex.uz pill styling
  - `.notary-stamp`: Notary guardrail border

---

## 2. Logic Chain & Recommendations for Worker M4

To transform the AI consultation experience from a generic chat clone into a bespoke, culturally authentic Uzbek **"Legal Memorandum" (*Huquqiy xulosa* / *Yuridik konsultatsiya xulosasi*)**, Worker M4 should implement the following recommendations:

### 2.1 Bespoke Legal Memorandum Component Architecture
Instead of generic assistant speech bubbles, the AI response should be rendered as a **Formal Judicial Legal Memorandum**:

```
+-----------------------------------------------------------------------------------+
|  [Emblem / Tarozu]  O'ZBEKISTON RESPUBLIKASI QONUNCHILIK EKSPERTIZASI             |
|  YURIDIK KONSULTATSIYA XULOSASI (LEGAL MEMORANDUM)                                 |
|  № HQ-2026/8492 • Sana: 31-Oktabr, 2026 • Themis Adliya Tahlil Tizimi • Lex.uz   |
+-----------------------------------------------------------------------------------+
|  I. HOLAT BAYONI (Citizen Issue Statement & Legal Question)                       |
|     Fuqaroning murojaati bo'yicha aniqlangan asosiy holat va da'vo talabi          |
+-----------------------------------------------------------------------------------+
|  II. MODDIY VA PROTSESSUAL HUQUQ TAHLILI (Substantive & Procedural Law Analysis)  |
|     O'zbekiston Respublikasi qonunlari bo'yicha huquqlar, majburiyatlar va asoslar|
+-----------------------------------------------------------------------------------+
|  III. TEGISHLI QONUN VA KODEKS MODDALARI (Statutory Lex.uz Citation Cards)        |
|     [Parchment Card: Yangi Mehnat Kodeksi 161, 244-m] -> [Lex.uz Outbound Link]   |
|     [Parchment Card: MJtK 49-modda: Ma'muriy jarima] -> [Lex.uz Outbound Link]    |
+-----------------------------------------------------------------------------------+
|  IV. AMALIY HARAKATLAR KETMA-KETLIGI (Actionable Counsel & Practical Roadmap)      |
|     1. Yozma talabnoma kiritish -> 2. Davlat inspeksiyasiga shikoyat -> 3. Sud     |
+-----------------------------------------------------------------------------------+
|  V. TAVSIYA ETILGAN SOHA ADVOKATLARI (Matched Verified Specialists)                |
|     [Dossier Card: #ADV-3810, Adliya Seal, Rating, 1-Click Booking Modal / Link]  |
+-----------------------------------------------------------------------------------+
|  [Notary Stamp] RASMIY HUQUQIY OGOHLANTIRISH ("Advokatura to'g'risida"gi Qonun)   |
|  Nusxa olish (Copy) | Chop etish / PDF saqlash (Print)                            |
+-----------------------------------------------------------------------------------+
```

#### Detailed Section Breakdown:
1. **Official Formal Header**:
   - Scales of Justice emblem (`Scale` icon wrapped in an antique gold circular seal).
   - Official Title: `O'ZBEKISTON RESPUBLIKASI QONUNCHILIGI BO'YICHA HUQUQIY XULOSA`.
   - Docket Number: `№ HQ-2026/[timestamp or id]`.
   - System Watermark: `Lex.uz Milliy Qonunchilik Bazasiga Integratsiyalashgan`.
   - Action toolbar: `Nusxa olish` (copies formatted legal conclusion) and `Chop etish` (`window.print()`).
2. **Section I: Holat bayoni (*Issue Statement*)**:
   - Subtitle: `I. Murojaat Mazmuni va Huquqiy Nizoli Holat`.
   - Clean, objective summary of the citizen's submitted problem.
3. **Section II: Huquqiy tahlil (*Legal Analysis*)**:
   - Subtitle: `II. Moddiy va Protsessual Huquq Tahlili`.
   - Structured paragraphs formatted in `font-serif` with editorial line-height (`leading-relaxed text-[#0B132B]`).
4. **Section III: Tegishli qonun moddalari (*Parchment-styled Lex.uz Citations*)**:
   - Subtitle: `III. Tegishli Qonun va Kodeks Moddalari (Lex.uz Rasmiy Manbasi)`.
   - Rendered using bespoke `StatuteCitationCard` components (detailed in §2.2).
5. **Section IV: Tavsiyalar (*Actionable Steps*)**:
   - Subtitle: `IV. Huquqni Himoya Qilish Bo'yicha Bosqichma-bosqich Harakatlar`.
   - Numbered legal stages with timeline badges (e.g. `1-bosqich: Yozma talabnoma (3 kun)`, `2-bosqich: Mehnat inspeksiyasi (10 kun)`, `3-bosqich: Sudga da'vo arizasi`).
6. **Section V: Tavsiya etilgan amaliyotchi advokatlar (*Matched Advocates*)**:
   - Subtitle: `V. Mazkur Soha Bo'yicha Adliya Vazirligi Tasdiqlagan Advokatlar`.
   - Interactive specialist cards displaying verified license number (`#ADV-xxxx`), Bar Chamber membership, rating, and dual actions: "Profilni ko'rish" (`/specialists/[id]`) and "Konsultatsiyaga yozilish" (triggers `ConsultationBookingDialog`).
7. **Official Legal Guardrail Stamp**:
   - Statutory disclaimer citing the Law "On Advocacy" (*Advokatura to'g'risida*).

---

### 2.2 Parchment-Styled Statutory Citation Cards with Lex.uz Outbound Links
Every legal citation returned by the AI triage engine must render as a dedicated parchment card:
- **Card Styling**:
  - `bg-[#FDFBF7]` (archival linen)
  - `border border-[#E2DCD0]`
  - `border-l-4 border-l-[#B84A2A]` (Bukhara terracotta) or `border-l-[#0D47A1]` (Samarkand azure)
  - Shadow: `shadow-2xs hover:shadow-sm transition-all`
- **Card Content**:
  - **Header**: Statute name in `font-serif font-bold text-[#0B132B] text-sm` + Article badge in `font-mono text-xs text-[#845D18] bg-[#FAF0D9] px-2 py-0.5 rounded border border-[#C59B27]/30`.
  - **Outbound Link to Lex.uz**:
    ```tsx
    <a
      href={src.lex_url || `https://lex.uz/search/all?query=${encodeURIComponent(src.title)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="lex-citation text-xs font-mono inline-flex items-center gap-1.5"
    >
      <span>Lex.uz da ko&apos;rish</span>
      <ExternalLink className="h-3 w-3" />
    </a>
    ```
  - **Verbatim Legal Norm**:
    A blockquote styled with `font-serif italic text-xs text-slate-700 bg-[#FAF7F0] p-3 rounded-lg border border-[#E2DCD0]/70 my-2` summarizing the legislative requirement.
  - **Verified Legislation Seal**:
    Pill showing `O'zR Adliya Vazirligi Tasdiqlangan Matn`.

#### Authentic Lex.uz Statutory URL Mappings:
| Legal Branch | Primary Code / Act | Target Lex.uz URL |
|--------------|--------------------|-------------------|
| **Mehnat huquqi** | Yangi Mehnat Kodeksi (28.10.2022) | `https://lex.uz/docs/6257288` |
| **Oila huquqi** | Oila Kodeksi (30.04.1998) | `https://lex.uz/docs/104720` |
| **Fuqarolik huquqi** | Fuqarolik Kodeksi 1-qism / 2-qism | `https://lex.uz/docs/111189` / `https://lex.uz/docs/180552` |
| **Uy-joy huquqi** | Uy-joy Kodeksi (24.12.1998) | `https://lex.uz/docs/106136` |
| **Ma'muriy huquq** | MJtK (Ma'muriy Javobgarlik Kodeksi) | `https://lex.uz/docs/97661` |
| **Mulk & Soliq** | Soliq Kodeksi (30.12.2019) | `https://lex.uz/docs/4674902` |
| **Advokatura** | "Advokatura to'g'risida"gi Qonun | `https://lex.uz/docs/53894` |

---

### 2.3 Citizen Prompt Suggestions (*Namuna Savollar*)
Replace the 3 flat buttons with authentic, culturally grounded citizen dispute templates.

#### 4 Legal Categories with 12 Pre-filled Dispute Templates:
1. **Mehnat nizolari (Labor Disputes)**:
   - *"Ish beruvchim 2 oydan beri oylik maoshimni bermayapti, qanday qilib moddiy kompensatsiya undiraman?"*
   - *"Homiladorlik yoki bola parvarishi davrida xodimni ishdan bo'shatish qonuniymi?"*
   - *"Ishdan noqonuniy bo'shatilganda ishga qayta tiklash va o'rtacha ish haqini undirish tartibi"*
2. **Oila va aliment (Family & Alimony)**:
   - *"Sud orqali 2 nafar voyaga yetmagan farzand uchun aliment undirish tartibi va miqdori qancha?"*
   - *"Nikohni bekor qilishda birgalikdagi mol-mulkni teng taqsimlash qoidalari qanday?"*
   - *"Chet elda ishlayotgan sobiq turmush o'rtog'idan aliment undirishning qonuniy mexanizmi"*
3. **Uy-joy va meros (Housing & Inheritance)**:
   - *"Ijara shartnomasi rasmiylashtirilmagan bo'lsa, uy egasi zudlik bilan chiqarib yuborishi mumkinmi?"*
   - *"Meros ochilgan kundan 6 oylik muddat o'tib ketgan bo'lsa, meros huquqini sudda tiklash"*
   - *"Kvartirada doimiy ro'yxatda (propiska) turgan shaxsni uy-joydan chiqarish asoslari"*
4. **Mulk va qarz nizolari (Property & Contracts)**:
   - *"Tilxat (tilxat asosidagi qarz) bo'yicha pulni qaytarib ololmayapman, sudga qanday ariza beriladi?"*
   - *"Xarid qilingan sifatsiz tovar uchun to'lovni 14 kun ichida qaytarib olish huquqim"*
   - *"Kafillik shartnomasi bo'yicha bank kafildan asosiy qarzni talab qilganda javobgarlik chegarasi"*

#### UI Presentation:
- **On New Consultation (`/ai-chat/new` or empty state)**:
  Render a 4-card grid ("Tezkor Huquqiy Murojaat Namunasi") with branch icon (`Briefcase`, `Heart`, `Home`, `Scale`), legal code tag, and 1-click launch chips.
- **On Active Consultation (`/ai-chat/[id]`)**:
  Render a smooth, single-row horizontally scrollable chip track above the input bar:
  `className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x whitespace-nowrap"`

---

### 2.4 Mobile Ergonomics & Viewport Height Strategy
To resolve mobile keyboard collision and double scrollbars:
1. **Dynamic Viewport Height (`100dvh`)**:
   - Replace `h-[calc(100vh-8rem)]` with `h-[calc(100dvh-5.5rem)] md:h-[calc(100dvh-4.5rem)]`.
   - `100dvh` automatically recalculates when mobile browser bars or keyboards shift.
2. **Layout Scroll Decoupling**:
   - In `src/app/(dashboard)/layout.tsx`, the `<main>` tag has `overflow-y-auto`.
   - For `/ai-chat/[id]`, the child container should manage its own internal scroll (`overflow-hidden` on page outer container, `overflow-y-auto` solely on the message thread container).
3. **Sticky Backdrop-Blurred Input Bar**:
   - Style the input container as:
     `className="sticky bottom-0 z-20 bg-[#FAF8F5]/95 backdrop-blur-md pt-2 pb-2 border-t border-[#E2DCD0] shadow-xs"`
   - This ensures the input bar stays firmly anchored at the bottom of the screen regardless of scroll position.
4. **Keyboard Avoidance & Resizing**:
   - Textarea: `min-h-[48px] max-h-[120px] text-xs sm:text-sm resize-none rounded-xl bg-white border border-[#C59B27]/40 focus:border-[#0D47A1]`
   - Add `onFocus` handler to trigger `scrollToBottom()` so the active conversation automatically scrolls above the on-screen keyboard.
5. **Floating Scroll-to-Bottom Button**:
   - Add a subtle floating downward pill button (`<Button size="icon" className="rounded-full bg-[#0B132B] ...">`) that appears when the user has scrolled up to review earlier legal memorandum sections.

---

### 2.5 Route Links & Interface Contract 1 Verification
Check all navigation targets:
- `/ai-chat` (AI Consultation Registry) — adheres to Contract 1.
- `/ai-chat/[id]` (AI Consultation Session) — adheres to Contract 1.
- `/specialists/[id]` (Advocate Dossier Profile) — adheres to Contract 1.
- `ConsultationBookingDialog` booking triggers and redirects to `/consultations` with `status: 'pending'` — adheres to Contract 3.

---

### 2.6 Conversation Registry Storage Synchronization
To make `/ai-chat` and `/ai-chat/[id]` feel cohesive:
- Recommend implementing a storage helper (e.g. `themis_ai_conversations` in `localStorage`):
  - On `/ai-chat`: Read stored conversations merged with default seeds (`SEED_AI_CONVERSATIONS`).
  - On `/ai-chat/[id]`: Whenever a new consultation starts or messages are sent, update the conversation item in `themis_ai_conversations` with the latest title, preview, timestamp, and message count.
  - This guarantees that when a user asks a question in `/ai-chat/new`, navigating back to `/ai-chat` immediately displays their active inquiry in the registry!

---

## 3. Caveats

1. **Read-Only Investigation Scope**:
   Explorer M4_1 has performed a read-only investigation. No source code in `src/` has been altered. All implementations are scoped for Worker M4.
2. **Backend Engine Dependency (Explorer M4_2)**:
   The quality of the Legal Memorandum depends on the API response structure returned by `src/app/api/ai/chat/route.ts`. Explorer M4_2 is investigating regex tokenization, keyword collisions, and statutory citation mapping in the API route. The frontend should gracefully handle both the new rich response format and backward-compatible strings.
3. **Print Media Styling**:
   For the "Chop etish / PDF" action on the Legal Memorandum, standard browser `@media print` rules should hide the sidebar, header, and input bar, printing only the `#legal-memorandum` document container on clean white paper.
4. **Offline Resilience**:
   The prompt suggestions and local statutory citation cards must function seamlessly whether OpenAI is online or fallback local rule-based mock responses are returned.

---

## 4. Conclusion

The current AI chat interface resembles a standard generic messaging app that falls short of the judicial authority and cultural resonance expected of Uzbekistan's premier legal consultation platform. 

By upgrading `/ai-chat` and `/ai-chat/[id]` to a **Bespoke Legal Memorandum Layout**:
- **Official Judicial Header**: Emblem, formal docket numbering, date, and Lex.uz integration seals.
- **5 Structured Sections**: Holat bayoni, Moddiy va protsessual huquq tahlili, Tegishli qonun moddalari, Amaliy tavsiyalar, and Tavsiya etilgan advokatlar.
- **Parchment Citation Cards**: Outbound links to official Lex.uz legislation (`lex.uz/docs/...`), verbatim excerpts, and article badges.
- **12 Categorized Citizen Dispute Prompts**: Authentic templates for labor, family, housing, and civil contract disputes.
- **Mobile Ergonomics**: `100dvh` viewport height, sticky backdrop input bar, keyboard-safe horizontal prompt scroll.
- **Full Contract Compliance**: Strict adherence to Interface Contracts 1 and 3, seamlessly connecting AI triage with verified advocate bookings.

Worker M4 has all necessary layout specifications, code blueprints, and styling tokens to execute this milestone cleanly.

---

## 5. Verification Method

To independently verify the implementation after Worker M4 finishes:
1. **Type Checking & Build**:
   ```powershell
   npm run build
   ```
   Must compile without TypeScript or Tailwind syntax errors.
2. **E2E Test Suite**:
   ```powershell
   node tests/e2e/runner.js
   ```
   All test cases (especially Tier 1 Feature 4 & 5, Tier 2 Boundary 1, and Tier 4 Scenarios) must pass 100%.
3. **Visual & Interactive Inspection**:
   - Visit `http://localhost:3000/ai-chat`: Verify the Archival Registry docket and "Yangi huquqiy tahlil ochish" button.
   - Visit `http://localhost:3000/ai-chat/new`: Verify the 4-category prompt launcher cards. Click a prompt (e.g. "Ish haqi kechiktirilganda...") and verify it submits.
   - Inspect the AI response: Confirm the formal Legal Memorandum card renders with tricolor decorative bar, official docket header, Holat bayoni, Huquqiy tahlil, parchment Lex.uz citation cards with outbound external links, and matched specialist cards with "Profilni ko'rish" and "Konsultatsiyaga yozilish" actions.
   - Test Mobile Viewport: Inspect with mobile viewport (375x667) to confirm `100dvh` prevents vertical jumping, prompts scroll horizontally, and the input bar remains sticky at the bottom.
