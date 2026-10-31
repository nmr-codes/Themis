# Handoff Report: AI Consultation Backend Route & Statutory Triage Engine

**Explorer:** Explorer M4_2 (`teamwork_explorer`)  
**Target Milestone:** Milestone 4 (AI Legal Consultation Flow & Statutory Guidance)  
**Target Consumer:** Worker M4 / Orchestrator  
**Date:** 2026-10-31  

---

## 1. Observation

### 1.1. Current State of `src/app/api/ai/chat/route.ts`
- **File Path**: `src/app/api/ai/chat/route.ts` (337 lines)
- **HTTP Handler**: `POST(req: Request)`
- **Request Payload Parsing**: Line 8:
  ```ts
  const { message, conversation_id, history = [] } = await req.json();
  ```
  - Input validation (lines 10-12): Returns HTTP 400 `{ error: "Xabar matni kiritilmadi" }` if `message` is empty or missing.
  - OpenAI GPT-4o-mini Integration (lines 17-74): Invoked only if `process.env.OPENAI_API_KEY` is present and does not include `"your-openai-api-key"` or `"placeholder"`. Falls back silently to offline statutory rule engine when absent or on API failure.
  - Recommended Specialist Matching (lines 56-58, 319-322):
    ```ts
    const matchedSpecs = MOCK_SPECIALISTS.filter((s) =>
      s.categories.some((c) => c.id === category)
    );
    ```
    If `matchedSpecs.length === 0`, line 330 falls back to:
    ```ts
    recommended_specialists: matchedSpecs.length > 0 ? matchedSpecs : MOCK_SPECIALISTS.slice(0, 2)
    ```
    Where `MOCK_SPECIALISTS.slice(0, 2)` returns **Azizbek Rahimov** (Labor/Civil) and **Dilnoza Karimova** (Family/Property).

### 1.2. The Substring Collision Defects
Direct reproduction executed in Node.js against both `tests/e2e/harness.js` (gen1 logic) and `src/app/api/ai/chat/route.ts`:

#### Defect A: Verbal Noun Suffix `-ish` / Isolated Word `"ish"` (Collision in Labor Law)
- **Gen1 Harness (`tests/e2e/harness.js:266-273`)**:
  ```javascript
  if (
    lower.includes("ish") ||
    lower.includes("maosh") ||
    lower.includes("bo'shat") ||
    lower.includes("mehnat") ||
    lower.includes("ta'til")
  ) {
    category = "labor";
  ```
  - In Uzbek, `-ish` and `-sh` is the universal action verb/masdar (infinitive) suffix.
  - Sentences directly misclassified as **Labor Law**:
    1. `"Aliment undirish to'g'risida ariza"` $\to$ matches `undir`**`ish`** $\to$ returns `"labor"` instead of `"family"`.
    2. `"Notarius orqali ishonchnoma berish tartibi"` $\to$ matches `ber`**`ish`** and **`ish`**`onchnoma` $\to$ returns `"labor"` instead of `"civil"`.
    3. `"Yetkazib berish shartnomasi buzildi"` $\to$ matches `ber`**`ish`** $\to$ returns `"labor"` instead of `"contract"`.
    4. `"Da'vo arizasi topshirish"` $\to$ matches `topshir`**`ish`** $\to$ returns `"labor"`.
    5. `"Ko'chmas mulkni taqsimlash va ulush ajratish"` $\to$ matches `ajrat`**`ish`** $\to$ returns `"labor"` instead of `"property"`.
- **Current `route.ts` (`src/app/api/ai/chat/route.ts:81-83, 208-221`)**:
  ```ts
  const hasWord = (word: string) => new RegExp(`(^|[^a-z0-9_'])${word}([^a-z0-9_']|$)`, "i").test(text);
  ...
  else if (
    hasWord("ish") ||
    hasWord("ishim") ||
    hasWord("ishdan") ||
    hasWord("ishga") ||
    text.includes("ish haqi") ||
    ...
  ```
  - In Uzbek jurisprudence, `"ish"` is the standard word for "legal case / lawsuit / matter" (e.g. *sud ishi*, *fuqarolik ishi*, *ijro ishi*, *meros ishi*).
  - Sentence: `"Qarzdorlik bo'yicha bir ish sudda ko'rilmoqda"` (A debt matter is pending in court) $\to$ matches `hasWord("ish")` at line 209 $\to$ erroneously returns `"labor"` instead of `"contract"` or `"civil"`.

