## 2026-10-31T12:26:24Z
[Message] timestamp=2026-10-31T12:26:24Z sender=c441034b-c0db-4d0b-9a42-9a9fe8700a4c priority=MESSAGE_PRIORITY_HIGH content=You are Worker M4 (teamwork_worker) for Themis (Huquqiy Yordam).
Your working directory is: c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m4
Project root: c:\Users\Bro\Desktop\Themis

MANDATORY READING (Read first before starting work):
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\Bro\Desktop\Themis\PROJECT.md
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m4_1\handoff.md
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m4_2\handoff.md
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m4_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OWNED FILES:
You have exclusive write access to:
- `src/app/api/ai/chat/route.ts`
- `src/lib/triage.ts`
- `src/lib/ai-chat-storage.ts`
- `src/lib/mock-data.ts`
- `src/app/(dashboard)/ai-chat/page.tsx`
- `src/app/(dashboard)/ai-chat/[id]/page.tsx`

OBJECTIVE:
Execute Milestone 4 (AI Legal Consultation Flow & Statutory Guidance) to eliminate AI slop, fix substring keyword collisions, and establish an authentic legal consultation experience.

DETAILED TASKS:

1. Backend AI Triage Engine & Keyword Collision Resolution (`src/lib/triage.ts` & `src/app/api/ai/chat/route.ts`):
   - Implement the tokenized scoring triage engine prototyped by Explorer M4_2.
   - Resolve Defect A ("ish" collision): Do NOT match generic action suffixes or general words like "ishonchnoma", "undirish", "yetkazib berish". Use phrase/token matching for authentic labor terms ("ish haqi", "ishdan bo'shatish", "mehnat shartnomasi", "ish beruvchi", etc.).
   - Resolve Defect B ("uy" collision): Do NOT match substrings in "buyurtma", "buyruq", "tuyg'u". Match whole tokens/phrases for housing ("uy-joy", "ijara", "turar joy", "propiska", "kadastr", "xonadon", "kvartira", "uydan").
   - Handle Uzbek apostrophes (`'`, `’`, `‘`, `ʻ`, `ʼ`) and Cyrillic roots so queries in Latin/Cyrillic are classified accurately.
   - Statutory citations: Return authentic Lex.uz links and articles for all legal branches.
   - CRITICAL E2E ASSERTION REQUIREMENT: In labor responses, ensure the text contains `"Mehnat kodeksiga binoan"` (required by `tier4-real-world-scenarios.test.js:49`).
   - In `src/lib/mock-data.ts`, add `spec-4` (criminal/administrative in Fergana) and `spec-5` (business/tax in Bukhara) from `tests/e2e/harness.js` so that all 10 legal branches have matching specialists.

2. Consultation Persistence & Storage Helper (`src/lib/ai-chat-storage.ts`):
   - Create persistent client storage for AI conversations under `themis_ai_conversations` in `localStorage` (with graceful fallback).
   - Support conversation metadata: id, title, category, timestamp, messages.
   - Handle initial inquiry pre-filling from `themis_pending_inquiry` / `?q=...` originating from the landing page.

3. Front-End Consultation Hub (`src/app/(dashboard)/ai-chat/page.tsx`):
   - Replace generic SaaS interface with elevated editorial styling (warm parchment, judicial blue, serif headlines).
   - Display official judicial header with emblem, docket number, and Lex.uz integration badge.
   - Display authentic prompt suggestion cards (*Namuna savollar*) across 4 dispute areas (Mehnat, Oila, Uy-joy, Mulk).
   - List recent consultations with category tags and delete/continue actions.
   - Integrate the mandatory statutory disclaimer (Feature 7) verbatim:
     "Ushbu sun'iy intellekt tahlili dastlabki axborot xarakteriga ega bo'lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling."

4. Bespoke Legal Memorandum Chat View (`src/app/(dashboard)/ai-chat/[id]/page.tsx`):
   - Render AI responses as a formal "Huquqiy xulosa" (Legal Memorandum):
     - Official judicial docket header with scale emblem, date, and Lex.uz verification badge.
     - Structured sections:
       1. Holat bayoni (Citizen issue summary)
       2. Huquqiy tahlil (Legal analysis)
       3. Tegishli qonun moddalari (Lex.uz statutory citation parchment cards with clickable outbound links)
       4. Amaliy tavsiyalar (Actionable steps)
       5. Tavsiya etilgan advokatlar (Matched specialist cards with direct navigation to `/specialists/[id]`)
   - Mobile ergonomics: Use `100dvh`, sticky blurred input bar, quick suggestion pills, and proper keyboard padding.
   - Strictly adhere to Interface Contract 1 (canonical routes without `/dashboard/` prefix).

VERIFICATION REQUIREMENTS:
Run all of the following commands in powershell from project root and include verbatim outputs in handoff.md:
1. `node tests/e2e/runner.js` (Must pass 84/84 tests, 100%)
2. `npx tsc --noEmit` (Must pass with 0 errors)
3. `npm run lint` (Must pass with 0 warnings or errors)
4. `npm run build` (Must succeed, generating all 27+ routes)

OUTPUT:
Write your complete handoff report to `c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m4\handoff.md` with sections: Observation, Logic Chain, Caveats, Conclusion, Verification Method.
Send a message back when complete.
