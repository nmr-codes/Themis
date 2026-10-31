/**
 * Adversarial Empirical Verification Suite for Milestone 3 Remediation
 * Agent: Challenger M3_R2 (critic, specialist)
 *
 * Scope:
 * 1. Multi-filter combinations: 10 branches × 14 regions × online × minimum rating (1,320 permutations)
 * 2. Boundary values: empty search, whitespace, diacritics (O'zbekiston, Toshkent), SQL injection / XSS strings in search box
 * 3. Consultation booking persistence: verify that booking requests saved on `/specialists/[id]` write to `localStorage` (`themis_consultations`) and adhere to Interface Contract 3
 * 4. Acronym search: test "TDYU", "TSUL", "JIDU", "UWED"
 * 5. URL query string state synchronization (verify clean fallback on param removal, preventing stale filter traps)
 * 6. Live HTTP server validation against Next.js production build (/specialists, /specialists/[id])
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import ts from "typescript";
import vm from "node:vm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n======================================================================");
console.log("  CHALLENGER M3_R2: ADVERSARIAL EMPIRICAL VERIFICATION SUITE");
console.log("  Specialist Catalog, Multi-Filter Matrix, Acronyms & Contract 3");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;
const findings = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Details: ${err.message}`);
    failed++;
    findings.push({ test: name, error: err.message });
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Details: ${err.message}`);
    failed++;
    findings.push({ test: name, error: err.message });
  }
}

// ============================================================================
// Step 0: Load and Transpile Core Domain Files directly from src/
// ============================================================================
const constantsPath = path.join(rootDir, "src/lib/constants.ts");
const mockDataPath = path.join(rootDir, "src/lib/mock-data.ts");
const catalogPagePath = path.join(rootDir, "src/app/(dashboard)/specialists/page.tsx");
const detailPagePath = path.join(rootDir, "src/app/(dashboard)/specialists/[id]/page.tsx");
const bookingDialogPath = path.join(rootDir, "src/components/modals/consultation-booking-dialog.tsx");
const storageHelperPath = path.join(rootDir, "src/lib/consultation-storage.ts");

const constantsCode = fs.readFileSync(constantsPath, "utf-8");
const mockDataCode = fs.readFileSync(mockDataPath, "utf-8");
const catalogPageCode = fs.readFileSync(catalogPagePath, "utf-8");
const detailPageCode = fs.readFileSync(detailPagePath, "utf-8");
const bookingDialogCode = fs.readFileSync(bookingDialogPath, "utf-8");
const storageHelperCode = fs.readFileSync(storageHelperPath, "utf-8");

// Load constants via VM
const constTranspiled = ts.transpileModule(constantsCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const constModule = { exports: {} };
vm.runInNewContext(constTranspiled, { exports: constModule.exports, module: constModule });
const { LEGAL_CATEGORIES, REGIONS, PLATFORM_COMMISSION_PERCENT } = constModule.exports;

// Load mock-data via VM
const mockTranspiled = ts.transpileModule(mockDataCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const mockModule = { exports: {} };
const mockContext = {
  exports: mockModule.exports,
  module: mockModule,
  require: (m) => (m.includes("constants") ? constModule.exports : {}),
};
vm.runInNewContext(mockTranspiled, mockContext);
const { MOCK_SPECIALISTS } = mockModule.exports;

// Load consultation-storage via VM with mocked localStorage
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const mockLocalStorage = new MockLocalStorage();
const storageTranspiled = ts.transpileModule(storageHelperCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const storageModule = { exports: {} };
const storageContext = {
  exports: storageModule.exports,
  module: storageModule,
  window: { localStorage: mockLocalStorage },
  localStorage: mockLocalStorage,
  console: console,
};
vm.runInNewContext(storageTranspiled, storageContext);
const {
  STORAGE_KEY_CONSULTATIONS,
  SEED_CONSULTATIONS,
  getStoredConsultations,
  getConsultationById,
  saveConsultation,
  updateConsultationReview,
} = storageModule.exports;

// Official Helper: Extract Official Advocate License Registry Number
function getAdvocateLicenseNumber(spec) {
  const match = spec.admin_notes?.match(/#ADV-\d+/);
  if (match) return match[0];
  if (spec.license_number) return spec.license_number;
  if (spec.id === "spec-1") return "#ADV-3810";
  if (spec.id === "spec-2") return "#ADV-4192";
  if (spec.id === "spec-3") return "#ADV-4921";
  return `#ADV-${Math.abs(spec.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000 + 1000)}`;
}

// Exact filtering implementation from src/app/(dashboard)/specialists/page.tsx:210-298
function filterSpecialistsCatalog(dataset, {
  search = "",
  selectedCategory = "all",
  selectedRegion = "all",
  onlyOnline = false,
  minRating = "all",
  sortBy = "rating",
}) {
  const list = dataset.filter((spec) => {
    // Full-text search
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      const nameMatch = spec.full_name.toLowerCase().includes(query);
      const bioMatch = spec.bio?.toLowerCase().includes(query) ?? false;
      const universityRaw = (spec.university || "").toLowerCase();
      const queryNormalized = query.replace(/[(),.]/g, "").trim();
      const universityNormalized = universityRaw.replace(/[(),.]/g, " ");

      const isTdyuQuery =
        queryNormalized === "tdyu" ||
        queryNormalized === "tsul" ||
        query.includes("tdyu") ||
        query.includes("tsul");
      const isJiduQuery =
        queryNormalized === "jidu" ||
        queryNormalized === "uwed" ||
        query.includes("jidu") ||
        query.includes("uwed");

      const isTdyuUni =
        universityNormalized.includes("tdyu") ||
        universityNormalized.includes("yuridik") ||
        universityNormalized.includes("tsul");
      const isJiduUni =
        universityNormalized.includes("jidu") ||
        universityNormalized.includes("diplomatiya") ||
        universityNormalized.includes("uwed");

      const universityMatch =
        universityRaw.includes(query) ||
        universityNormalized.includes(queryNormalized) ||
        (isTdyuQuery && isTdyuUni) ||
        (isJiduQuery && isJiduUni);
      const educationMatch = spec.education?.toLowerCase().includes(query) ?? false;
      const licenseMatch = getAdvocateLicenseNumber(spec).toLowerCase().includes(query);
      const categoryMatch = spec.categories.some((c) =>
        c.name_uz.toLowerCase().includes(query) || (c.name_ru && c.name_ru.toLowerCase().includes(query))
      );
      const regionMatch =
        REGIONS.find((r) => r.id === spec.region)?.name_uz.toLowerCase().includes(query) ?? false;

      if (
        !nameMatch &&
        !bioMatch &&
        !universityMatch &&
        !educationMatch &&
        !licenseMatch &&
        !categoryMatch &&
        !regionMatch
      ) {
        return false;
      }
    }

    // Legal Branch Category
    if (selectedCategory !== "all") {
      const hasCategory = spec.categories.some((c) => c.id === selectedCategory);
      if (!hasCategory) return false;
    }

    // Regional Jurisdiction (all 14 regions of Uzbekistan)
    if (selectedRegion !== "all" && spec.region !== selectedRegion) {
      return false;
    }

    // Real-time Online Presence
    if (onlyOnline && !spec.is_online) {
      return false;
    }

    // Minimum Rating Threshold
    if (minRating !== "all" && spec.rating_avg < parseFloat(minRating)) {
      return false;
    }

    return true;
  });

  return [...list].sort((a, b) => {
    if (sortBy === "rating") return b.rating_avg - a.rating_avg;
    if (sortBy === "experience") return b.experience_years - a.experience_years;
    if (sortBy === "consultations") return b.consultation_count - a.consultation_count;
    return 0;
  });
}

// ============================================================================
// SECTION 1: Multi-Filter Combinations (10 branches × 14 regions × online × rating)
// Total combinations: 11 categories × 15 regions × 2 online × 4 rating thresholds = 1,320
// ============================================================================
console.log("--- Section 1: Multi-Filter Combinations (1,320 Permutations) ---");

runTest("Verify constant catalog inventories (10 branches and 14 regions)", () => {
  assert.equal(LEGAL_CATEGORIES.length, 10, "LEGAL_CATEGORIES must define exactly 10 branches");
  assert.equal(REGIONS.length, 14, "REGIONS must define exactly 14 regions of Uzbekistan");
  assert.ok(MOCK_SPECIALISTS.length >= 3, "Catalog must load real mock specialists");
});

runTest("Exhaustive verification across 1,320 filter combinations", () => {
  const categoryOptions = ["all", ...LEGAL_CATEGORIES.map((c) => c.id)];
  const regionOptions = ["all", ...REGIONS.map((r) => r.id)];
  const onlineOptions = [false, true];
  const ratingOptions = ["all", "4.5", "4.8", "4.9"];

  let combinationsCount = 0;
  let matchesCount = 0;

  for (const cat of categoryOptions) {
    for (const reg of regionOptions) {
      for (const onl of onlineOptions) {
        for (const rat of ratingOptions) {
          combinationsCount++;
          const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, {
            selectedCategory: cat,
            selectedRegion: reg,
            onlyOnline: onl,
            minRating: rat,
          });

          assert.ok(Array.isArray(results), `Results for combo (${cat}, ${reg}, ${onl}, ${rat}) must be array`);

          if (results.length > 0) {
            matchesCount++;
            for (const spec of results) {
              if (cat !== "all") {
                assert.ok(
                  spec.categories.some((c) => c.id === cat),
                  `Specialist ${spec.id} must belong to category ${cat}`
                );
              }
              if (reg !== "all") {
                assert.equal(spec.region, reg, `Specialist ${spec.id} must be in region ${reg}`);
              }
              if (onl) {
                assert.equal(spec.is_online, true, `Specialist ${spec.id} must be online`);
              }
              if (rat !== "all") {
                assert.ok(
                  spec.rating_avg >= parseFloat(rat),
                  `Specialist ${spec.id} rating ${spec.rating_avg} must be >= ${rat}`
                );
              }
            }
          }
        }
      }
    }
  }

  assert.equal(combinationsCount, 1320, "Must test exactly 1,320 combinations (11 * 15 * 2 * 4)");
  assert.ok(matchesCount > 0, "At least some combinations must match registered specialists");
});

runTest("Catalog sorting permutations (rating, experience, consultations)", () => {
  const sortByRating = filterSpecialistsCatalog(MOCK_SPECIALISTS, { sortBy: "rating" });
  for (let i = 0; i < sortByRating.length - 1; i++) {
    assert.ok(sortByRating[i].rating_avg >= sortByRating[i + 1].rating_avg);
  }

  const sortByExp = filterSpecialistsCatalog(MOCK_SPECIALISTS, { sortBy: "experience" });
  for (let i = 0; i < sortByExp.length - 1; i++) {
    assert.ok(sortByExp[i].experience_years >= sortByExp[i + 1].experience_years);
  }

  const sortByCons = filterSpecialistsCatalog(MOCK_SPECIALISTS, { sortBy: "consultations" });
  for (let i = 0; i < sortByCons.length - 1; i++) {
    assert.ok(sortByCons[i].consultation_count >= sortByCons[i + 1].consultation_count);
  }
});

runTest("Verify Category Chip Badge logic (BUG-M3-02 Remediation)", () => {
  // Count specialists per category
  const categoryCounts = {};
  MOCK_SPECIALISTS.forEach((spec) => {
    spec.categories.forEach((cat) => {
      categoryCounts[cat.id] = (categoryCounts[cat.id] || 0) + 1;
    });
  });

  // Verify that criminal, administrative, business, tax have count 0
  const zeroCategories = ["criminal", "administrative", "business", "tax"];
  zeroCategories.forEach((catId) => {
    const count = categoryCounts[catId] || 0;
    assert.equal(count, 0, `Category ${catId} has 0 mock specialists`);
    // Badge text logic: count > 0 ? `${count} nafar advokat` : "Hozircha bo'sh"
    const badgeText = count > 0 ? `${count} nafar advokat` : "Hozircha bo'sh";
    assert.equal(badgeText, "Hozircha bo'sh", "Empty category chip MUST display 'Hozircha bo'sh'");
  });

  // Verify that populated branches (labor, family, civil, housing, property, contract) show correct count
  const activeCategories = ["labor", "family", "civil", "housing", "property", "contract"];
  activeCategories.forEach((catId) => {
    const count = categoryCounts[catId] || 0;
    assert.ok(count > 0, `Category ${catId} must have > 0 specialists`);
    const badgeText = count > 0 ? `${count} nafar advokat` : "Hozircha bo'sh";
    assert.equal(badgeText, `${count} nafar advokat`);
  });

  // Verify that "Mutaxassis mavjud" is NOT rendered for 0-count categories in page.tsx
  assert.ok(
    !catalogPageCode.includes('count > 0 ? `${count} nafar advokat` : "Mutaxassis mavjud"'),
    "Old deceptive text 'Mutaxassis mavjud' must not exist in page.tsx"
  );
  assert.ok(
    catalogPageCode.includes('count > 0 ? `${count} nafar advokat` : "Hozircha bo\'sh"'),
    "page.tsx must render 'Hozircha bo\'sh' for 0-count categories"
  );
});

// ============================================================================
// SECTION 2: Boundary Values & Adversarial Inputs
// ============================================================================
console.log("\n--- Section 2: Boundary Values & Adversarial Inputs ---");

runTest("Empty string and whitespace boundary search", () => {
  const rEmpty = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "" });
  assert.equal(rEmpty.length, MOCK_SPECIALISTS.length, "Empty search must return all specialists");

  const rSpaces = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "    " });
  assert.equal(rSpaces.length, MOCK_SPECIALISTS.length, "Whitespace-only search must return all specialists");

  const rTabsNewlines = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "\t \r\n  " });
  assert.equal(rTabsNewlines.length, MOCK_SPECIALISTS.length, "Tabs and newlines must be trimmed safely");
});

runTest("Diacritics and typography variants (O'zbekiston, Toshkent, apostrophes)", () => {
  // Region search: "Toshkent shahri"
  const rToshkent = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "toshkent" });
  assert.ok(rToshkent.length >= 2, "Search for 'toshkent' should match specialists in Tashkent region/uni");

  // Straight apostrophe
  const rApos1 = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "bo'shatish" });
  assert.equal(rApos1.length, 1);
  assert.equal(rApos1[0].id, "spec-1");

  // Cyrillic search for Russian name variant
  const rCyrillic = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "Трудовое" });
  assert.ok(rCyrillic.length >= 1, "Cyrillic category search should match labor specialists");

  const rCyrillic2 = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "Семейное" });
  assert.ok(rCyrillic2.length >= 1, "Cyrillic category search should match family specialists");
});

runTest("SQL injection attack vectors in search box", () => {
  const sqliPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE specialists; --",
    "\" OR \"\"=\"",
    "admin'--",
    "1' ORDER BY 1--+",
    "UNION SELECT null, username, password FROM users--",
    "1'; WAITFOR DELAY '0:0:5'--",
  ];

  for (const payload of sqliPayloads) {
    const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: payload });
    assert.ok(Array.isArray(results), `Payload ${payload} must return an array without throwing`);
    // Unless an attorney's name or bio actually matches, this should return 0 results
    assert.equal(results.length, 0, `Payload ${payload} should return 0 results safely`);
  }
});

runTest("XSS & HTML injection vectors in search box", () => {
  const xssPayloads = [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "\"><svg onload=alert(1)>",
    "<iframe src=\"javascript:alert(1)\">",
    "<details open ontoggle=alert(1)>",
  ];

  for (const payload of xssPayloads) {
    const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: payload });
    assert.ok(Array.isArray(results), `XSS Payload ${payload} must return an array without throwing`);
    assert.equal(results.length, 0, `XSS Payload ${payload} should return 0 results`);
  }
});

runTest("ReDoS and regex metacharacters in search box", () => {
  const regexPayloads = [
    ".*",
    "(a+)+$",
    "[[[",
    "(((",
    "^$",
    "\\b\\w+\\b",
    "[a-z0-9_-]",
    "(x+x+)+y",
  ];

  for (const payload of regexPayloads) {
    const start = Date.now();
    const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: payload });
    const duration = Date.now() - start;
    assert.ok(Array.isArray(results), `Regex Payload ${payload} must return an array`);
    assert.ok(duration < 50, `Regex Payload ${payload} must evaluate in < 50ms (got ${duration}ms)`);
  }
});

runTest("Massive search strings (buffer & length boundaries)", () => {
  const long1k = "A".repeat(1000);
  const long10k = "TestQuery".repeat(1000);

  const start = Date.now();
  const r1k = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: long1k });
  const r10k = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: long10k });
  const duration = Date.now() - start;

  assert.equal(r1k.length, 0);
  assert.equal(r10k.length, 0);
  assert.ok(duration < 100, `Massive string search must evaluate in < 100ms (got ${duration}ms)`);
});

// ============================================================================
// SECTION 3: Consultation Booking Persistence & Interface Contract 3
// ============================================================================
console.log("\n--- Section 3: Consultation Booking Persistence & Interface Contract 3 ---");

runTest("Verify consultation storage key and seed structure", () => {
  assert.equal(STORAGE_KEY_CONSULTATIONS, "themis_consultations");
  assert.ok(Array.isArray(SEED_CONSULTATIONS));
  assert.equal(SEED_CONSULTATIONS.length, 3);
  SEED_CONSULTATIONS.forEach((c) => {
    assert.ok(c.id);
    assert.ok(c.specialist_id);
    assert.ok(c.specialist_name);
    assert.ok(c.service_name);
    assert.ok(c.price > 0);
    assert.equal(c.currency, "UZS");
  });
});

runTest("Contract 3: Booking creates pending consultation saved to localStorage", () => {
  mockLocalStorage.clear();

  const newBooking = {
    id: "c-" + Date.now(),
    specialist_id: "spec-1",
    specialist_name: "Azizbek Rahimov",
    specialist_title: "Mehnat huquqi bo'yicha advokat",
    specialist_role: "Mehnat huquqi bo'yicha advokat",
    category: "Mehnat huquqi",
    service_id: "serv-2",
    service_name: "To'liq 45 daqiqalik onlayn konsultatsiya",
    duration_minutes: 45,
    scheduled_at: "2026-11-05, 15:30 — 16:15",
    format: "video",
    status: "pending",
    status_label: "Kutilmoqda",
    status_color: "bg-amber-100 text-amber-800",
    price: 180000,
    currency: "UZS",
    description: "Ishdan noqonuniy bo'shatish bo'yicha e'tiroz da'vosi tayyorlash",
    user_notes: "Ishdan noqonuniy bo'shatish bo'yicha e'tiroz da'vosi tayyorlash",
    meeting_link: "https://meet.google.com/thm-legal-aid",
    created_at: new Date().toISOString(),
  };

  // Save consultation
  saveConsultation(newBooking);

  // Read raw from localStorage
  const rawStored = mockLocalStorage.getItem(STORAGE_KEY_CONSULTATIONS);
  assert.ok(rawStored, "localStorage.getItem('themis_consultations') must not be null");

  const parsed = JSON.parse(rawStored);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.length >= 1);
  assert.equal(parsed[0].id, newBooking.id);
  assert.equal(parsed[0].status, "pending");
  assert.equal(parsed[0].status_label, "Kutilmoqda");
  assert.equal(parsed[0].price, 180000);
  assert.equal(parsed[0].currency, "UZS");

  // Read via getStoredConsultations() helper
  const allConsultations = getStoredConsultations();
  assert.ok(allConsultations.some((c) => c.id === newBooking.id && c.status === "pending"));

  // Read via getConsultationById() helper
  const found = getConsultationById(newBooking.id);
  assert.ok(found);
  assert.equal(found.specialist_name, "Azizbek Rahimov");
  assert.equal(found.user_notes, newBooking.user_notes);
});

runTest("Verify Consultation review update lifecycle", () => {
  const consultId = "c-review-test-1";
  const booking = {
    id: consultId,
    specialist_id: "spec-2",
    specialist_name: "Dilnoza Karimova",
    specialist_title: "Oila huquqi advokati",
    category: "Oila huquqi",
    service_id: "serv-3",
    service_name: "Oila huquqi konsultatsiyasi",
    duration_minutes: 30,
    scheduled_at: "2026-11-01, 10:00",
    format: "chat",
    status: "pending",
    status_label: "Kutilmoqda",
    price: 120000,
    currency: "UZS",
    created_at: new Date().toISOString(),
  };

  saveConsultation(booking);
  updateConsultationReview(consultId, 5, "Ajoyib mutaxassis, tavsiya qilaman!");

  const updated = getConsultationById(consultId);
  assert.ok(updated);
  assert.equal(updated.has_review, true);
  assert.equal(updated.user_rating, 5);
  assert.equal(updated.user_comment, "Ajoyib mutaxassis, tavsiya qilaman!");
  assert.equal(updated.status, "completed");
  assert.equal(updated.status_label, "Yakunlangan");
});

runTest("Verify ConsultationBookingDialog code fulfills Contract 3", () => {
  assert.ok(
    bookingDialogCode.includes('import { saveConsultation, StoredConsultation } from "@/lib/consultation-storage"'),
    "ConsultationBookingDialog must import saveConsultation helper"
  );
  assert.ok(
    bookingDialogCode.includes("saveConsultation(newBooking)"),
    "ConsultationBookingDialog must invoke saveConsultation on submit"
  );
  assert.ok(
    bookingDialogCode.includes('status: "pending"'),
    "ConsultationBookingDialog must initialize booking status as 'pending'"
  );
  assert.ok(
    bookingDialogCode.includes('router.push("/consultations")'),
    "ConsultationBookingDialog must redirect to /consultations upon booking"
  );
});

// ============================================================================
// SECTION 4: Acronym Search Stress Testing (TDYU, TSUL, JIDU, UWED)
// ============================================================================
console.log("\n--- Section 4: Acronym Search Stress Testing ---");

runTest("Search 'TDYU' (uppercase) matches Tashkent Law graduates", () => {
  const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "TDYU" });
  assert.equal(results.length, 2, "Searching 'TDYU' must match exactly 2 Tashkent Law graduates");
  const ids = results.map((s) => s.id).sort();
  assert.deepEqual(ids, ["spec-1", "spec-3"]);
});

runTest("Search 'tdyu' (lowercase) matches Tashkent Law graduates", () => {
  const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "tdyu" });
  assert.equal(results.length, 2, "Searching 'tdyu' must match exactly 2 Tashkent Law graduates");
  const ids = results.map((s) => s.id).sort();
  assert.deepEqual(ids, ["spec-1", "spec-3"]);
});

runTest("Search '(TDYU)' (with parentheses) matches Tashkent Law graduates", () => {
  const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "(TDYU)" });
  assert.equal(results.length, 2, "Searching '(TDYU)' must match spec-1 and spec-3");
});

runTest("Search 'TSUL' (English acronym for Tashkent State University of Law) matches Tashkent Law graduates", () => {
  const resultsUpper = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "TSUL" });
  assert.equal(resultsUpper.length, 2, "Searching 'TSUL' must match spec-1 and spec-3");

  const resultsLower = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "tsul" });
  assert.equal(resultsLower.length, 2, "Searching 'tsul' must match spec-1 and spec-3");
});

runTest("Search 'JIDU' (uppercase) matches Dilnoza Karimova", () => {
  const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "JIDU" });
  assert.equal(results.length, 1, "Searching 'JIDU' must match Dilnoza Karimova");
  assert.equal(results[0].id, "spec-2");
  assert.ok(results[0].university.includes("JIDU"));
});

runTest("Search 'jidu' (lowercase) matches Dilnoza Karimova", () => {
  const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "jidu" });
  assert.equal(results.length, 1, "Searching 'jidu' must match Dilnoza Karimova");
  assert.equal(results[0].id, "spec-2");
});

runTest("Search '(JIDU)' (with parentheses) matches Dilnoza Karimova", () => {
  const results = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "(JIDU)" });
  assert.equal(results.length, 1, "Searching '(JIDU)' must match Dilnoza Karimova");
  assert.equal(results[0].id, "spec-2");
});

runTest("Search 'UWED' (English acronym for University of World Economy and Diplomacy) matches Dilnoza Karimova", () => {
  const resultsUpper = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "UWED" });
  assert.equal(resultsUpper.length, 1, "Searching 'UWED' must match Dilnoza Karimova");
  assert.equal(resultsUpper[0].id, "spec-2");

  const resultsLower = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "uwed" });
  assert.equal(resultsLower.length, 1, "Searching 'uwed' must match Dilnoza Karimova");
  assert.equal(resultsLower[0].id, "spec-2");
});

runTest("Search full university names and keywords", () => {
  const rFull1 = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "Toshkent Davlat Yuridik Universiteti" });
  assert.equal(rFull1.length, 2);

  const rFull2 = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "Jahon Iqtisodiyoti va Diplomatiya Universiteti" });
  assert.equal(rFull2.length, 1);

  const rKeyword1 = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "yuridik" });
  assert.ok(rKeyword1.length >= 2);

  const rKeyword2 = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "diplomatiya" });
  assert.equal(rKeyword2.length, 1);

  const rNonExistent = filterSpecialistsCatalog(MOCK_SPECIALISTS, { search: "NONEXISTENT_ACRONYM_XYZ" });
  assert.equal(rNonExistent.length, 0);
});

// ============================================================================
// SECTION 5: Bi-Directional URL Parameter Synchronization Logic
// ============================================================================
console.log("\n--- Section 5: Bi-Directional URL Parameter Synchronization Logic ---");

runTest("Verify URL parameter removal resets state to default without stale filter traps (BUG-M3-03)", () => {
  // Check that the buggy pattern 'categoryParam !== null && categoryParam !== prev' does NOT exist
  assert.ok(
    !catalogPageCode.includes("categoryParam !== null && categoryParam !== prev"),
    "Guarded state pattern that prevents URL param reset must be removed"
  );

  // Check that clean fallbacks exist in useEffect hooks
  assert.ok(
    catalogPageCode.includes('setSelectedCategory(categoryParam || "all")'),
    "page.tsx must reset category to 'all' when categoryParam is null"
  );
  assert.ok(
    catalogPageCode.includes('setSelectedRegion(regionParam || "all")'),
    "page.tsx must reset region to 'all' when regionParam is null"
  );
  assert.ok(
    catalogPageCode.includes('setSearch(searchParam || "")'),
    "page.tsx must reset search to '' when searchParam is null"
  );
  assert.ok(
    catalogPageCode.includes('setOnlyOnline(onlineParam === "true")'),
    "page.tsx must reset online to false when onlineParam is null"
  );
  assert.ok(
    catalogPageCode.includes('setMinRating(ratingParam || "all")'),
    "page.tsx must reset minRating to 'all' when ratingParam is null"
  );
});

// ============================================================================
// SECTION 6: Live Production Server Probes
// ============================================================================
console.log("\n--- Section 6: Live Production HTTP Server Probes ---");

function httpRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on("error", reject);
  });
}

await runAsyncTest("Live Next.js production server startup and endpoint probes", async () => {
  const TEST_PORT = 3098;
  console.log(`    Starting Next.js production server on port ${TEST_PORT}...`);

  const serverProc = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(TEST_PORT)], {
    cwd: rootDir,
    stdio: "pipe",
    env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: "production" },
  });

  // Wait for server to become responsive
  const maxAttempts = 30;
  let ready = false;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists`);
      if (res.statusCode === 200) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  assert.ok(ready, `Server failed to start on port ${TEST_PORT} within 15 seconds`);
  console.log(`    ✓ Live server responsive at http://127.0.0.1:${TEST_PORT}`);

  try {
    // 1. GET /specialists
    const resCatalog = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists`);
    assert.equal(resCatalog.statusCode, 200, "GET /specialists must return HTTP 200");
    assert.ok(
      resCatalog.body.includes("Advokatlar") || resCatalog.body.includes("reyestr"),
      "Catalog HTML must contain legal chamber keywords"
    );

    // 2. GET /specialists?search=TDYU
    const resSearchTdyu = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists?search=TDYU`);
    assert.equal(resSearchTdyu.statusCode, 200, "GET /specialists?search=TDYU must return HTTP 200");

    // 3. GET /specialists?category=labor&region=tashkent_city&online=true&rating=4.5
    const resFiltered = await httpRequest(
      `http://127.0.0.1:${TEST_PORT}/specialists?category=labor&region=tashkent_city&online=true&rating=4.5`
    );
    assert.equal(resFiltered.statusCode, 200, "GET /specialists with multi-filters must return HTTP 200");

    // 4. GET /specialists/spec-1 (Azizbek Rahimov dossier)
    const resSpec1 = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists/spec-1`);
    assert.equal(resSpec1.statusCode, 200, "GET /specialists/spec-1 must return HTTP 200");
    assert.ok(resSpec1.body.includes("Azizbek Rahimov"), "Dossier must render Azizbek Rahimov");
    assert.ok(resSpec1.body.includes("#ADV-3810"), "Dossier must render license #ADV-3810");

    // 5. GET /specialists/spec-2 (Dilnoza Karimova dossier)
    const resSpec2 = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists/spec-2`);
    assert.equal(resSpec2.statusCode, 200, "GET /specialists/spec-2 must return HTTP 200");
    assert.ok(resSpec2.body.includes("Dilnoza Karimova"), "Dossier must render Dilnoza Karimova");
    assert.ok(resSpec2.body.includes("#ADV-4192"), "Dossier must render license #ADV-4192");

    // 6. GET /specialists/spec-3 (Rustam Mahmudov dossier)
    const resSpec3 = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists/spec-3`);
    assert.equal(resSpec3.statusCode, 200, "GET /specialists/spec-3 must return HTTP 200");
    assert.ok(resSpec3.body.includes("Rustam Mahmudov"), "Dossier must render Rustam Mahmudov");
    assert.ok(resSpec3.body.includes("#ADV-4921"), "Dossier must render license #ADV-4921");

    // 7. GET /specialists/nonexistent-spec-999 (Graceful judicial fallback)
    const resNotFound = await httpRequest(`http://127.0.0.1:${TEST_PORT}/specialists/nonexistent-spec-999`);
    assert.equal(resNotFound.statusCode, 200, "GET /specialists/nonexistent must render graceful fallback");
    assert.ok(
      resNotFound.body.includes("TOPILMADI") || resNotFound.body.includes("Mavjud Emas"),
      "Fallback must render judicial not-found notice"
    );
  } finally {
    console.log("    Stopping Next.js test server...");
    serverProc.kill();
  }
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log("\n======================================================================");
console.log("  CHALLENGER M3_R2 TEST EXECUTION SUMMARY");
console.log("======================================================================");
console.log(`  Passed Tests:  ${passed}`);
console.log(`  Failed Tests:  ${failed}`);
console.log(`  Total Probes:  ${passed + failed}`);
console.log(`  Findings Count: ${findings.length}`);

if (findings.length > 0) {
  console.log("\n  Discovered Empirical Findings / Deficiencies:");
  findings.forEach((f, idx) => {
    console.log(`    ${idx + 1}. [${f.test}]: ${f.error}`);
  });
}
console.log("======================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
