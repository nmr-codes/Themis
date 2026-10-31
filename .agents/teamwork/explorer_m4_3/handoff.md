# Handoff Report: Citizen Consultation Journey, Disclaimers, Session Lifecycle & Persistence (M4_3)

**Author**: Explorer M4_3 (`teamwork_explorer`)  
**Date**: 2026-10-31  
**Project**: Themis (Huquqiy Yordam) — Legal Consultation Platform for Uzbekistan  
**Target Milestone**: M4 (AI Legal Consultation Flow & Statutory Guidance)  

---

## 1. Observation

### 1.1 Session Management, Routing & Persistence (`/ai-chat` and `/ai-chat/[id]`)

1. **Landing Page Handshake Break**:
   - Location: `src/app/page.tsx:165-176`:
     ```typescript
     const handleInquirySubmit = (e?: React.FormEvent, customQuery?: string) => {
       if (e) e.preventDefault();
       const query = (customQuery || inquiryText).trim();
       if (!query) {
         toast.info("Iltimos, huquqiy masalangizni yozing");
         return;
       }
       if (typeof window !== "undefined") {
         localStorage.setItem("themis_pending_inquiry", query);
       }
       router.push(`/ai-chat?q=${encodeURIComponent(query)}`);
     };
     ```
   - In `src/app/(dashboard)/ai-chat/page.tsx`: The component does **not** read `useSearchParams()`, does **not** read `themis_pending_inquiry` from `localStorage`, and ignores incoming queries entirely. The user inquiry entered on the home page is lost immediately.
   - In `src/app/(dashboard)/ai-chat/page.tsx:23-51`: The conversations registry is a hardcoded in-memory state:
     ```typescript
     const [conversations] = useState([
       { id: "conv-1", title: "Ish beruvchi tomonidan ish haqini kechiktirish...", ... },
       { id: "conv-2", title: "Ijara shartnomasini muddatidan oldin bekor qilish...", ... },
       { id: "conv-3", title: "Aliment to'lovlarini sud orqali undirish...", ... },
     ]);
     ```
     No storage layer (`localStorage` or Supabase) is consulted. New conversations created in `/ai-chat/new` never appear in this list.

2. **Chat Session Ephemerality & Identical Transcript Collision**:
   - Location: `src/app/(dashboard)/ai-chat/[id]/page.tsx:37-80`:
     - If `params.id === "new"`, it sets a single assistant intro message.
     - If `params.id !== "new"`, it **always** loads the exact same hardcoded messages (`m-1`: labor dispute message, `m-2`: labor law response with Azizbek Rahimov recommendation), regardless of whether the user opened `/ai-chat/conv-2` (housing) or `/ai-chat/conv-3` (child support).
     - When messages are sent (`handleSend` at line 100), messages are appended only to `setMessages((prev) => [...prev, newAiMsg])`.
     - Refreshing the page, navigating away, or clicking the back button (`<Link href="/ai-chat">` at line 160) wipes out the entire session. No persistence helper is called.

3. **Database Schema Readiness vs Implementation Reality**:
   - In `supabase/migrations/001_initial_schema.sql:192-224`, comprehensive tables already exist:
     - `public.ai_conversations`: `id uuid`, `user_id uuid`, `title text`, `legal_category_id text`, `status text`, `created_at`, `updated_at`.
     - `public.ai_messages`: `id uuid`, `conversation_id uuid`, `role text`, `content text`, `sources jsonb`, `recommended_specialists uuid[]`, `created_at`.
     - `public.consultations`: includes `ai_conversation_id uuid references public.ai_conversations(id)`.
   - In contrast, the client app has an established localStorage persistence pattern for offline demo personas (`src/lib/consultation-storage.ts`), but has **no** equivalent `ai-chat-storage.ts`.

---

### 1.2 Statutory Legal Disclaimer (Feature 7 & Uzbek Law on Advocacy)

