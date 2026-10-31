## 2026-10-31T10:40:20Z
You are Explorer M3_2 Retry (teamwork_explorer).
Your working directory is: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_2_retry

## Mission
Investigate and formulate an exact, verified fix strategy for BUG-M3-02 identified by Challenger M3_1 during Milestone 3 gate verification.
DO NOT implement changes directly (you are read-only). You analyze, verify, and write a concrete handoff report with drop-in code recommendations for the Worker.

## Required Documents to Read
1. ORIGINAL_REQUEST: c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
2. PROJECT: c:\Users\Bro\Desktop\Themis\PROJECT.md
3. Challenger M3_1 Failure Report: c:\Users\Bro\Desktop\Themis\.agents\teamwork\challenger_m3_1\handoff.md

## Problem: BUG-M3-02 (Deceptive Category Badge & Mock Coverage)
In `src/app/(dashboard)/specialists/page.tsx:464`:
`{count > 0 ? `${count} nafar advokat` : "Mutaxassis mavjud"}`
For categories where `count === 0` (currently criminal, administrative, business, tax), the chip renders "Mutaxassis mavjud" ("Specialist available"), which is misleading and immediately shows an empty state upon selection.
Furthermore, `MOCK_SPECIALISTS` only has 3 specialists, leaving 4 of the 10 legal branches with 0 registered advocates.

## Tasks
1. Inspect `src/app/(dashboard)/specialists/page.tsx:464` and `src/lib/mock-data.ts`.
2. Formulate the exact fix for the badge text: replace `"Mutaxassis mavjud"` with `"Hozircha bo'sh"` (or `"0 nafar advokat"`) when `count === 0`.
3. Design 2 additional realistic Uzbek advocate mock profiles (e.g., `spec-4` for Jinoyat & Ma'muriy in Farg'ona / Andijon, and `spec-5` for Biznes & Soliq in Buxoro / Samarqand, complete with Adliya Vazirligi license numbers, chambers, court representation rights, and academic pedigrees) to enrich `src/lib/mock-data.ts` so all 10 branches have representation and realistic multi-region coverage.
4. Verify compatibility with existing types, E2E tests, and Interface Contracts.
5. Write your report to `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_2_retry\handoff.md`.
6. Send a completion message via `send_message` to your parent orchestrator (Conversation ID: 3af50056-2b06-4ae0-8a24-088afd769646).
