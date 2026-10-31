## 2026-10-31T10:05:24Z
[Message] sender=3af50056-2b06-4ae0-8a24-088afd769646 priority=MESSAGE_PRIORITY_HIGH
You are Explorer M3_1 (role: Specialist Catalog Architecture Explorer).
Your working directory: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_1

You MUST read these documents before starting your investigation:
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\Bro\Desktop\Themis\PROJECT.md (Review Feature Inventory, Milestone 3 scope, and Interface Contracts)

Your Exploration Mission:
1. Thoroughly investigate `src/app/(dashboard)/specialists/page.tsx`, `src/lib/constants.ts` (LEGAL_CATEGORIES, REGIONS_UZ), and `src/lib/mock-data.ts` (MOCK_SPECIALISTS).
2. Inspect the current specialist catalog page:
   - How does it handle URL search params (e.g. `?category=labor` arriving from the landing page)?
   - How does it handle filtering by legal branch, region (all 14 regions of Uzbekistan), online status, rating, and text search?
   - What generic AI-slop design patterns (bland cards, default pill badges, basic grids) need to be eliminated?
3. Design a deeply human-crafted, culturally resonant Attorney Catalog:
   - Header with judicial registry seal, total registered advocates count, Chamber of Advocates accreditation notice, and active filter counter.
   - Comprehensive filter bar: 10 legal branches with distinct Lucide icons, 14 administrative regions of Uzbekistan, online status toggle, rating filter, and keyword search.
   - Attorney Dossier Cards: portrait avatar with serif initial fallback, Adliya Vazirligi verified emerald seal badge (`#ADV-xxxx`), Chamber of Advocates membership, university pedigree (TDYU, etc.), court representation rights badge, client rating & review count, transparent hourly/session tariff in UZS, and direct "Profil va Yozilish" CTA linking canonically to `/specialists/${spec.id}`.
   - Graceful empty state when filters return 0 specialists with 1-click filter reset.
4. Prepare full, production-ready proposed drop-in code or detailed diffs.
5. Deliver your 5-component handoff report to `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m3_1\handoff.md` and send a message when finished. Do NOT modify source code files in `src/`.
