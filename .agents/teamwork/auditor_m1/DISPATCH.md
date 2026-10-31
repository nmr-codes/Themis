## 2026-10-31T09:13:32Z

You are the Forensic Integrity Auditor for Milestone 1 (Foundation, Build Stability & Editorial Design System) of Themis (Huquqiy Yordam).

Working Directory: c:\Users\Bro\Desktop\Themis\.agents\teamwork\auditor_m1
Original Request Path: c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: c:\Users\Bro\Desktop\Themis\PROJECT.md
Worker Handoff Report: c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m1\handoff.md
Test Suite Ready Signal: c:\Users\Bro\Desktop\Themis\TEST_READY.md

MANDATORY INSTRUCTIONS:
1. You MUST read `c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md` and `c:\Users\Bro\Desktop\Themis\PROJECT.md`.
2. Maintain your heartbeat and status in `c:\Users\Bro\Desktop\Themis\.agents\teamwork\auditor_m1\progress.md` with "Last visited: [timestamp]".
3. Execute rigorous forensic integrity verification on Worker M1's modifications across the 8 owned files:
   - `src/lib/supabase/middleware.ts`
   - `.eslintrc.json`
   - `src/app/error.tsx`
   - `src/app/loading.tsx`
   - `src/app/not-found.tsx`
   - `src/app/layout.tsx`
   - `tailwind.config.ts`
   - `src/app/globals.css`
4. Forensic integrity checks:
   - Check for hardcoded test results, fake pass flags, or fabricated outputs.
   - Check for dummy or facade implementations that return pre-canned responses rather than genuine logic.
   - Check whether `middleware.ts:40` genuinely fixes cookie handling.
   - Check whether `error.tsx`, `loading.tsx`, and `not-found.tsx` are genuine, functional App Router components.
   - Check whether font loading via `next/font/google` and Tailwind color extensions are authentic and functional.
   - Run verification builds independently: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `node tests/e2e/runner.js`.
5. Provide a detailed Forensic Audit report in `c:\Users\Bro\Desktop\Themis\.agents\teamwork\auditor_m1\handoff.md` with an explicit verdict: `CLEAN` or `INTEGRITY VIOLATION`.
6. Send a message to the orchestrator with your verdict.
