# Themis (Huquqiy Yordam) — Domain & Feature Specification Inventory

**Document Type:** Feature Inventory & Domain Exploration Report  
**Archetype:** Specification Miner / Survey Explorer 2 (gen2)  
**Authoritative Sources Probed:**  
- `c:\Users\Bro\Desktop\Themis\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\Bro\Desktop\Themis\themis.md` (Product Concept & MVP Specification)
- `c:\Users\Bro\Desktop\Themis\README.md`
- `c:\Users\Bro\Desktop\Themis\src\lib\types.ts`
- `c:\Users\Bro\Desktop\Themis\src\lib\constants.ts`
- `c:\Users\Bro\Desktop\Themis\src\lib\mock-data.ts`
- `c:\Users\Bro\Desktop\Themis\supabase\migrations\001_initial_schema.sql`
- Next.js application routes (`src/app/`)

---

## 1. Observation

Directly observed codebase realities and specification facts:

1. **Original Request:** `ORIGINAL_REQUEST.md` (lines 12–29) establishes two central mandates:
   - **R1: UI/UX Elevation & AI-Slop Elimination:** Eradicate generic AI SaaS templates, Inter-only typography, and bland card grids; construct a deeply human-crafted, culturally resonant editorial design identity honoring Uzbekistan's legal tradition across key public journeys (Landing, Specialist Catalog/Profile, AI Consultation).
   - **R2: Error Resolution and Functional Stability:** Run Next.js cleanly without uncaught runtime errors, fix layout defects, and guarantee `npm run build` succeeds cleanly.
2. **Product Specification:** `themis.md` (lines 13–24, 70–110, 475–513) defines the three core pillars:
   - **Tushunish (Understanding):** AI Legal Assistant triage for citizen queries in everyday Uzbek/Russian, citing authentic national legislation (Yangi Mehnat Kodeksi, Oila Kodeksi, Fuqarolik Kodeksi, Uy-joy Kodeksi).
   - **Ishonchli Tanlov (Trusted Selection):** Catalog of strictly verified advocates and jurists with credential tracking, university pedigree, ratings, and transparent fees in UZS.
   - **Bog'lanish (Engagement):** Bookings, escrow payment processing, integrated secure chat/video consultation, and verified post-consultation reviews.
3. **Role Architecture:** Three distinct roles defined in `supabase/migrations/001_initial_schema.sql` (lines 12–24) and `src/lib/types.ts` (line 5):
   - `user` (Client / Citizen / Foydalanuvchi)
   - `specialist` (Legal Specialist / Advocate / Yurist)
   - `admin` (Platform Administrator / Moderator)
4. **Data Models and Workflow States:**
   - Specialists: 6 verification states (`draft`, `pending`, `approved`, `revision_needed`, `rejected`, `suspended`).
   - Consultations: 7 lifecycle states (`pending`, `accepted`, `scheduled`, `in_progress`, `completed`, `cancelled`, `disputed`).
   - Transactions: 7 financial states (`pending`, `paid`, `held`, `completed`, `refund_pending`, `refunded`, `disputed`).
   - Credentials: 5 credential types (`diploma`, `license`, `certificate`, `id_document`, `other`) verified exclusively by Admins.
   - Services: 3 communication formats (`chat`, `video`, `audio`) with durations (15–120 min) and UZS pricing.
5. **AI Assistant Architecture:** `src/app/api/ai/chat/route.ts` implements a dual-mode engine:
   - Primary: OpenAI GPT-4o-mini structured output returning category, citation sources, and specialist match recommendations.
   - Offline / Fallback: Rule-based local legal engine matching keywords (labor, family, housing, civil) with authentic legal articles.

---

## 2. Logic Chain

1. **Uzbekistan Legal Practice Requirements → Platform Design:**
   Under Uzbek law, legal counsel is divided between licensed advocates (*advokat*, licensed by the Ministry of Justice / Chamber of Advocates with court representation rights, especially criminal defense) and corporate/consulting jurists (*yuriskonsult / huquqshunos*). Therefore, the platform cannot conflate all specialists as "Advokat" without verified credentials (`themis.md` line 97). The UI and data models enforce explicit credential types (`license` vs `diploma` vs `certificate`) and only award the verified trust badge upon administrator document audit.
