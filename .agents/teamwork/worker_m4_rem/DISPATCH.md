## 2026-10-31T12:47:23Z
You are Worker M4 Remediation (teamwork_worker) for Themis (Huquqiy Yordam).
Your working directory is: c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m4_rem
Project root: c:\Users\Bro\Desktop\Themis

MANDATORY READING:
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\Bro\Desktop\Themis\PROJECT.md
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\challenger_m4_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OWNED FILE:
You have exclusive write access to:
- `src/lib/triage.ts`

OBJECTIVE:
Remediate the single defect identified by Challenger M4_1 in `src/lib/triage.ts`:
Probe ISH-4 `"Ko'chmas mulkni taqsimlash va ulush ajratish"` was misclassified as `family` instead of `property` due to phrase collision with `"mulkni taqsimlash"` in `family`.

FIX SPECIFICATION:
1. In `src/lib/triage.ts` under `CATEGORY_RULES.property`:
   - Add `"ko'chmas mulk"`, `"ko'chmas mulkni taqsimlash"` to `phrases`.
   - Add `"ko'chmas"`, `"mulk"`, `"ulush"` to `tokens`.
   - Ensure generic real estate & property division disputes score decisively higher in `property` than `family` when real estate keywords are present.
2. In `classifyLegalQuery`:
   - Ensure ties or multiple strong matches are resolved sensibly, giving appropriate weight to specific property and real-estate markers.

VERIFICATION COMMANDS:
You must run all of the following commands in powershell from project root and document verbatim output in handoff.md:
1. `node tests/adversarial-m4.mjs` (MUST pass 42/42, 100%)
2. `node tests/adversarial_m4_2_probe.mjs` (MUST pass 25/25, 100%)
3. `node tests/e2e/runner.js` (MUST pass 84/84, 100%)
4. `npx tsc --noEmit` (MUST pass with 0 errors)
5. `npm run lint` (MUST pass with 0 warnings or errors)
6. `npm run build` (MUST succeed across all 27 routes)

OUTPUT:
Write your complete handoff report to `c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m4_rem\handoff.md`.
Send a message back when complete.
