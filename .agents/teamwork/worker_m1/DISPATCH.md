## 2026-10-31T09:06:43Z
[Message] timestamp=2026-10-31T09:06:43Z sender=3af50056-2b06-4ae0-8a24-088afd769646 priority=MESSAGE_PRIORITY_HIGH content=You are Worker M1 for Milestone 1 (Foundation, Build Stability & Editorial Design System) of Themis (Huquqiy Yordam).

Working Directory: c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m1
Original Request Path: c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: c:\Users\Bro\Desktop\Themis\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You exclusively own and may edit or create these files:
- `src/lib/supabase/middleware.ts`
- `.eslintrc.json`
- `src/app/error.tsx`
- `src/app/loading.tsx`
- `src/app/not-found.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `tailwind.config.ts`
Do NOT write to files outside this list.

INPUT FINDINGS & BLUEPRINTS:
Read the comprehensive findings and drop-in code prepared by the Explorers:
- `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m1_1\handoff.md` (Build stability, middleware fix, ESLint config)
- `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m1_2\handoff.md` (App Router error.tsx, loading.tsx, not-found.tsx, layout metadata/viewport)
- `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m1_3\handoff.md` (Typography with next/font/google, Tailwind config, globals.css Warm Uzbek Heritage palette and shared classes)
- Also check `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m1_3\` for `proposed_layout.tsx`, `proposed_tailwind.config.ts`, `proposed_globals.css`.

TASKS TO EXECUTE:
1. Fix `src/lib/supabase/middleware.ts`:
   - Line 40: Set explicit `value: ""` in `response.cookies.set({ name, value: "", ...options })`.
   - Lines 16-17: Add `"placeholder"` check to graceful fallback condition.
   - Lines 52-59: Update `isPublicPage` to include `pathname.startsWith("/specialists")` and `pathname.startsWith("/api")`.
2. Create `.eslintrc.json` in the project root: `{"extends": "next/core-web-vitals"}` so `npm run lint` executes non-interactively.
3. Create App Router boundary files in `src/app`:
   - `src/app/error.tsx`: Root error boundary with bilingual assurance, status 500, digest code, reset button, and Adliya support helpline.
   - `src/app/loading.tsx`: Editorial loading skeleton with dual-layer judicial seal spinner, Lex.uz sync indicator, and parchment card skeletons.
   - `src/app/not-found.tsx`: Bespoke 404 page with Amir Temur quote ("Kuch adolatdadir"), "BEKOR QILINGAN" seal, and canonical links to `/`, `/specialists`, `/ai-chat`.
4. Update `src/app/layout.tsx`:
   - Load `Playfair_Display`, `Plus_Jakarta_Sans`, and `Cinzel` via `next/font/google` with Latin and Cyrillic/cyrillic-ext subsets; expose `--font-serif`, `--font-sans`, `--font-cinzel`.
   - Export typed `viewport: Viewport` with theme colors `#FAF7F0` / `#081021`.
   - Export enriched `metadata: Metadata` with title template and legal keywords.
   - Configure Sonner Toaster with elevated styling.
5. Update `tailwind.config.ts`:
   - Map `fontFamily`: `serif: ["var(--font-serif)", "Georgia", "serif"]`, `sans: ["var(--font-sans)", "system-ui", "sans-serif"]`, `display: ["var(--font-display)", "var(--font-cinzel)", "var(--font-serif)", "serif"]`.
   - Add Warm Uzbek Heritage color ramps: `samarkand` (#0D47A1), `bukhara` (#B84A2A), `emerald.seal` (#166534), `gold.crest` (#C59B27), `parchment` (#FAF8F5), `obsidian` (#0B132B).
6. Update `src/app/globals.css`:
   - Define exact HSL tokens for background, foreground, primary, accent, card, border, and dark mode.
   - Define shared editorial utility classes: `.legal-seal`, `.judicial-crest`, `.statute-border`, `.parchment-card`, `.paper-card`, `.legal-memorandum`, `.lex-citation`, `.bg-court-mesh`.
7. BUILD & VERIFICATION:
   - Run `npx tsc --noEmit` — verify 0 errors.
   - Run `npm run lint` — verify it passes non-interactively.
   - Run `npm run build` — verify Next.js production build succeeds cleanly and generates all routes!
8. Document all commands, verbatim outputs, and results in `c:\Users\Bro\Desktop\Themis\.agents\teamwork\worker_m1\handoff.md`.
9. Send a completion message to the orchestrator.