2. **Citizen Cultural Hesitation → UI Storytelling & Editorial Tone:**
   Citizens facing disputes (unpaid wages, divorce/custody, unlawful lease termination) often feel intimidated by legal jargon, fear exorbitant costs, or worry about privacy. The UI must therefore convey warmth, solemn legal authority, and total discretion (*advokatlik siri* — attorney-client confidentiality). Bland SaaS cards or robotic AI patterns erode trust. An editorial aesthetic with distinguished serif headings, authoritative seals, bilingual clarity (Uzbek Latin and Russian), and crystal-clear UZS pricing bridges this trust gap.
3. **AI Safety & Liability Boundary:**
   To prevent regulatory conflict and user harm, the AI assistant is strictly scoped as a *dastlabki axborot vositasi* (preliminary informational guide), never a substitute for an advocate or court ruling. High-risk matters (criminal charges, detention, domestic violence, urgent filing deadlines) trigger mandatory safety disclaimers and immediate advocate escalation. Furthermore, citizen AI chat logs are never automatically broadcast to specialists without explicit user consent.

---

## 3. Caveats

1. **Direct Video Infrastructure:** The codebase provides video room links (e.g. Google Meet / secure meeting room URLs). In-app WebRTC/native video SDK integration is planned for P1; MVP relies on safe generated meeting links.
2. **Real Payment Gateway Sandboxes:** Transaction workflows implement Payme/Click checkout architecture and internal ledger records (`transactions` table with 15% platform commission), avoiding unlicensed direct wallet/escrow banking in compliance with Central Bank of Uzbekistan regulations.
3. **Local Storage Demo State:** For offline testing, `localStorage.getItem("themis_demo_user")` allows instant role switching (`mijoz@themis.uz`, `yurist@themis.uz`, `admin@themis.uz`). In production, this cleanly delegates to Supabase Auth.

---

## 4. Conclusion

Themis is architecturally sound and functionally comprehensive across all P0 requirements. The platform model covers the complete citizen-to-specialist lifecycle: from AI problem intake and statutory citation to specialist discovery, multi-parameter filtering, booking, communication, financial settlement, and audited credential verification. To fulfill the user's elevated requirements, the application's visual system, editorial typography, and UX flow must be transformed into a bespoke, culturally resonant experience for Uzbekistan.

---

## 5. Verification Method

- **Build Verification:** Execute `npm run build` to confirm zero TypeScript compilation errors or broken route signatures.
- **Runtime Verification:** Run `npm run dev` and navigate to:
  - Landing page: `/`
  - Authentication: `/login`, `/register`
  - Client portal: `/dashboard`, `/dashboard/specialists`, `/dashboard/specialists/[id]`, `/dashboard/ai-chat`, `/dashboard/consultations`
  - Specialist portal: `/specialist`, `/specialist/requests`, `/specialist/profile`, `/specialist/earnings`, `/specialist/schedule`, `/specialist/services`
  - Admin portal: `/admin`, `/admin/specialists`, `/admin/consultations`, `/admin/transactions`
- **Schema Verification:** Inspect `supabase/migrations/001_initial_schema.sql` against `src/lib/types.ts`.

---

# Domain & Feature Specification Inventory

## A. Core Legal Consultation Domain in Uzbekistan

