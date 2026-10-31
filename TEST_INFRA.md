# TEST_INFRA.md — Test Infrastructure & Methodology Specification
# Platform: Themis (Huquqiy Yordam) — Legal Consultation Platform for Uzbekistan

---

## 1. System Overview & Testing Philosophy

Themis (Huquqiy Yordam) is a mission-critical legal consultation platform connecting citizens of Uzbekistan with verified advocates (*advokatlar*), legal advisors (*huquqshunoslar*), and an AI-assisted statutory triage engine grounded in national legislation (*Lex.uz*).

Due to the sensitive legal, financial, and regulatory nature of the platform:
- **Opaque-Box Testing**: All E2E tests interact with system boundaries (HTTP API endpoints, client state machines, navigation contracts, and data fixtures) without testing private implementation details.
- **Zero Facade Tests**: Every test assertion validates authentic business invariants, status codes, payload structures, statutory citations, mathematical commission splits, and state persistence.
- **Progressive Testability & Independence**: Each test case sets up its own isolated state, avoids inter-test coupling, and runs idempotently across environments.
- **Authoritative Expected Output Derivation**: Expected outputs are derived strictly from user requirements, Uzbekistan legal codes (Mehnat Kodeksi, Oila Kodeksi, Fuqarolik Kodeksi, Uy-joy Kodeksi), and interface contracts documented in `PROJECT.md` and `themis.md`.

---

## 2. Testing Methodology

Our E2E test suite adheres to four formal software engineering testing methodologies:

### 2.1. Category-Partition Method (CPM)
The input domain of each feature is decomposed into functional categories and equivalence classes:
- **Legal Categories Partition**: 10 formal branches (`labor`, `family`, `civil`, `housing`, `criminal`, `administrative`, `business`, `property`, `contract`, `tax`).
- **Regional Jurisdictions Partition**: 14 administrative divisions of Uzbekistan (12 viloyat + Toshkent shahri + Qoraqalpog'iston).
- **Authentication Personas Partition**: 3 distinct roles (`user` / citizen client, `specialist` / advocate, `admin` / moderator) with explicit privilege boundaries.
- **Consultation Format Partition**: `chat`, `video`, `audio` with varying durations (15m, 30m, 45m, 60m) and pricing bands.

### 2.2. Boundary Value Analysis (BVA)
Boundary values are systematically tested at and across critical domain frontiers:
- **Input text lengths**: Empty strings (0 chars), single-char inputs, nominal questions (50-200 chars), and ultra-long legal inquiries (>5,000 chars).
- **Consultation Durations**: Exact minimum (15 minutes), nominal (30, 45, 60 minutes), and exact maximum (120 minutes).
- **Password Length**: Disallowed (<6 characters), exact threshold (6 characters), and standard lengths (>8 characters).
- **Ratings & Scoring**: Minimum valid rating (1 star), maximum valid rating (5 stars), rating filter thresholds (4.5+, 4.8+), and average computations.
- **Tariffs & Financial Calculations**: Minimum tariffs, 15% platform commission splits, specialist net remuneration (85%), and escrow holds.

### 2.3. Pairwise Combinatorial Testing
State transitions across system boundaries are verified in pairwise combinations:
- `AI Triage` $\longleftrightarrow$ `Specialist Catalog Filtering` (category alignment)
- `Specialist Profile` $\longleftrightarrow$ `Consultation Booking Modal` (tariff and service selection)
- `Booking Modal` $\longleftrightarrow$ `Consultation Tracking & LocalStorage` (persistence contract)
- `Scheduled Consultation` $\longleftrightarrow$ `Real-time Chat & Video Link` (session binding)
- `Specialist Application` $\longleftrightarrow$ `Admin Credential Verification` (role privilege promotion)

### 2.4. Real-World Workload Testing
Realistic citizen journeys reflect authentic legal dilemmas in Uzbekistan:
- **Labor Dispute**: Wrongful dismissal, unpaid wages, Lex.uz Mehnat Kodeksi 161/244 citations, booking advocate Azizbek Rahimov.
- **Divorce & Child Support**: Alimony statutory ratio (1/4 for 1 child, 1/3 for 2 children) under Oila Kodeksi 96/99, video booking with Dilnoza Karimova.
- **Housing Lease Conflict**: 3-day unlawful eviction notice, security deposit recovery under Fuqarolik Kodeksi 574/600, consultation booking with Rustam Mahmudov.
- **Business Debt & Contract Breach**: Non-delivery of commercial goods, breach of contract under Fuqarolik Kodeksi 382, tariff selection and platform escrow ledger entry.

---

## 3. Four-Tier Test Architecture

The E2E test suite is structured into four sequential verification tiers:

```
tests/e2e/
├── runner.js                         # Unified CLI test runner & reporter
├── harness.js                        # Isolated test harness, assertions & mock fixtures
├── tier1-feature-coverage.test.js    # Tier 1: Core Feature Verification (>=5 tests / feature)
├── tier2-boundary-corner.test.js     # Tier 2: Boundary & Corner Cases (>=5 tests / feature)
├── tier3-cross-feature.test.js       # Tier 3: Pairwise Cross-Feature Interactions
└── tier4-real-world-scenarios.test.js# Tier 4: Real-World Citizen Journeys
```

### Tier Summary Matrix

| Tier | Focus | Minimum Target | Target Features |
|------|-------|----------------|-----------------|
| **Tier 1** | **Feature Coverage** | $\ge 5$ tests per feature | 8 Core Feature Groups (Multi-Role Auth, Catalog & Search, Profile & Tariffs, Booking Lifecycle, AI Legal Triage, Consultation Chat, Admin Oversight, Financials) |
| **Tier 2** | **Boundary & Corner Cases** | $\ge 5$ tests per feature | Empty payloads, extreme sizes, regex injection, boundary dates, invalid routes, commission rounding |
| **Tier 3** | **Cross-Feature Combinations** | $\ge 5$ end-to-end flows | Triage $\to$ Catalog, Catalog $\to$ Booking $\to$ Storage, Booking $\to$ Chat $\to$ Rating, Booking $\to$ Specialist Requests, Specialist $\to$ Admin Verification |
| **Tier 4** | **Real-World Scenarios** | 4 complete journeys | 1. Labor Dispute, 2. Divorce & Alimony, 3. Housing Eviction, 4. Commercial Contract |

---

## 4. Feature Inventory Coverage Mapping

| Feature # | Feature Name | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|-----------|--------------|:------:|:------:|:------:|:------:|
| **1-2** | Multi-Role Registration & Demo Personas | ✅ | ✅ | ✅ | ✅ |
| **3-7** | AI Inquiry, Triage, Citations, Recommendations & Disclaimer | ✅ | ✅ | ✅ | ✅ |
| **8-12** | Specialist Search, Branch/Region Filters, Online & Rating Filters | ✅ | ✅ | ✅ | ✅ |
| **13-14** | Specialist Dossier Bio, Pedigree & Tariff Matrix | ✅ | ✅ | ✅ | ✅ |
| **15-16** | Consultation Booking Modal & Tracking Tabs | ✅ | ✅ | ✅ | ✅ |
| **17-18** | Consultation Chat & Video Meeting Access | ✅ | ✅ | ✅ | ✅ |
| **19-20** | Post-Consultation Rating & Specialist Reply | ✅ | ✅ | ✅ | ✅ |
| **21-26** | Specialist Dashboard, Schedule, Earnings & 15% Commission | ✅ | ✅ | ✅ | ✅ |
| **27-32** | Admin Credential Verification, Reviews, Transactions & Audit | ✅ | ✅ | ✅ | ✅ |

---

## 5. Test Execution Engine & Commands

The test suite runs seamlessly on Node.js 18+ (tested on Node 24.15.0 LTS) with **zero external runtime dependencies**. It executes both synchronous domain state machine tests and asynchronous HTTP/API tests.

### Primary Command
```bash
node tests/e2e/runner.js
```

### Targeted Execution by Tier
```bash
node tests/e2e/runner.js --tier=1    # Run only Tier 1 Feature Coverage
node tests/e2e/runner.js --tier=2    # Run only Tier 2 Boundary & Corner Cases
node tests/e2e/runner.js --tier=3    # Run only Tier 3 Cross-Feature Workflows
node tests/e2e/runner.js --tier=4    # Run only Tier 4 Real-World Citizen Journeys
```

### Verbose / Filter Execution
```bash
node tests/e2e/runner.js --verbose
node tests/e2e/runner.js --filter="triage"
```

---

## 6. Expected Output Derivation & Verification Oracles

| Component | Test Input | Authoritative Oracle | Verification Method |
|---|---|---|---|
| **AI Triage (`POST /api/ai/chat`)** | Labor inquiry: *"Ish beruvchim oyligimni bermayapti..."* | `PROJECT.md` & `api/ai/chat/route.ts` | Status 200, category `"labor"`, sources contain *"O'zbekiston Respublikasi Yangi Mehnat Kodeksi"* and article *"161, 244-moddalar"*, `needs_specialist: true`, recommended specialists match category `"labor"`. |
| **AI Triage Validation** | Empty message: `{}` or `{"message": ""}` | `api/ai/chat/route.ts:11` | Status 400, `{ "error": "Xabar matni kiritilmadi" }`. |
| **Specialist Catalog Search** | Query: `"Azizbek"` | `mock-data.ts:4` | Results filter to `spec-1`, `Azizbek Rahimov`, `rating_avg >= 4.9`. |
| **Branch Filtering** | Category: `"housing"` | `constants.ts:37` & `mock-data.ts:143` | Results include `spec-3` (`Rustam Mahmudov`), excluding non-housing specialists. |
| **Regional Filtering** | Region: `"samarkand"` | `constants.ts:107` | Results include `spec-2` (`Dilnoza Karimova`), excluding Tashkent specialists. |
| **Booking Persistence** | Book service `serv-1` with date `2026-11-05T15:00` | `PROJECT.md § Interface Contract 3` | Consultation saved with `status: 'pending'`, matches specialist ID and tariff fee. |
| **Platform Commission** | Consultation price `200,000 UZS` | `constants.ts:162` (`15%`) | Commission = `30,000 UZS`, Specialist net = `170,000 UZS`. |
| **Demo Auth Switching** | Quick demo persona `"specialist"` | `login/page.tsx:76` | Role set to `"specialist"`, redirects to `/specialist` or `/specialist/profile`. |

---

## 7. Quality Gates & Exit Criteria

1. **100% Pass Rate**: All Tier 1, Tier 2, Tier 3, and Tier 4 test cases must pass without unhandled rejections or assertions failures.
2. **Deterministic Isolation**: Tests run deterministically in any order and produce identical results across runs.
3. **Audit Trail**: Every test execution outputs structured counts: Total Tests, Passed Tests, Failed Tests, Duration, and Coverage Breakdown.
4. **Publication**: Upon successful verification, `TEST_READY.md` is generated at the project root summarizing the coverage matrix and reproduction instructions.
