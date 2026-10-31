# Worker M2 Dispatch Assignment

## Mission
Execute Milestone 2: Navigation Architecture, Public Landing Page & Editorial Identity.

## Input Artifacts
- ORIGINAL_REQUEST: c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT: c:\Users\Bro\Desktop\Themis\PROJECT.md
- Explorer M2_1 Report (33 link fixes): c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m2_1\handoff.md
- Explorer M2_2 Report & Drop-in Landing Page: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m2_2\handoff.md and c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m2_2\proposed_page.tsx
- Explorer M2_3 Report & Drop-in Policies/Modals: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m2_3\handoff.md and source files in c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m2_3\

## Exclusively Owned Target Files
1. `src/app/(dashboard)/layout.tsx`
2. `src/app/(dashboard)/dashboard/page.tsx`
3. `src/app/(dashboard)/specialists/page.tsx`
4. `src/app/(dashboard)/specialists/[id]/page.tsx`
5. `src/app/(dashboard)/ai-chat/page.tsx`
6. `src/app/(dashboard)/ai-chat/[id]/page.tsx`
7. `src/app/(dashboard)/consultations/page.tsx`
8. `src/app/(dashboard)/consultations/[id]/page.tsx`
9. `src/app/(dashboard)/consultations/[id]/chat/page.tsx`
10. `src/app/(specialist)/specialist/requests/page.tsx`
11. `src/app/page.tsx`
12. `src/app/privacy/page.tsx`
13. `src/app/terms/page.tsx`
14. `src/app/about/page.tsx`
15. `src/components/modals/forgot-password-modal.tsx`
16. `src/components/modals/privacy-modal.tsx`
17. `src/components/modals/terms-modal.tsx`
18. `src/components/layout/footer.tsx`
19. `src/app/(auth)/login/page.tsx`

## Verification Commands
1. `npx tsc --noEmit` -> Must succeed with 0 errors
2. `npm run lint` -> Must succeed with 0 errors
3. `npm run build` -> All routes must compile with code 0
4. `node tests/e2e/runner.js` -> 84/84 tests pass (100% pass rate)
5. `rg "/dashboard/(specialists|ai-chat|consultations|profile)" src/` -> 0 matches found

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