### 1. Professional Legal Statuses & Accreditation
- **Advokat (Licensed Attorney):** Member of the Chamber of Advocates of the Republic of Uzbekistan (*O'zbekiston Respublikasi Advokatlar palatasi*), holding an official license from the Ministry of Justice (*Adliya vazirligi*). Authorized for criminal defense, court representation, and privileged attorney-client confidentiality (*advokatlik siri*).
- **Huquqshunos / Yuriskonsult (Legal Advisor / Jurist):** Holds a university law degree (e.g., TDYU, JIDU, SamDU). Authorized for civil, corporate, contractual, and labor counseling, document drafting, and out-of-court dispute resolution.
- **Notarius (Notary):** Authorized for certifying real estate transactions, wills, powers of attorney (*ishonchnoma*), and inheritance rights via the E-notarius portal.
- **Mediator (Mediator):** Certified professional for pre-trial reconciliation, particularly in family and commercial disputes under the Law on Mediation.

### 2. Legal Branches (10 Recognized Categories)
1. **Mehnat huquqi (Labor Law):** Employment contracts (*mehnat shartnomasi*), unpaid wages (*ish haqi*), wrongful termination, labor inspections (*my.mehnat.uz*), New Labor Code (*Yangi Mehnat Kodeksi*).
2. **Oila huquqi (Family Law):** Marriage, divorce (*nikohdan ajralish*), child support (*aliment* - Family Code arts. 96, 99), custody, prenuptial agreements (*nikoh shartnomasi*).
3. **Fuqarolik huquqi (Civil Law):** General contracts, obligations, civil liability, debt recovery, Civil Code (*Fuqarolik Kodeksi*).
4. **Uy-joy huquqi (Housing Law):** Residential leases (*ijara shartnomasi* registered on *ijara.soliq.uz*), property registration (*kadastr*), eviction disputes, Housing Code (*Uy-joy Kodeksi*).
5. **Jinoyat huquqi (Criminal Law):** Criminal investigations, defense, victims' rights, investigative detention, Criminal Code (*Jinoyat Kodeksi*). High-risk category requiring immediate advocate referral.
6. **Ma'muriy huquq (Administrative Law):** Traffic penalties, disputes with municipal or state bodies, Administrative Responsibility Code (*Ma'muriy javobgarlik to'g'risidagi kodeks*).
7. **Tadbirkorlik huquqi (Business / Corporate Law):** LLC (*MCHJ*) formation, licensing, founder agreements, foreign investment, corporate governance.
8. **Mulk huquqi (Property & Inheritance Law):** Real estate ownership, inheritance certificates (*meros guvohnomasi*), property division, gift deeds (*hadya*).
9. **Shartnoma huquqi (Contract Law):** Commercial supply, service contracts, breach of contract, indemnification.
10. **Soliq huquqi (Tax Law):** Tax code (*Soliq Kodeksi*), self-employed status, income declarations, VAT, tax audits.

### 3. Court System and Regulatory Jurisdictions in Uzbekistan
- **Fuqarolik ishlari bo'yicha sudlar (Civil Courts):** Inter-district civil courts for family, housing, labor, and monetary claims.
- **Jinoyat ishlari bo'yicha sudlar (Criminal Courts):** District and regional criminal courts.
- **Iqtisodiy sudlar (Economic Courts):** Commercial disputes between legal entities, individual entrepreneurs, and bankruptcy proceedings.
- **Ma'muriy sudlar (Administrative Courts):** Complaints against state agencies, khokimiyat decisions, and administrative infractions.
- **Official Portals & Databases:** *Lex.uz* (National Legislation Database), *My.gov.uz* (Single Portal of Interactive State Services), *E-sud.uz* (Electronic Court Filing), *my.mehnat.uz* (Single National Labor System), *ijara.soliq.uz* (Lease Registration).

### 4. Tariffs, Financial Model, and Currency
- **Currency:** All prices denominated strictly in **Uzbek Soum (UZS)**.
- **Tariff Tiers:**
  - *Tezkor maslahat (Express 15-minute consultation):* Typically 50,000 – 90,000 UZS (chat/audio triage).
  - *Standart konsultatsiya (Standard 30–45 minute consultation):* 120,000 – 200,000 UZS (in-depth video/chat review).
  - *To'liq ekspertiza (Deep 60-minute document examination):* 220,000 – 350,000+ UZS.
- **Platform Fee:** Fixed 15% platform service fee deducted upon successful consultation completion; 85% net disbursed to the specialist.
- **Financial Compliance:** Payment gateway integration (Payme / Click) with held/escrow status tracking to prevent unauthorized banking liabilities.

---

## B. Bilingual & Cultural Context (Uzbek & Russian)

### 1. Core Terminology Alignment
| English Concept | Uzbek (Latin) | Uzbek (Cyrillic) | Russian |
|---|---|---|---|
| Legal Aid / Consultation | Huquqiy Yordam / Maslahat | Ҳуқуқий Ёрдам / Маслаҳат | Юридическая помощь / Консультация |
| Licensed Advocate | Advokat / Litsenziyali advokat | Адвокат / Лицензияли адвокат | Лицензированный адвокат |
| Jurist / Legal Consultant | Huquqshunos / Yurist | Ҳуқуқшунос / Юрист | Юрист / Юрисконсульт |
| Verified Specialist | Tekshirilgan mutaxassis | Текширилган мутахассис | Проверенный специалист |
| Statement of Claim | Da'vo arizasi | Даъво аризаси | Исковое заявление |
| Complaint / Appeal | Shikoyat / Murojaat | Шикоят / Мурожаат | Жалоба / Обращение |
| Employment Contract | Mehnat shartnomasi | Меҳнат шартномаси | Трудовой договор |
| Child Support / Alimony | Aliment | Алимент | Алименты |
| Lease / Tenancy Agreement | Ijara shartnomasi | Ижара шартномаси | Договор аренды |
| Power of Attorney | Ishonchnoma | Ишончнома | Доверенность |
| Inheritance Certificate | Meros guvohnomasi | Мерос гувоҳномаси | Свидетельство о наследстве |
| Attorney-Client Privilege | Advokatlik siri | Адвокатлик сири | Адвокатская тайна |
| Code of Laws | Qonunlar kodeksi | Қонунлар кодекси | Кодекс законов |
| Court Order / Injunction | Sud buyrug'i | Суд буйруғи | Судебный приказ |