#### Defect B: Substring `"uy"` (Collision in Housing Law)
- **Gen1 Harness (`tests/e2e/harness.js:308`)**:
  ```javascript
  else if (
    lower.includes("ijara") ||
    lower.includes("kvartira") ||
    lower.includes("uy") ||
    lower.includes("kadastr") ||
    lower.includes("propiska")
  ) {
    category = "housing";
  ```
  - In Uzbek, `"uy"` naturally occurs within common commercial, contractual, and criminal terms:
    - *buyurtma* / *buyurtmachi* (order / purchaser / client in commercial contracts)
    - *buyruq* / *sud buyrug'i* (decree / court order)
    - *tuyg'u* (feeling)
    - *uyushgan jinoyatchilik* (organized crime)
    - *suyultirilgan gaz* (liquefied gas contracts)
  - Sentence: `"MCHJ buyurtmachi to'lov qilmadi"` $\to$ matches `b`**`uy`**`urtmachi` $\to$ erroneously returns `"housing"` instead of `"business"` or `"contract"`.
- **Current `route.ts` (`src/app/api/ai/chat/route.ts:160-168`)**:
  ```ts
  else if (
    text.includes("ijara") ||
    text.includes("kvartira") ||
    text.includes("uy-joy") ||
    text.includes("kadastr") ||
    text.includes("propiska") ||
    text.includes("depozit") ||
    text.includes("uyni bo'shatish")
  )
  ```
  - The authors removed `"uy"`, but failed to add common housing inflections (*uydan*, *uyga*, *uyim*, *xonadon*, *turar joy*).
  - Sentence: `"Mening xonadonimdan uydan majburiy chiqarishmoqda"` (Forcible eviction from my home) $\to$ has *uydan* and *xonadon*, but neither is in the keyword list $\to$ falls through to default `"civil"`, failing Housing classification.

#### Defect C: JavaScript `\b` Word Boundary Failure on Uzbek Apostrophes
- In standard JavaScript regex, `\b` treats only ASCII `[a-zA-Z0-9_]` as word characters.
- In Uzbek Latin, apostrophes / okinas (`'`, `’`, `‘`, `ʻ`, `ʼ`) are integral parts of letters and words:
  - `bo'shatish` is treated as two words: `"bo"` and `"shatish"`.
  - `o'g'irlik` is treated as three tokens: `"o"`, `"g"`, `"irlik"`.
  - `ta'til` is treated as `"ta"` and `"til"`.
  - `da'vo` is treated as `"da"` and `"vo"`.
  - `ma'muriy` is treated as `"ma"` and `"muriy"`.
- In addition, users input text in both Uzbek Latin and Uzbek Cyrillic (*меҳнат, ойлик, алимент, ижара, жиноят, солиқ*). Neither `route.ts` nor `harness.js` currently accounts for Cyrillic tokens.

### 1.3. Discrepancy in `MOCK_SPECIALISTS` (`src/lib/mock-data.ts` vs `tests/e2e/harness.js`)
- `src/lib/mock-data.ts` contains only **3 specialists**:
  - `spec-1`: Azizbek Rahimov $\to$ Categories: `labor`, `civil`
  - `spec-2`: Dilnoza Karimova $\to$ Categories: `family`, `property`
  - `spec-3`: Rustam Mahmudov $\to$ Categories: `housing`, `contract`
