## 2026-10-31T11:54:18Z
You are Worker M3 Remediation (teamwork_worker) for Themis (Huquqiy Yordam).
Your working directory is: c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m3_rem
Project root: c:\Users\Bro\Desktop\Themis

MANDATORY READING:
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\Bro\Desktop\Themis\PROJECT.md
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\challenger_m3_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OWNED FILES:
You have exclusive write access to:
- c:\Users\Bro\Desktop\Themis\src\app\(dashboard)\specialists\page.tsx
- c:\Users\Bro\Desktop\Themis\src\lib\mock-data.ts

OBJECTIVE:
Remediate the 3 specific functional defects reported by Challenger M3_1:

1. BUG-M3-01: Full-Text Search Fails for University Acronym "TDYU"
- In `src/lib/mock-data.ts:17` and `src/lib/mock-data.ts:159`, update `university`:
  Include "(TDYU)" alongside "Toshkent Davlat Yuridik Universiteti" (e.g. `university: "Toshkent Davlat Yuridik Universiteti (TDYU)"`).
- In `src/app/(dashboard)/specialists/page.tsx:218`, enhance university matching logic so that searching "tdyu" or "jidu" accurately matches both the acronym and full university name regardless of query casing/punctuation.

2. BUG-M3-02: Misleading Category Badge Text
- In `src/app/(dashboard)/specialists/page.tsx:464`, replace `"Mutaxassis mavjud"` when `count === 0` with `"Hozircha bo'sh"` (or `"0 nafar advokat"`).
- Ensure mock data or UI accurately reflects counts without misleading citizens.

3. BUG-M3-03: Bi-Directional URL Parameter Removal Fails to Reset Filters (Stale Filter Trap)
- In `src/app/(dashboard)/specialists/page.tsx:100-120`, fix the `useEffect` hooks for URL sync (`categoryParam`, `regionParam`, `searchParam`, `onlineParam`, `ratingParam`).
- When a parameter transitions to null/empty (e.g., via browser back button or popstate), the filter state MUST cleanly reset to default (`"all"`, `""`, `false`) rather than remaining stuck on the previous filtered value.

VERIFICATION COMMANDS:
You must run all of the following commands in powershell from the project root and document their verbatim output in your handoff report:
1. `node tests/e2e/runner.js`
2. `node tests/challenger_m3_empirical_suite.mjs`
3. `npx tsc --noEmit`
4. `npm run lint`
5. `npm run build`

OUTPUT:
Write your complete handoff report to `c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m3_rem\handoff.md` with sections: Observation, Logic Chain, Caveats, Conclusion, Verification Method. Include exact command outputs.
Send a message back when complete.
