# Adversarial Review & Empirical Verification Report — Challenger M4_1

**Target**: Milestone 4 — Legal Triage Engine (`src/lib/triage.ts`) & AI Chat API (`src/app/api/ai/chat/route.ts`)  
**Challenger**: Challenger M4_1 (`teamwork_challenger`)  
**Working Directory**: `c:\Users\Bro\Desktop\Themis\.agents\teamwork\challenger_m4_1`  
**Date**: 2026-10-31  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Empirical Test Harness Execution (`node tests/adversarial-m4.mjs`)
A comprehensive adversarial stress test harness (`tests/adversarial-m4.mjs`) was authored and executed covering 42 adversarial test cases:

```
======================================================================
  CHALLENGER M4: EMPIRICAL ADVERSARIAL STRESS TEST HARNESS
  Target: Triage Engine (src/lib/triage.ts) & API (/api/ai/chat)
======================================================================

--- Section 1: Mandated 'ish' Keyword Collision Probes ---
  ✓ Probe ISH-1: 'Aliment undirish to\'g\'risida ariza' MUST classify as family, NOT labor
  ✓ Probe ISH-2: 'Notarius orqali ishonchnoma berish tartibi' MUST classify as civil, NOT labor
  ✓ Probe ISH-3: 'Yetkazib berish shartnomasi buzildi' MUST classify as contract, NOT labor
  ✗ [FAILED] Probe ISH-4: 'Ko\'chmas mulkni taqsimlash va ulush ajratish' MUST classify as property, NOT labor
    Query 'Ko'chmas mulkni taqsimlash va ulush ajratish' must classify as property, got family
+ actual - expected

+ 'family'
- 'property'

  ✓ Probe ISH-5: 'Ish haqi to\'lanmadi, ishdan noqonuniy bo\'shatishdi' MUST classify as labor

--- Section 2: Mandated 'uy' Substring Collision Probes ---
  ✓ Probe UY-1: 'MCHJ buyurtmachi to\'lov qilmadi' MUST classify as contract/business, NOT housing
  ✓ Probe UY-2: 'Sud buyrug\'i ijro etilmadi' MUST classify as civil/administrative, NOT housing
  ✓ Probe UY-3: 'Mening xonadonimdan uydan majburiy chiqarishmoqda' MUST classify as housing
  ✓ Probe UY-4: 'Ijara shartnomasi va depozit qaytarilmadi' MUST classify as housing

--- Section 3: Mandated Cyrillic Probes ---
  ✓ Probe CYR-1: 'Иш берувчим ойлик маош бермаяпти' MUST classify as labor
  ✓ Probe CYR-2: 'Алимент ундириш бўйича даъво' MUST classify as family
  ✓ Probe CYR-3: 'Ижара пулини қайтармаяпти' MUST classify as housing

--- Section 4: Extra Adversarial Stress Probes ---
  ✓ Stress-1: Action suffix '-ish' in commercial negotiations must NOT trigger labor
  ✓ Stress-2: False positive 'uy' in words (uyg'onish, tuyg'u, buyurtma) must NOT trigger housing
  ✓ Stress-3: Criminal inquiry with Latin diacritics must classify as criminal
  ✓ Stress-4: Administrative radar fine inquiry must classify as administrative
  ✓ Stress-5: Tax audit and penalty must classify as tax

--- Section 5: Live HTTP Endpoint (/api/ai/chat) Verification ---
  ✓ HTTP-1: Empty input returns HTTP 400 with descriptive error
  ✓ HTTP-2: Whitespace-only input returns HTTP 400
  ✓ HTTP-3: Missing message field returns HTTP 400
  ✓ HTTP-4: Extremely long inquiry (>5,000 characters) processes without crashing
  ✓ HTTP-5: Labor response MUST contain required phrases ('Mehnat huquqi', 'Mehnat kodeksiga binoan')

--- Section 6: Matched Specialists Coverage for All 10 Legal Branches ---
  ✓ Specialist Match [labor]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [labor]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [family]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [family]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [civil]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [civil]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [housing]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [housing]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [criminal]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [criminal]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [administrative]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [administrative]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [business]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [business]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [property]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [property]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [contract]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [contract]: live API returns non-empty recommended_specialists
  ✓ Specialist Match [tax]: matchSpecialists returns at least 1 recommended specialist
  ✓ HTTP Match [tax]: live API returns non-empty recommended_specialists

======================================================================
  CHALLENGER M4 STRESS TEST EXECUTION SUMMARY
  Total: 42 | Passed: 41 | Failed: 1
======================================================================
```

### 1.2 Isolated Defect in `src/lib/triage.ts`
Direct inspection of `src/lib/triage.ts` lines 240–282 and lines 380–391 confirms the mechanical root cause of Probe ISH-4's failure:
1. In `src/lib/triage.ts:244`, `family.phrases` contains:
   ```ts
   "vasiylik va homiylik", "nikoh shartnomasi", "mulkni taqsimlash", "fhdyo", "zags",
   ```
2. In `src/lib/triage.ts:274`, `property.phrases` contains:
   ```ts
   "davlat ro'yxati", "mulkni bo'lish", "ulush ajratish",
   ```
3. For query `"Ko'chmas mulkni taqsimlash va ulush ajratish"`:
   - Phrase `"mulkni taqsimlash"` matches in `family` $\to$ `scores.family = 10`
   - Phrase `"ulush ajratish"` matches in `property` $\to$ `scores.property = 10`
   - Neither `"ko'chmas mulk"`, `"mulk"`, nor `"ulush"` is indexed in `property.tokens` or `property.phrases`