- Categories with **ZERO matching specialists** in `src/lib/mock-data.ts`:
  - `criminal` (Jinoyat huquqi)
  - `administrative` (Ma'muriy huquq)
  - `business` (Tadbirkorlik huquqi)
  - `tax` (Soliq huquqi)
- In `tests/e2e/harness.js:176-243`, **two additional specialists** were defined but never committed to `src/lib/mock-data.ts`:
  - `spec-4`: Javohir To'rayev $\to$ Region: `fergana`, Categories: `criminal`, `administrative`, License: `#ADV-0812`
  - `spec-5`: Shahnoza Alimova $\to$ Region: `bukhara`, Categories: `business`, `tax`, License: `#ADV-9920`
- As a result, in production when a citizen asks about a criminal or tax dispute, the backend falls back to recommending a Labor lawyer and a Family lawyer.

### 1.4. Statutory Citations Coverage Audit
Audit of national legislation codes in `src/app/api/ai/chat/route.ts`:
1. **Labor Code**: Yangi Mehnat Kodeksi cited (articles 161, 244, 333). Accurate.
2. **Family Code**: Oila Kodeksi cited (articles 96, 99, 115). Accurate.
3. **Civil Code**: Fuqarolik Kodeksi cited (articles 8, 14, 353, 382, 574, 600, 985, 1112, 1146). Accurate.
4. **Housing Code**: Uy-joy Kodeksi cited (articles 13, 27, 86). Accurate.
5. **Criminal Code / JPK**: Jinoyat Kodeksi cited as `"Maxsus qism moddalari"` (vague; should cite specific articles 168, 169, 210), JPK articles 46, 48, 50.
6. **Code on Administrative Liability**: MJtK articles 49, 314, 315, MSIK articles 27, 185. Accurate.
7. **Tax Code**: Soliq Kodeksi articles 14, 219, 231. Accurate.
8. **Customs Code (Bojxona Kodeksi)**: **COMPLETELY ABSENT**. Not cited anywhere in `route.ts`, `constants.ts`, or `mock-data.ts`.

---

## 2. Logic Chain

1. **Premise 1 (Agglutinative Morphology)**: In Uzbek, grammatical functions and verbal nouns are formed by affixation. Substring checks (`lower.includes(...)`) without word tokenization inherently match suffixes like `-ish` across unrelated stems.
2. **Premise 2 (Polysemy of "ish")**: In legal context, "ish" is both an activity noun (labor/employment) and a judicial noun (a case/matter/lawsuit). Matching isolated `"ish"` without compound qualifiers (`ish haqi`, `ish beruvchi`, `mehnat`) conflates judicial disputes with employment disputes.
3. **Premise 3 (Apostrophe Normalization)**: Uzbek users type in various keyboard layouts using ASCII `'`, right curly `’`, left curly `‘`, modifier letter okina `ʻ`, and grave accents ``` ` ```. A robust word extraction pattern must normalize all apostrophe representations to a canonical character and include it inside word tokens (`[a-z0-9\u0400-\u04FF]+(?:['\-][a-z0-9\u0400-\u04FF]+)*`).
4. **Premise 4 (Scoring vs Linear Cascades)**: A linear `if ... else if` cascade forces an arbitrary category hierarchy. Evaluating queries with a weighted scoring matrix (multi-word compound phrases = 10 pts, domain tokens = 3 pts) eliminates false priority overrides and correctly handles complex sentences.
5. **Premise 5 (Specialist Catalog Alignment)**: `src/lib/mock-data.ts` must be synchronized with `tests/e2e/harness.js` so that all 10 legal branches have verified specialists with complete profiles, licenses, and regional affiliations.

---

## 3. Caveats

1. **Lex.uz Dynamic Availability**: The Lex.uz links (`https://lex.uz/docs/<id>`) are static canonical URLs for official normative acts. In offline demo mode, external network calls to Lex.uz are not executed; the platform renders styled citation badges with these URLs.
2. **Customs Law (Bojxona) Category Mapping**: `LEGAL_CATEGORIES` in `constants.ts` defines 10 branches: `labor`, `family`, `civil`, `housing`, `criminal`, `administrative`, `business`, `property`, `contract`, `tax`. Customs disputes (*bojxona boji, deklaratsiya, kontrabanda*) fall under `tax` (customs duties & VAT), `administrative` (customs authority decisions), or `business` (foreign economic activity). Rather than breaking the 10-category schema in `constants.ts`, customs disputes should be classified under `tax` (or `administrative`) and return the official *Bojxona Kodeksi* citation.
3. **E2E Test Backward Compatibility**: The existing 84 E2E test cases in `tests/e2e/` must continue to pass with a 100% pass rate. The text content strings in `tests/e2e/tier4-real-world-scenarios.test.js` (e.g. `"Mehnat kodeksiga binoan"`, `"uchdan bir qismi (1/3)"`, `"ijara.soliq.uz"`) must be preserved in the generated statutory responses.

---

## 4. Conclusion & Actionable Recommendations for Worker M4

### Recommended Architecture: Dedicated Triage Engine (`src/lib/triage.ts`)

Instead of maintaining 250+ lines of inline regex checks in `route.ts`, create a dedicated, clean, typed engine `src/lib/triage.ts` and import it in `route.ts`.

#### Recommendation 1: Create `src/lib/triage.ts`
Implement:
1. `normalizeUzbek(text: string): string` — normalizes Unicode quotation marks and okinas (`’`, `‘`, `ʻ`, `ʼ`, ``` ` ```, `´`) into `'`, converts to lowercase, and trims.
2. `extractUzbekTokens(text: string): string[]` — extracts full word tokens supporting internal hyphens and apostrophes, plus Latin & Cyrillic characters (`[a-z0-9\u0400-\u04FF]+(?:['\-][a-z0-9\u0400-\u04FF]+)*`).
3. `STATUTORY_CITATIONS` — complete dictionary mapping each of the 10 categories (plus customs) to official Lex.uz titles, articles, and URLs.
4. `classifyLegalQuery(message: string): { category: string; score: number }` — weighted scoring engine utilizing multi-word legal phrases (10 pts) and domain tokens (3 pts).
5. `matchSpecialists(category: string, userRegion?: string): SpecialistWithDetails[]` — filters specialists by category, prioritizing specialists located in `userRegion`, then online status, then rating.
6. `generateLegalAnalysis(category: string, message: string): { content: string; sources: AISource[] }` — generates formal legal memorandum text containing exact statutory guidance.

#### Recommendation 2: Update `src/lib/mock-data.ts`
Add `spec-4` (Javohir To'rayev — Criminal & Administrative, Fergana) and `spec-5` (Shahnoza Alimova — Business & Tax, Bukhara) to `MOCK_SPECIALISTS` in `src/lib/mock-data.ts` to ensure 100% coverage across all 10 legal branches.

#### Recommendation 3: Refactor `src/app/api/ai/chat/route.ts`
Streamline `route.ts`:
- Accept optional `region` in request payload: `{ message, conversation_id, history, region }`.
- In OpenAI mode: Prompt asks for JSON `{ content, category, sources, needs_specialist }`. Use `matchSpecialists(parsed.category, region)` for recommendations.
- In Fallback / Offline mode: Call `triageLegalQuery(message, { region })`.
- Return uniform JSON schema with verified `sources` containing `title`, `article`, and `url`.

#### Recommendation 4: Complete Statutory Citation Mapping

| Category | Primary Code / Act | Key Articles | Lex.uz URL |
|:---|:---|:---|:---|
| **labor** | O'zbekiston Respublikasi Yangi Mehnat Kodeksi | 161, 244, 253, 333-moddalar | `https://lex.uz/docs/6257288` |
| **family** | O'zbekiston Respublikasining Oila Kodeksi | 96, 99, 115-moddalar | `https://lex.uz/docs/104720` |
| **housing** | O'zR Uy-joy Kodeksi & Fuqarolik Kodeksi | Uy-joy 13, 27, 86; Fuqarolik 574, 600-moddalar | `https://lex.uz/docs/106136` |
| **civil** | O'zbekiston Respublikasining Fuqarolik Kodeksi | 8, 14, 353, 985-moddalar | `https://lex.uz/docs/111189` |
| **property** | O'zR Fuqarolik Kodeksi (Mulk va Meros) | 1112, 1141, 1146-moddalar | `https://lex.uz/docs/180552` |
| **contract** | O'zbekiston Respublikasining Fuqarolik Kodeksi | 353, 382, 385, 732, 735-moddalar | `https://lex.uz/docs/111189` |
| **criminal** | O'zR Jinoyat Kodeksi & JPK | JK 168, 169, 210; JPK 46, 48, 50-moddalar | `https://lex.uz/docs/111453` |
| **administrative** | O'zR Ma'muriy Javobgarlik to'g'risidagi Kodeks (MJtK) & MSIK | MJtK 49, 314, 315; MSIK 27, 185-moddalar | `https://lex.uz/docs/97661` |
| **tax** | O'zbekiston Respublikasining Soliq Kodeksi | 14, 86, 219, 231-moddalar | `https://lex.uz/docs/4674902` |
| **customs** *(under tax/business)* | O'zbekiston Respublikasining Bojxona Kodeksi | 17, 260, 289, 366-moddalar | `https://lex.uz/docs/2876354` |

---

## 5. Verification Method

### Step 1: Run the Automated E2E Test Suite
Execute the project test command to verify baseline integrity:
```bash
node tests/e2e/runner.js
```
*Expected Result*: All 84 tests across Tiers 1–4 pass (0 failures).

### Step 2: Adversarial Collision Verification
Verify the prototype NLP script created during this investigation:
```bash
node .agents/teamwork/explorer_m4_2/prototype_triage.cjs
```
*Expected Result*: 13 / 13 test cases pass with zero false labor/housing classifications:
- `"Aliment undirish to'g'risida ariza"` $\to$ `family` (NOT `labor`)
- `"MCHJ buyurtmachi to'lov qilmadi"` $\to$ `contract` / `business` (NOT `housing`)
- `"Mening xonadonimdan uydan majburiy chiqarishmoqda"` $\to$ `housing` (NOT `civil`)
- `"Notarius orqali ishonchnoma berish"` $\to$ `civil` (NOT `labor`)
- `"Yetkazib berish shartnomasi buzildi"` $\to$ `contract` (NOT `labor`)
- Cyrillic: `"Иш берувчим ойлик маош бермаяпти"` $\to$ `labor`
- Cyrillic: `"Алимент ундириш бўйича даъво"` $\to$ `family`

### Step 3: TypeScript & Build Verification
```bash
npm run build
```
*Expected Result*: Build completes with exit code 0 and zero TypeScript or linting errors.

---
*Report compiled and verified by Explorer M4_2 for Worker M4 implementation.*
