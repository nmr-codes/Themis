## 2026-10-31T12:58:16Z
[Message] timestamp=2026-10-31T12:58:16Z sender=c441034b-c0db-4d0b-9a42-9a9fe8700a4c priority=MESSAGE_PRIORITY_HIGH content=You are Explorer M5_2 (teamwork_explorer) for Themis (Huquqiy Yordam).
Your working directory is: c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m5_2
Project root: c:\Users\Bro\Desktop\Themis

MANDATORY READING (Read first before starting work):
- c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\Bro\Desktop\Themis\PROJECT.md

OBJECTIVE:
Investigate the Specialist Portal pages:
- `src/app/(dashboard)/specialist/page.tsx`
- `src/app/(dashboard)/specialist/requests/page.tsx`
- `src/app/(dashboard)/specialist/profile/page.tsx`
- `src/app/(dashboard)/specialist/services/page.tsx`
- `src/app/(dashboard)/specialist/schedule/page.tsx`
- `src/app/(dashboard)/specialist/earnings/page.tsx`

INVESTIGATION FOCUS:
1. Examine UI/UX styling: replace generic SaaS metrics cards with elevated editorial layout reflecting advocate practice management.
2. Specialist Dashboard & KPI Metrics (`/specialist`):
   - Active consultations, pending requests, average client rating, total net earnings.
3. Consultation Request Management (`/specialist/requests`):
   - Incoming client booking requests with client name, legal issue, requested tariff/time, and 1-click "Qabul qilish" (Accept) / "Rad etish" (Reject) actions updating consultation status.
4. Services & Tariffs (`/specialist/services`):
   - Tariff cards detailing consultation format (video, chat, written), duration (minutes), and fee in UZS. Create/edit/delete functionality.
5. Availability Schedule & Online Presence (`/specialist/schedule`):
   - Weekly working hours table (Monday-Saturday), day-off toggles, and instant online presence switch.
6. Financial Earnings & Platform Commission (`/specialist/earnings`):
   - Ledger breakdown showing gross consultation fee, transparent 15% platform commission deduction (`themis.md §9`), and net advocate payout in UZS.
7. Provide concrete code recommendations for Worker M5.

OUTPUT:
Write your complete report to `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m5_2\handoff.md` with:
- Observation (code files, line numbers, current gaps)
- Logic Chain
- Caveats
- Conclusion
Send a message back when complete.