4. In `classifyLegalQuery` lines 380–391:
   ```ts
   let bestCat = "civil";
   let maxScore = 0;

   for (const [cat, score] of Object.entries(scores)) {
     if (score > maxScore) {
       maxScore = score;
       bestCat = cat;
     }
   }
   ```
   Because `family` (line 240) precedes `property` (line 270) in the `CATEGORY_RULES` dictionary, `scores.family` (10) sets `maxScore = 10` and `bestCat = "family"`. When `cat` reaches `"property"`, `score (10) > maxScore (10)` is false (`>` strict inequality).
   As a result, a property division dispute is misclassified as **Family Law** (`family`), yielding advice regarding divorce and child alimony under Oila Kodeksi articles 96/99 instead of real property rights.

### 1.3 Full E2E Test Suite Execution (`node tests/e2e/runner.js`)
```
======================================================================
  TEST EXECUTION SUMMARY
======================================================================
  Duration:         109 ms
  Total Tests:      84
  Passed Tests:     84
  Failed Tests:     0

  Tier Breakdown:
    Tier 1: 43/43 passed
    Tier 2: 27/27 passed
    Tier 3: 8/8 passed
    Tier 4: 6/6 passed

✔ ALL E2E TEST SUITES PASSED CLEANLY (100% Pass Rate)
```

### 1.4 TypeScript & Build Integrity
1. `npx tsc --noEmit` exited with code 0 (clean, 0 type errors).
2. `npm run build` exited with code 0 (all 27 routes compiled successfully):
   ```
   Route (app)                              Size     First Load JS
   ┌ ○ /                                    16.2 kB         146 kB
   ├ ○ /ai-chat                             10.1 kB         125 kB
   ├ ƒ /ai-chat/[id]                        9.97 kB         149 kB
   ├ ƒ /api/ai/chat                         0 B                0 B
   ...
   ✓ Generating static pages (27/27)
   ```

---

## 2. Logic Chain

1. **Mandated Requirement**: The dispatch instructions explicitly specify:
   > `"Ko'chmas mulkni taqsimlash va ulush ajratish"` (MUST classify as property, NOT labor).
2. **Direct Observation**:
   Executing `classifyLegalQuery("Ko'chmas mulkni taqsimlash va ulush ajratish")` returned `{ category: 'family', score: 10 }`.
3. **Collision & Precedence Mechanism**:
   - The phrase `"mulkni taqsimlash"` is assigned to `family` (intended for marital property distribution).
   - The phrase `"ulush ajratish"` is assigned to `property`.
   - In a tied score situation (10 vs 10), object key order in `CATEGORY_RULES` gives precedence to `family` over `property`.
   - `CATEGORY_RULES.property` lacks phrases for `"ko'chmas mulk"`, `"ko'chmas mulkni taqsimlash"`, and lacks tokens for `"mulk"` or `"ulush"`.
4. **User-Facing Impact**:
   A citizen seeking guidance on real estate partitioning ("Ko'chmas mulkni taqsimlash va ulush ajratish") receives:
   - Category: `Oila huquqi`
   - Content: Child support fractions (1/4, 1/3) and divorce court recommendations.
   - Recommended specialists: Family/divorce attorneys instead of cadastral/property advocates.
5. **Worker-Only Remediation**:
   Under Challenger constraints, Challenger must NOT alter implementation code. Worker M4 must fix `src/lib/triage.ts` by:
   - Adding `"ko'chmas mulk"`, `"ko'chmas mulkni taqsimlash"`, `"mulk taqsimoti"` to `CATEGORY_RULES.property.phrases`.
   - Adding `"mulk"`, `"ko'chmas"`, `"ulush"` to `CATEGORY_RULES.property.tokens`.

---

## 3. Caveats

1. **Pending Specialist Coverage for Business & Tax**:
   `matchSpecialists` returns approved specialists for all 10 branches because it falls back to the approved pool (`spec-1`, `spec-2`, `spec-4`) when matching branches have no approved specialist. In `src/lib/mock-data.ts`, `spec-5` (Shahnoza Alimova — Business & Tax) is intentionally set to `verification_status: "pending"` to support the Admin Verification workflow in E2E Tier 3.
2. **External Lex.uz Reachability**:
   The static URLs in `STATUTORY_CITATIONS` (`https://lex.uz/docs/...`) are well-formed canonical URLs; live internet accessibility of external Lex.uz servers is dependent on client network configuration.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

While the triage engine successfully resolves 41 of 42 probes (including "ish" action suffixes, "uy" substring collisions, Cyrillic inputs, boundary sizes >5,000 chars, and HTTP error statuses), **Probe ISH-4 failed**:
- Query: `"Ko'chmas mulkni taqsimlash va ulush ajratish"`
- Expected: `property`
- Actual: `family`

### Actionable Remediation Required from Worker M4:
In `src/lib/triage.ts`:
1. In `CATEGORY_RULES.property.phrases`, add:
   - `"ko'chmas mulk"`, `"ko'chmas mulkni taqsimlash"`, `"mulk taqsimoti"`
2. In `CATEGORY_RULES.property.tokens`, add:
   - `"mulk"`, `"ko'chmas"`, `"ulush"`
3. Re-run `node tests/adversarial-m4.mjs` until all 42 tests pass cleanly with 100% success rate.

---

## 5. Verification Method

To verify the failure and the subsequent fix, run:

1. **Empirical Test Harness**:
   ```bash
   node tests/adversarial-m4.mjs
   ```
   *Expected Current Output*: Fails on Probe ISH-4 (actual: `'family'`, expected: `'property'`).  
   *Invalidation Condition for REQUEST_CHANGES*: If `node tests/adversarial-m4.mjs` outputs `42 | Passed: 42 | Failed: 0`, the change request is satisfied.

2. **Full Regression E2E Suite**:
   ```bash
   node tests/e2e/runner.js
   ```

3. **Compilation & Build**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