1. **Statutory Text Mandate**:
   - Uzbek Law on Advocacy (*"Advokatura to'g'risida"gi Qonun*, Law No. 349-I):
     `"Ushbu sun'iy intellekt tahlili dastlabki axborot xarakteriga ega bo'lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling."`
2. **Current Divergence in Triage View**:
   - In `src/app/(dashboard)/ai-chat/page.tsx:88-90`:
     ```tsx
     <p className="text-xs text-slate-700 leading-relaxed font-serif italic">
       AI tahlilchisi O'zbekiston Respublikasining rasmiy kodeks va qonun hujjatlariga asoslangan holda dastlabki huquqiy yo'nalish beradi. Ushbu ma'lumotlar rasmiy advokatlik orderi yoki sud qarori hisoblanmaydi. Amaliy choralar uchun ro'yxatdan o'tgan advokat bilan konsultatsiya tashkil qilish tavsiya etiladi.
     </p>
     ```
     This does **not** quote or match the statutory phrasing required under the Law on Advocacy.
3. **Absence in Chat Transcript View**:
   - In `src/app/(dashboard)/ai-chat/[id]/page.tsx`:
     - There is **no persistent statutory banner** in the top docket header or chat container.
     - Line 354 contains only:
       ```tsx
       <p className="text-[10px] font-mono text-slate-500 text-center mt-2">
         Enter — yuborish, Shift+Enter — yangi qator. AI xulosasi rasmiy advokatlik maslahatini to'ldiradi.
       </p>
       ```
       Claiming that the AI conclusion "complements official legal advice" (*advokatlik maslahatini to'ldiradi*) violates the statutory requirement to state that the AI is purely informational and *not* an advocate defense.
     - Individual AI message cards (`msg.role === "assistant"`) do not carry statutory disclaimer seals or legal warning footers.

---

### 1.3 Transition to Advocate Consultation (Feature 6 & Interface Contract 3)

1. **Card Interactivity & Link Inspection**:
   - In `src/app/(dashboard)/ai-chat/[id]/page.tsx:257-285`:
     ```tsx
     {msg.recommended_specialists.map((spec: any) => (
       <div key={spec.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-[#FAF7EE] border border-[#C59B27]/40 gap-3 text-xs">
         <div className="flex items-center gap-3">
           <Avatar className="h-9 w-9 border border-[#C59B27]/40">...</Avatar>
           <div>
             <p className="font-editorial-heading font-bold text-sm text-[#0D1B34]">{spec.full_name}</p>
             <p className="text-[11px] text-slate-600">{spec.education}</p>
             <p className="text-[10px] text-amber-700 font-bold mt-0.5">★ {spec.rating_avg} ({spec.rating_count} sharh)</p>
           </div>
         </div>
         <Link href={`/specialists/${spec.id}`} className="shrink-0 self-end sm:self-auto">
           <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-8 gap-1">
             Yozilish <ArrowRight className="h-3 w-3" />
           </Button>
         </Link>
       </div>
     ))}
     ```
   - **Clicking the card outside the small button does nothing**. The card container is not interactive.
   - **Lost Context on Navigation**: Navigating to `/specialists/${spec.id}` does not carry over the conversation context, user inquiry text, or chosen legal branch.
   - **Modal Integration on `/specialists/[id]`**:
     - `src/app/(dashboard)/specialists/[id]/page.tsx` renders `ConsultationBookingDialog` from `src/components/modals/consultation-booking-dialog.tsx`.
     - When submitted, `handleConfirmBooking` (lines 148-173) saves to `themis_consultations` via `saveConsultation()`, properly satisfying Interface Contract 3.
     - However, `/specialists/[id]` does not inspect search parameters (e.g. `?book=true&notes=...`), requiring the citizen to manually find and click the booking button again on the profile page.

---

### 1.4 Bilingual Handling (Uzbek Latin and Cyrillic)

1. **Regex & Keyword Engine Deficiencies in `src/app/api/ai/chat/route.ts`**:
   - Line 82:
     ```typescript
     const hasWord = (word: string) => new RegExp(`(^|[^a-z0-9_'])${word}([^a-z0-9_']|$)`, "i").test(text);
     ```
     `[^a-z0-9_']` fails on Cyrillic characters because Cyrillic letters are matched as boundary delimiters rather than word characters.
   - Lines 89–317: All triage keyword rules are exclusively in Uzbek Latin:
     - Labor: `ish`, `maosh`, `mehnat`, `bo'shatish`, `ta'til` (no `иш`, `маош`, `меҳнат`, `бўшатиш`, `таътил`, `зарплата`, `увольнение`)
     - Family: `nikoh`, `ajralish`, `aliment`, `farzand` (no `никоҳ`, `ажралиш`, `алимент`, `фарзанд`, `развод`)
     - Housing: `ijara`, `kvartira`, `uy-joy`, `kadastr`, `propiska` (no `ижара`, `квартира`, `уй-жой`, `прописка`, `аренда`)
     - Criminal: `jinoyat`, `tergov`, `qamoq`, `pora` (no `жиноят`, `тергов`, `қамоқ`, `пора`, `уголовный`)
     - Tax: `soliq`, `ndfl`, `nds`, `penya` (no `солиқ`, `пеня`, `налог`)
     - Business: `tadbirkor`, `mchj`, `firma` (no `тадбиркор`, `мчж`, `фирма`, `бизнес`)
   - Any query in Uzbek Cyrillic or Russian completely misses specific legal branches and falls through to the generic default civil category (`civil`).

---

### 1.5 E2E Test Suite Verification & Critical Discrepancy

1. **Test Runner Execution**:
   - Command: `node tests/e2e/runner.js`
   - Output: 84/84 tests passed (Tier 1: 43, Tier 2: 27, Tier 3: 8, Tier 4: 6) across 104 ms.
   - `npm run lint`: 0 warnings, 0 errors.
   - `npm run build`: 27/27 static pages generated cleanly, exit code 0.

2. **Crucial Discrepancy Discovered Between `route.ts` and `harness.js`**:
   - In `tests/e2e/tier4-real-world-scenarios.test.js:49`:
     ```javascript
     assert.ok(triage.content.includes("Mehnat kodeksiga binoan"));
     ```
   - In `tests/e2e/harness.js:277`:
     ```javascript
     content = "Sizning murojaatingiz **Mehnat huquqi** sohasiga tegishli.\n\n" +
       "**Dastlabki huquqiy tushuntirish:**\n" +
       "O'zbekiston Respublikasi Mehnat kodeksiga binoan, ish beruvchi...";
     ```
   - In `src/app/api/ai/chat/route.ts:226`:
     ```typescript
     content = `Sizning murojaatingiz **Mehnat huquqi** sohasiga tegishli.\n\n` +
       `**Dastlabki huquqiy tushuntirish:**\n` +
       `O'zbekiston Respublikasining Yangi Mehnat kodeksiga ko'ra, ish beruvchi...`;
     ```
   - Notice: `route.ts` uses `"Mehnat kodeksiga ko'ra"` while the test asserts `"Mehnat kodeksiga binoan"`.
   - In `tests/e2e/tier1-feature-coverage.test.js:302`:
     ```javascript
     assert.ok(body.response.content.includes("Mehnat huquqi"));
     ```
   - **Risk**: Any update to `route.ts` or `harness.js` **must** retain both `"Mehnat huquqi"` and `"Mehnat kodeksiga binoan"` in the labor triage content to prevent breaking Tier 1 Feature 5 or Tier 4 Scenario 1!

---

## 2. Logic Chain

```
[Observation 1.1: Landing page saves themis_pending_inquiry and routes to /ai-chat?q=...]
     │
     ▼
[/ai-chat ignores ?q= and localStorage; /ai-chat/[id] has no persistence and loads identical mock labor text for any id]
     │
     ▼
[Break in Citizen Journey: Citizen inquiry is lost upon entry, past sessions cannot be reviewed, reload deletes analysis]
     │
     ▼
[Recommendation: Create src/lib/ai-chat-storage.ts matching consultation-storage.ts pattern; connect landing page handover]
```

```
[Observation 1.2: Law on Advocacy strictly regulates legal representation; AI must be explicitly informational]
     │
     ▼
[Current /ai-chat has non-standard disclaimer; /ai-chat/[id] has no disclaimer and vague footer claiming it 'complements' advice]
     │
     ▼
[Non-Compliance with Feature 7: Citizen has no statutory clarity that AI is not an advocate defense]
     │
     ▼
[Recommendation: Embed verbatim disclaimer permanently in docket header, triage hub, landing page, and per-message notary seals]
```

```
[Observation 1.3: Recommend specialist cards have passive container and button navigating to /specialists/[id] without query context]
     │
     ▼
[Friction in Advocate Transition: Citizen arrives at specialist profile but must restart inquiry and booking manually]
     │
     ▼
[Recommendation: Make entire card clickable, pass ?book=true&notes=..., and support direct booking modal invocation from chat]
```

```
[Observation 1.4: Rule engine regex is [^a-z0-9_'] and keywords are 100% Latin; Uzbek Cyrillic / Russian queries fail to triage]
     │
     ▼
[Language Inequity: Significant portion of Uzbek citizens entering Cyrillic are routed to wrong category (civil)]
     │
     ▼
[Recommendation: Implement Cyrillic transliteration / dual-script keywords without altering existing Latin assertions]
```

```
[Observation 1.5: tier4-real-world-scenarios:49 strictly asserts content.includes('Mehnat kodeksiga binoan'); tier1:302 asserts 'Mehnat huquqi']
     │
     ▼
[Discrepancy: route.ts currently uses 'ko'ra' instead of 'binoan'; if e2e tested live route, tier4 would fail]
     │
     ▼
[Recommendation: Align route.ts and harness.js to include both 'Mehnat huquqi' and 'Mehnat kodeksiga binoan']
```

---

## 3. Caveats

1. **OpenAI API Key in Production vs Offline Fallback**:
   - When an `OPENAI_API_KEY` is provided, GPT-4o-mini performs dynamic categorization and returns JSON.
   - However, offline deterministic fallback (`processAiTriage` in `harness.js` and local branch in `route.ts`) is what runs during E2E testing and demo usage. All statutory text, disclaimers, and Cyrillic keyword mapping must exist in *both* GPT system prompts and local deterministic rules.
2. **Supabase Authentication State in Demo Mode**:
   - The platform supports offline personas (`themis_demo_user` in `localStorage`).
   - `ai-chat-storage.ts` must primarily operate on SSR-safe `localStorage` (`themis_ai_conversations`) with pre-seeded dockets (`conv-1`, `conv-2`, `conv-3`), while remaining structured to sync with Supabase tables `ai_conversations` and `ai_messages` when authenticated.
3. **No Unwarranted E2E Test Mutations**:
   - `tests/e2e/tier1-feature-coverage.test.js`, `tier2-boundary-corner.test.js`, `tier3-cross-feature.test.js`, and `tier4-real-world-scenarios.test.js` are authoritative contracts. They must never be relaxed or broken; all proposed code enhancements must maintain 100% pass rates.

---

## 4. Conclusion

The citizen consultation journey currently has four critical structural gaps that M4 must address:

1. **Session Lifecycle & Storage Architecture**:
   - Create `src/lib/ai-chat-storage.ts` using the storage pattern established in `consultation-storage.ts`.
   - Store conversation dockets in `localStorage.getItem("themis_ai_conversations")` with authentic pre-seeded data for `conv-1` (Labor), `conv-2` (Housing), `conv-3` (Family).
   - In `/ai-chat/page.tsx`, mount from storage so new and historical sessions appear dynamically.
   - In `/ai-chat/[id]/page.tsx`, load messages corresponding to `params.id`. When on `/ai-chat/new`, automatically create and persist a new docket upon first message submission and transition URL cleanly.
   - Handle landing page redirection (`/ai-chat?q=...` or `themis_pending_inquiry`) by auto-initializing a new triage session.

2. **Persistent Statutory Legal Disclaimer (Feature 7)**:
   - Permanently embed the verbatim statutory text under Uzbek Law on Advocacy:
     > *"Ushbu sun'iy intellekt tahlili dastlabki axborot xarakteriga ega bo'lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling."*
   - Place this prominently in:
     - `/ai-chat/page.tsx` legal guardrail banner.
     - Top archival banner of `/ai-chat/[id]/page.tsx`.
     - Footers/notary seals of every assistant message card in the chat transcript.
     - Replace the misleading line 354 footer with the statutory disclaimer.

3. **Advocate Consultation Transition (Feature 6 & Interface Contract 3)**:
   - Make recommended specialist cards fully interactive with dual action triggers:
     - Card click / "Profilni ko'rish" navigates to `/specialists/${spec.id}?book=true&notes=${encodeURIComponent(userPrompt)}`.
     - In `/specialists/[id]`, parse `searchParams` so `book=true` automatically opens `ConsultationBookingDialog` with notes pre-filled.
     - Alternatively, offer a direct "Konsultatsiyaga yozilish" action right inside the AI chat interface to invoke `ConsultationBookingDialog` immediately.
     - Ensure confirmed bookings are saved to `themis_consultations` with `status: 'pending'` (Interface Contract 3).

4. **Bilingual & Cyrillic Support**:
   - Augment `src/app/api/ai/chat/route.ts` and `harness.js` with Uzbek Cyrillic keywords (`иш`, `маош`, `меҳнат`, `никоҳ`, `алимент`, `ижара`, `жиноят`, `солиқ`, etc.) and common Russian legal terms.
   - Fix word boundary detection to support Unicode characters.

5. **Test Alignment**:
   - Ensure `route.ts:226` content contains `"Mehnat kodeksiga binoan"` in addition to `"Mehnat huquqi"` and Lex.uz citations (`161, 244-moddalar`), ensuring full harmony with `tier1-feature-coverage.test.js:302` and `tier4-real-world-scenarios.test.js:49-50`.

---

## 5. Verification Method

To independently verify these findings and ensure zero regressions when implementing M4:

1. **Verify E2E Test Suite Integrity**:
   ```powershell
   node tests/e2e/runner.js
   ```
   *Expected outcome*: 84/84 tests pass across all 4 Tiers.

2. **Verify Next.js Type Check and Production Build**:
   ```powershell
   npm run lint
   npm run build
   ```
   *Expected outcome*: 0 ESLint errors; all 27 static and dynamic routes compile successfully.

3. **Verify Exact String Constraints**:
   - `grep_search` in `tests/e2e/tier4-real-world-scenarios.test.js` for `"Mehnat kodeksiga binoan"`.
   - `grep_search` in `tests/e2e/tier1-feature-coverage.test.js` for `"Mehnat huquqi"` and `"161"`.
   - `grep_search` in `src/app/api/ai/chat/route.ts` to confirm presence of both strings.

4. **Verify Persistent Disclaimer Presence**:
   - Inspect `/ai-chat/page.tsx` and `/ai-chat/[id]/page.tsx` to verify verbatim presence of:
     `"Ushbu sun'iy intellekt tahlili dastlabki axborot xarakteriga ega bo'lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling."`

5. **Verify Interface Contract 3 Persistence**:
   - Check `localStorage.getItem("themis_consultations")` after booking to confirm `status: "pending"` record creation.

---
*Report generated and self-verified by Explorer M4_3.*