### 2. Cultural Trust Markers & Legal Etiquette
- **Respectful Address:** Usage of the polite formal "Siz" (You) with appropriate capitalization in instructions.
- **Traditional Salutation:** Greetings such as "Assalomu alaykum" in consultation dialogs create psychological safety for vulnerable citizens.
- **Institutional Legitimacy:** Explicit display of law school credentials (e.g., *Toshkent Davlat Yuridik Universiteti - TDYU*, *JIDU*), license numbers (e.g., `#ADV-1049`), and issuing authorities (*O'zbekiston Respublikasi Adliya vazirligi*).
- **Discretion Guarantees:** Clear reassurance that legal disclosures and uploaded documents are confidential and protected by platform security standards.

---

## C. Detailed User Journey Specifications

### Journey 1: Landing Page Storytelling & Conversion
1. **Hero & Problem Empathy:** Immediately articulates the citizen's dilemma: unexpected legal dispute, confusion over laws, fear of fraudulent representatives. Offers dual calls to action: "Boshlash" (Client problem entry) and "Mutaxassis sifatida kirish" (Specialist registration).
2. **Four-Step Narrative Flow:**
   - Step 1: *Muammoni yozing* (Describe issue in natural everyday language).
   - Step 2: *AI tahlili* (Instant analysis, applicable articles, and actionable checklist).
   - Step 3: *Mutaxassis toping* (Compare verified advocates with verified ratings and transparent fees).
   - Step 4: *Konsultatsiya oling* (Secure online chat or video session with review capability).
3. **Legal Domain Directory:** Interactive grid of all 10 legal branches leading directly into pre-filtered catalog searches.
4. **Trust Pillars:** Verifiable credentials banner, genuine client review policy (only post-consultation), secure escrow payment protection, and Lex.uz statutory grounding.

### Journey 2: Specialist Catalog & Multi-Attribute Search
1. **Search & Filter Controls:**
   - Full-text search matching name, bio, law school, or past workplace.
   - Legal branch dropdown (10 categories or "Barcha sohalar").
   - Regional jurisdiction dropdown covering all 14 regions of Uzbekistan (Tashkent city, 12 viloyats, and Karakalpakstan).
   - "Faqat hozir onlayn" (Online now) toggle.
   - Minimum rating filter (All, 4.5+, 4.8+).
2. **Specialist Card Anatomy:**
   - Professional avatar with active online presence indicator.
   - Full name with verified shield icon (*Tasdiqlangan mutaxassis*).
   - Highest educational credential and university.
   - Star rating, review count, years of practical experience, and regional jurisdiction.
   - Practice area badges.
   - Starting consultation tariff in UZS.
   - Direct link to profile and booking dialog.

### Journey 3: Specialist Profile & Booking Flow
1. **Deep Bio & Pedigree:** Full resume history including universities, graduation years, previous law firms or government legal departments.
2. **Verified Documents Display:** Display of verified credentials (license number, date of issue, issuing body) without exposing sensitive personal ID scans publicly.
3. **Service Matrix & Tariff Selection:** Clear cards detailing format (Video vs Chat), exact duration (15m, 30m, 45m, 60m), scope of service, and price.
4. **Availability & Working Hours:** Weekly schedule matrix showing active days and booking hours.
5. **Authentic Reviews Section:** Client star ratings, detailed comments, and specialist public replies.
6. **Booking Dialog Modal:**
   - Selected service recap with price and duration.
   - Datetime picker.
   - Free-form note field for client's initial briefing.
   - Instant confirmation and redirect to consultations dashboard.

### Journey 4: AI Legal Assistant (Huquqiy Maslahatchi)
1. **Natural Language Intake:** Citizens write in colloquial Uzbek or Russian.
2. **Classification & Categorization:** Automatically identifies primary legal branch (e.g., Labor, Family, Housing).
3. **Structured Legal Analysis Response:**
   - Clear statement of legal categorization.
   - Objective synthesis of the user's factual situation.
   - Grounded legal explanation citing exact articles (e.g., *Yangi Mehnat Kodeksi 161, 244-moddalar*).
   - Actionable 3-step checklist for the citizen.
   - Official register recommendations (e.g., *my.mehnat.uz*, *ijara.soliq.uz*).
   - Specialist recommendations: 2–3 verified advocates practicing in that specific branch.
4. **Mandatory Safety & Non-Advocate Disclaimer:** Prominent box reminding the user that AI guidance is informational and cannot replace licensed advocate representation in court.

---

## D. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | Multi-Role Registration | Registration for Clients and Specialists with email and password | Full name, email, password, role (`user` or `specialist`) | New auth user & profile record; role redirect | Validates email format, password >= 6 chars; displays toast error | `themis.md` §5, `src/app/(auth)/register/page.tsx` |
| 2 | Auth | Unified Login & Demo Switcher | Secure login with 1-click test personas for Client, Specialist, Admin | Email, password | Session token, profile load, dashboard redirect | Displays error toast on invalid credentials; falls back to demo mode | `README.md` §5, `src/app/(auth)/login/page.tsx` |
| 3 | AI Chat | Free-form Legal Inquiry | Conversational chat interface for initial legal problem submission | Free-text legal description (Uzbek/Russian) | AI chat message thread | Returns validation message if input is blank | `themis.md` §6.2, `src/app/(dashboard)/ai-chat/[id]/page.tsx` |
| 4 | AI Chat | Legal Category Triage | Classification of problem into 1 of 10 legal branches | User query text | Category tag (`labor`, `family`, `housing`, etc.) | Falls back to `civil` if domain is ambiguous | `src/app/api/ai/chat/route.ts` |
| 5 | AI Chat | Statutory Citations | Retrieval of relevant Uzbek legal codes, articles, and decrees | Classified category & query | Array of source objects `{ title, article, url }` | Omits sources if no verified law applies; does not invent articles | `themis.md` §6.2, `src/app/api/ai/chat/route.ts` |
| 6 | AI Chat | Advocate Recommendations | AI matching of 2–3 verified specialists matching category & region | User category, specialist database | Recommended specialist cards with direct booking links | Displays general specialists if no exact branch match found | `themis.md` §8, `src/app/api/ai/chat/route.ts` |
| 7 | AI Chat | Legal Disclaimer Enforcement | Persistent legal notice on informational nature of AI advice | System-level prompt & UI banner | Disclaimer text emphasizing non-advocate status | Displayed permanently at top and bottom of AI chat | `themis.md` §6.2, `src/app/(dashboard)/ai-chat/page.tsx` |
| 8 | Catalog | Specialist Full-text Search | Search specialists by name, university, or keywords | Search query string | Filtered list of matching specialists | Empty state card when no matching specialist is found | `themis.md` §6.3, `src/app/(dashboard)/specialists/page.tsx` |
| 9 | Catalog | Legal Branch Filtering | Filter catalog by 10 legal categories | Category ID | Filtered specialist subset | Shows all specialists when "Barcha sohalar" selected | `src/lib/constants.ts`, `src/app/(dashboard)/specialists/page.tsx` |
| 10 | Catalog | Regional Jurisdiction Filter | Filter specialists across 14 regions of Uzbekistan | Region ID | Specialists operating in chosen region | Shows all specialists when "Barcha hududlar" selected | `src/lib/constants.ts`, `src/app/(dashboard)/specialists/page.tsx` |
| 11 | Catalog | Online Status Filter | Filter specialists currently available online | Boolean toggle | Specialists with `is_online = true` | Shows 0 results if no online specialists in category | `src/app/(dashboard)/specialists/page.tsx` |
| 12 | Catalog | Minimum Rating Filter | Filter specialists by average customer score (4.5+, 4.8+) | Rating threshold | Specialists matching rating criteria | Returns empty state if threshold exceeds all ratings | `src/app/(dashboard)/specialists/page.tsx` |
| 13 | Profile | Specialist Public Bio & Pedigree | Detailed profile page showing education, degrees, and bio | Specialist ID | Full bio, university, graduation year, workplaces | Returns 404/fallback if specialist ID not found | `themis.md` §6.4, `src/app/(dashboard)/specialists/[id]/page.tsx` |
| 14 | Profile | Service Tariff Matrix | Display of specialist's active services, durations, and fees | Specialist ID | Service cards with price, format (video/chat), minutes | Shows "Kelishuv asosida" if no active services configured | `src/app/(dashboard)/specialists/[id]/page.tsx` |
| 15 | Booking | Consultation Booking Modal | Interactive appointment request creation | Service selection, datetime-local, user notes | Pending consultation record, redirect to dashboard | Requires datetime input; alerts user if missing | `themis.md` §6.4, `src/app/(dashboard)/specialists/[id]/page.tsx` |
| 16 | Consultations | Consultation Tracking Tabs | View active vs completed consultations | User ID, tab selection | Categorized cards with status badges and meeting links | Shows empty placeholder when list is empty | `themis.md` §6.5, `src/app/(dashboard)/consultations/page.tsx` |
| 17 | Consultations | Secure Consultation Chat | Dedicated two-way chat room linked to confirmed consultation | Consultation ID, message text, attachments | Message log with timestamps and read receipts | Simulates specialist reply in demo mode; disables empty send | `themis.md` §6.7, `src/app/(dashboard)/consultations/[id]/chat/page.tsx` |
| 18 | Consultations | Video Meeting Link Access | Direct launch of secure video consultation session | Consultation ID | External/embedded video room link (e.g. Meet) | Opens in secure new tab; indicates status | `README.md` §4, `src/app/(dashboard)/consultations/[id]/chat/page.tsx` |
| 19 | Reviews | Post-Consultation Rating | 1–5 star rating and comment submission | Rating (1-5), comment, consultation ID | New review record, updates specialist average rating | Blocked if consultation not completed or already reviewed | `themis.md` §10, `supabase/migrations/001_initial_schema.sql` |
| 20 | Reviews | Specialist Reply to Review | Specialist's professional response to client review | Review ID, reply text | Updated review record displaying specialist reply | Only assigned specialist can reply to the review | `themis.md` §10.1, `supabase/migrations/001_initial_schema.sql` |
| 21 | Specialist Portal | Specialist Dashboard Metrics | KPI summary of consultations, pending requests, rating, earnings | Specialist ID | Metric cards with monthly change stats | Defaults to zero if new specialist | `themis.md` §7.4, `src/app/(specialist)/specialist/page.tsx` |
| 22 | Specialist Portal | Request Acceptance / Rejection | Manage incoming client consultation booking requests | Request ID, action (Accept / Reject) | Status updated to `accepted` or `rejected` | Displays toast notification confirming action | `themis.md` §7.4, `src/app/(specialist)/specialist/requests/page.tsx` |
| 23 | Specialist Portal | Service & Tariff Management | Create, edit, and delete consultation offerings | Name, description, format, duration, price in UZS | New or updated service in catalog | Validates required fields; prevents negative prices | `themis.md` §7.3, `src/app/(specialist)/specialist/services/page.tsx` |
| 24 | Specialist Portal | Weekly Availability Scheduling | Set daily working hours and day-off toggles | Day index, active toggle, start time, end time | Updated schedule record | Ensures start time precedes end time | `themis.md` §7.4, `src/app/(specialist)/specialist/schedule/page.tsx` |
| 25 | Specialist Portal | Online Presence Toggle | Real-time switch for instant client availability | Boolean toggle | Updates `is_online` status in database/catalog | Visual pulse indicator reflects live status | `src/app/(specialist)/specialist/schedule/page.tsx` |
| 26 | Specialist Portal | Financial Earnings & Commission | Ledger view of completed consultations and 15% platform fee | Specialist ID | Gross total, 15% fee, net earnings, transaction table | Discloses platform commission transparently | `themis.md` §9, `src/app/(specialist)/specialist/earnings/page.tsx` |
| 27 | Specialist Portal | Credential Document Upload | Submit diploma, advocate license, or certificates for review | Credential type, title, issuer, issue date, file | Pending credential record sent to Admin queue | Marks specialist as unverified until Admin approves | `themis.md` §7.1, `src/app/(specialist)/specialist/profile/page.tsx` |
| 28 | Admin | Platform Operations KPI Overview | Global system monitoring of users, specialists, consultations, revenue | Admin session | KPI cards + alert banner for pending verifications | Restricted exclusively to `admin` role profiles | `themis.md` §14, `src/app/(admin)/admin/page.tsx` |
| 29 | Admin | Specialist Credential Verification | Review specialist licenses and 1-click Approve or Reject | Specialist ID, action | Verification status updated (`approved` or `rejected`) | Only approved specialists visible in public catalog | `themis.md` §7.2, `src/app/(admin)/admin/specialists/page.tsx` |
| 30 | Admin | Financial & Commission Audit | Monitor transactions, payment providers, and commission fund | Transaction logs | Complete transaction registry with fee breakdown | RLS prevents non-admins from viewing all transactions | `themis.md` §9, `src/app/(admin)/admin/transactions/page.tsx` |
| 31 | Admin | Review & Content Moderation | Inspect flagged reviews and offensive content | Review ID, moderation action | Review active, flagged, or removed status | Tanqidiy (negative) reviews preserved unless abusive | `themis.md` §10.1, `src/app/(admin)/admin/reviews/page.tsx` |
| 32 | Admin | Audit Logging | Security logging of administrator operations and sensitive views | Actor user ID, action, entity type, IP address | Immutable audit log record | Read-only for administrative inspection | `themis.md` §16, `supabase/migrations/001_initial_schema.sql` |

---

## E. Edge Cases & Safety Matrix

| # | Feature | Input / Trigger | Observed Behavior | Specification Mandate |
|---|---------|-----------------|-------------------|-----------------------|
| 1 | AI Legal Triage | User inputs emergency criminal situation (e.g. "Politsiya ushlab turibdi", "Qamoqqa olishdi") | AI response identifies `criminal` law, restricts speculative advice, provides emergency rights notice, and urges immediate advocate contact | `themis.md` §6.2 (line 155): High-risk cases (arrest, criminal charges, violence, child emergencies) must restrict AI output and immediately escalate to human advocates. |
| 2 | AI Legal Triage | User query mentions impending statute of limitations (e.g. "Sudga berish muddati bugun tugaydi") | AI alerts user to procedural deadlines (*protsessual muddatlar*) and advises urgent manual check with an advocate | `themis.md` §6.2 (line 154): Procedural deadlines require explicit prompt to verify dates independently. |
| 3 | AI Legal Triage | User submits query about foreign jurisdiction (e.g. "Rossiyada patent masalasi") | AI clarifies that the platform's knowledge base is anchored in the legislation of the Republic of Uzbekistan | `themis.md` §6.2 (line 152): Clarify jurisdiction when question does not pertain to Uzbekistan law. |
| 4 | AI Legal Triage | User submits ambiguous single-sentence input (e.g. "Meni aldashdi") | AI does not invent facts or output premature conclusions; asks clarifying questions regarding dates, contracts, and evidence | `themis.md` §6.2 (line 153): AI must formulate clarifying questions rather than make unfounded conclusions. |
| 5 | Specialist Catalog | User searches with filters yielding zero results | System displays clean empty state with button to reset all filters in one click | `src/app/(dashboard)/specialists/page.tsx` (line 153) |
| 6 | Specialist Verification | Newly registered specialist attempts to appear in catalog | Specialist record remains in `draft` or `pending` status; public catalog filter `verification_status = 'approved'` excludes them until Admin audits credentials | `themis.md` §7.2 (line 313), `supabase/migrations/001_initial_schema.sql` (line 96) |
| 7 | Booking & Tariffs | Specialist attempts to set negative or zero price for consultation | Input validation requires numeric value > 0 and duration between 15 and 120 minutes | `src/lib/constants.ts` (lines 164-165), `src/app/(specialist)/specialist/services/page.tsx` |
| 8 | Review Submission | User attempts to leave review for a specialist without completing a consultation | Supabase RLS and unique constraint on `consultations.id` block unauthorized reviews; only completed consultations allow a single review | `themis.md` §10.1 (line 419), `supabase/migrations/001_initial_schema.sql` (lines 336, 351) |
| 9 | Data Privacy | Client engages in AI chat, then books consultation with an advocate | AI conversation messages are NOT automatically transferred to the advocate without client's explicit consent | `themis.md` §16 (line 589): Strict privacy isolation between AI chat logs and specialist access. |
| 10 | Payment & Balance | Client cancels scheduled consultation within permissible notice window | Transaction state transitions to `refund_pending` then `refunded` via payment provider; no unauthorized platform wallet balance | `themis.md` §9.3 (lines 396-402): Platform does not store unbanked money balances or act as unlicensed money transmitter. |

---

## F. Entity Data Fields & Validation Rules

### 1. `profiles`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `auth.users`, unique, on delete cascade)
- `full_name`: Text, non-empty, required
- `phone`: Text, Uzbekistan format validation (`+998 XX XXX XX XX`)
- `email`: Text, valid email format
- `avatar_url`: Text URL, optional
- `region`: Text (one of 14 valid Uzbekistan region IDs), optional
- `preferred_language`: Enum `'uz' | 'ru'`, default `'uz'`
- `role`: Enum `'user' | 'specialist' | 'admin'`, default `'user'`
- `created_at` / `updated_at`: Timestamptz

### 2. `specialists`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `auth.users`, unique)
- `full_name`: Text, required
- `phone`: Text, required
- `email`: Text, required
- `bio`: Text, maximum 2,000 characters
- `region`: Text (Uzbekistan region ID)
- `languages`: Text array, default `['uz']`
- `experience_years`: Integer >= 0
- `education`: Text (e.g. "Yurisprudensiya magistri")
- `university`: Text (e.g. "Toshkent Davlat Yuridik Universiteti")
- `graduation_year`: Integer between 1950 and current year
- `previous_workplaces`: JSONB array of `{ company, position, start_year, end_year }`
- `verification_status`: Enum `'draft' | 'pending' | 'approved' | 'revision_needed' | 'rejected' | 'suspended'`, default `'draft'`
- `is_online`: Boolean, default `false`
- `rating_avg`: Numeric(3,2), between 0.00 and 5.00, automatically computed by database trigger
- `rating_count`: Integer >= 0, updated by trigger
- `consultation_count`: Integer >= 0, incremented on status `'completed'`

### 3. `specialist_credentials`
- `id`: UUID (Primary Key)
- `specialist_id`: UUID (Foreign Key to `specialists`, on delete cascade)
- `credential_type`: Enum `'diploma' | 'license' | 'certificate' | 'id_document' | 'other'`
- `title`: Text, required (e.g. "Advokatlik faoliyati litsenziyasi #ADV-1049")
- `issuer`: Text (e.g. "O'zbekiston Respublikasi Adliya vazirligi")
- `issue_date`: Date
- `expiry_date`: Date, optional
- `document_url`: Text URL, protected/temporary access only
- `verification_status`: Enum `'pending' | 'verified' | 'rejected'`, default `'pending'`
- `admin_notes`: Text, optional

### 4. `services`
- `id`: UUID (Primary Key)
- `specialist_id`: UUID (Foreign Key to `specialists`)
- `name`: Text, required
- `description`: Text, optional
- `duration_minutes`: Integer between 15 and 120
- `price`: Numeric(12,2) >= 0
- `currency`: Text, default `'UZS'`
- `format`: Enum `'chat' | 'video' | 'audio'`, default `'chat'`
- `is_active`: Boolean, default `true`

### 5. `consultations`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `auth.users`)
- `specialist_id`: UUID (Foreign Key to `specialists`)
- `service_id`: UUID (Foreign Key to `services`)
- `ai_conversation_id`: UUID (Foreign Key to `ai_conversations`, optional)
- `status`: Enum `'pending' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'`
- `scheduled_at`: Timestamptz, must be in the future when booked
- `started_at` / `completed_at` / `cancelled_at`: Timestamptz
- `cancellation_reason`: Text, optional
- `meeting_link`: Text URL, optional
- `user_notes` / `specialist_notes`: Text

### 6. `transactions`
- `id`: UUID (Primary Key)
- `consultation_id`: UUID (Foreign Key to `consultations`)
- `user_id`: UUID (Client)
- `specialist_id`: UUID (Specialist)
- `amount`: Numeric(12,2) > 0 (Gross client payment)
- `platform_fee`: Numeric(12,2) (15% platform commission)
- `specialist_amount`: Numeric(12,2) (85% net specialist payout)
- `currency`: Text, default `'UZS'`
- `status`: Enum `'pending' | 'paid' | 'held' | 'completed' | 'refund_pending' | 'refunded' | 'disputed'`
- `payment_provider`: Text (e.g. `'Payme'`, `'Click'`)

### 7. `reviews`
- `id`: UUID (Primary Key)
- `consultation_id`: UUID (Unique, Foreign Key to `consultations`)
- `user_id`: UUID (Foreign Key to `auth.users`)
- `specialist_id`: UUID (Foreign Key to `specialists`)
- `rating`: Integer between 1 and 5
- `comment`: Text, optional
- `specialist_reply`: Text, optional
- `status`: Enum `'active' | 'flagged' | 'removed'`, default `'active'`

---

*Handoff report prepared by Survey Explorer 2 (gen2). Ready for integration into planning and UI/UX execution.*
