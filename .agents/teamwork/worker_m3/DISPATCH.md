# Worker M3 Dispatch Assignment

## Mission
Execute Milestone 3: Specialist Catalog & Detail Dossier Profiles.

## Input Artifacts
- ORIGINAL_REQUEST: c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT: c:\Users\Bro\Desktop\Themis\PROJECT.md
- Explorer M3_1 Report & Drop-in Catalog: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_1\handoff.md and c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_1\proposed_specialists_page.tsx
- Explorer M3_2 Report & Drop-in Dossier: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_2\handoff.md and c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_2\proposed_page.tsx
- Explorer M3_3 Report & Drop-in Booking/Storage: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_3\handoff.md and files in c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_3\

## Exclusively Owned Target Files
1. `src/lib/types.ts` (Add `license_number` & `chamber_name` to `Specialist` type)
2. `src/lib/mock-data.ts` (Enrich specialists with `#ADV-xxxx` license numbers)
3. `src/lib/consultation-storage.ts` (New storage helper from explorer_m3_3)
4. `src/components/modals/consultation-booking-dialog.tsx` (New booking dialog component from explorer_m3_3)
5. `src/app/(dashboard)/specialists/page.tsx` (Replace with elevated catalog from explorer_m3_1)
6. `src/app/(dashboard)/specialists/[id]/page.tsx` (Replace with elevated dossier from explorer_m3_2, integrated with booking dialog & persistence)
7. `src/app/(dashboard)/consultations/page.tsx` (Update to hydrate from `getStoredConsultations()` per explorer_m3_3)
8. `src/app/(dashboard)/consultations/[id]/page.tsx` (Update to resolve from storage/mock data per explorer_m3_3)

## Verification Requirements
1. `npx tsc --noEmit` -> Must succeed with 0 errors
2. `npm run lint` -> Must succeed with 0 errors
3. `npm run build` -> All routes must compile with code 0
4. `node tests/e2e/runner.js` -> 84/84 tests pass (100% pass rate)


## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-10-31T10:12:59Z
You are Worker M3 (role: Milestone 3 Implementation Worker).
Your working directory: c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m3

Tasks:
1. Type & Mock Data Updates (`src/lib/types.ts`, `src/lib/mock-data.ts`).
2. Consultation Persistence & Dialog Components (`src/lib/consultation-storage.ts`, `src/components/modals/consultation-booking-dialog.tsx`, `src/app/(dashboard)/consultations/page.tsx`, `src/app/(dashboard)/consultations/[id]/page.tsx`).
3. Specialist Catalog Elevation (`src/app/(dashboard)/specialists/page.tsx`).
4. Specialist Detail Dossier Elevation (`src/app/(dashboard)/specialists/[id]/page.tsx`).
5. Verification: tsc, lint, build, e2e runner (84/84 tests pass).

