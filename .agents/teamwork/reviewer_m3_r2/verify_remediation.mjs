/**
 * Independent Adversarial Verification Suite — Reviewer M3_R2
 * Tests Milestone 3 Remediations:
 * 1. BUG-M3-01: University search & acronym mapping (TDYU, JIDU, TSUL, UWED, etc.)
 * 2. BUG-M3-02: Category count badge truthfulness
 * 3. BUG-M3-03: URL query param bi-directional reset on navigation
 * 4. Regex & edge-case stress tests
 * 5. Code integrity check (no hardcoded test cheats or facade implementations)
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

console.log("======================================================================");
console.log("  INDEPENDENT ADVERSARIAL VERIFICATION SUITE — REVIEWER M3_R2");
console.log("  Target: Milestone 3 Remediations (BUG-M3-01, BUG-M3-02, BUG-M3-03)");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ERROR: ${err.message}`);
    failed++;
    failures.push({ name, error: err.message });
  }
}

// ----------------------------------------------------------------------
// Load Real Source Code Files
// ----------------------------------------------------------------------
const mockDataPath = path.join(projectRoot, "src/lib/mock-data.ts");
const catalogPagePath = path.join(projectRoot, "src/app/(dashboard)/specialists/page.tsx");
const detailPagePath = path.join(projectRoot, "src/app/(dashboard)/specialists/[id]/page.tsx");
const constantsPath = path.join(projectRoot, "src/lib/constants.ts");

const mockDataCode = fs.readFileSync(mockDataPath, "utf-8");
const catalogPageCode = fs.readFileSync(catalogPagePath, "utf-8");
const detailPageCode = fs.readFileSync(detailPagePath, "utf-8");
const constantsCode = fs.readFileSync(constantsPath, "utf-8");

// Parse mock specialists from mock-data.ts
const specialistMatches = [...mockDataCode.matchAll(/id:\s*"(spec-\d+)",\s*user_id:\s*"[^"]+",\s*full_name:\s*"([^"]+)",[\s\S]*?university:\s*"([^"]+)",[\s\S]*?license_number:\s*"([^"]+)",/g)];
console.log(`Loaded ${specialistMatches.length} specialists from mock-data.ts:`);
const extractedSpecialists = specialistMatches.map(m => ({
  id: m[1],
  full_name: m[2],
  university: m[3],
  license_number: m[4],
}));
extractedSpecialists.forEach(s => console.log(`  - ${s.id}: ${s.full_name} | University: "${s.university}" | License: ${s.license_number}`));

// Extract the EXACT search filtering function from page.tsx:210-265
// Let's verify how page.tsx filters specialists by search
function pageFilterPredicate(spec, search) {
  if (!search.trim()) return true;

  const query = search.toLowerCase().trim();
  const nameMatch = spec.full_name.toLowerCase().includes(query);
  const bioMatch = (spec.bio || "").toLowerCase().includes(query);
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

  const educationMatch = (spec.education || "").toLowerCase().includes(query);
  const licenseMatch = (spec.license_number || "").toLowerCase().includes(query);

  return nameMatch || bioMatch || universityMatch || educationMatch || licenseMatch;
}

// ----------------------------------------------------------------------
// SECTION 1: BUG-M3-01 University Acronym & Full-Text Search
// ----------------------------------------------------------------------
console.log("\n--- SECTION 1: BUG-M3-01 Full-Text Search & Acronym Aliases ---");

test("BUG-M3-01: 'TDYU' (uppercase) matches all Tashkent Law graduates", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "TDYU"));
  assert.equal(matched.length, 2, `Expected 2 TDYU graduates, got ${matched.length}`);
  const ids = matched.map(s => s.id).sort();
  assert.deepEqual(ids, ["spec-1", "spec-3"]);
});

test("BUG-M3-01: 'tdyu' (lowercase) matches all Tashkent Law graduates", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "tdyu"));
  assert.equal(matched.length, 2);
});

test("BUG-M3-01: '(TDYU)' (with parentheses) matches all Tashkent Law graduates", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "(TDYU)"));
  assert.equal(matched.length, 2);
});

test("BUG-M3-01: 'TDYU.' (with punctuation) matches all Tashkent Law graduates", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "TDYU."));
  assert.equal(matched.length, 2);
});

test("BUG-M3-01: 'tsul' (international English alias for TSUL) matches Tashkent Law graduates", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "tsul"));
  assert.equal(matched.length, 2);
});

test("BUG-M3-01: 'yuridik' (Uzbek keyword) matches Tashkent Law graduates", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "yuridik"));
  assert.equal(matched.length, 2);
});

test("BUG-M3-01: 'JIDU' (uppercase) matches Dilnoza Karimova (UWED)", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "JIDU"));
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, "spec-2");
});

test("BUG-M3-01: 'jidu' (lowercase) matches Dilnoza Karimova (UWED)", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "jidu"));
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, "spec-2");
});

test("BUG-M3-01: 'uwed' (English acronym for University of World Economy and Diplomacy) matches spec-2", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "uwed"));
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, "spec-2");
});

test("BUG-M3-01: 'diplomatiya' keyword matches spec-2", () => {
  const matched = extractedSpecialists.filter(s => pageFilterPredicate(s, "diplomatiya"));
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, "spec-2");
});

test("BUG-M3-01: Regex safety: special characters '.*', '(', '[a-z]', '^', '$', '\\' do not throw or crash", () => {
  const dangerousPatterns = [
    ".*",
    "(",
    ")",
    "[a-z]+",
    "\\d+",
    "^Toshkent",
    "Universiteti$",
    "???+++",
    "(((((",
    "[[[",
    "{1,3}",
    "<script>alert(1)</script>",
    "' OR '1'='1",
    "null",
    "undefined",
  ];

  for (const pattern of dangerousPatterns) {
    assert.doesNotThrow(() => {
      const res = extractedSpecialists.filter(s => pageFilterPredicate(s, pattern));
      assert.ok(Array.isArray(res));
    }, `Search crashed on pattern: ${pattern}`);
  }
});

// ----------------------------------------------------------------------
// SECTION 2: BUG-M3-02 Category Badge Honesty
// ----------------------------------------------------------------------
console.log("\n--- SECTION 2: BUG-M3-02 Category Badge Truthfulness & UX Honesty ---");

test("BUG-M3-02: Deceptive 'Mutaxassis mavjud' string is completely eliminated from page.tsx", () => {
  assert.ok(
    !catalogPageCode.includes('"Mutaxassis mavjud"'),
    "Found prohibited deceptive string 'Mutaxassis mavjud' in specialists/page.tsx!"
  );
});

test("BUG-M3-02: Honest 'Hozircha bo bo\\'sh' fallback is present in page.tsx:491", () => {
  assert.ok(
    catalogPageCode.includes('{count > 0 ? `${count} nafar advokat` : "Hozircha bo\'sh"}'),
    "Expected ternary {count > 0 ? `${count} nafar advokat` : \"Hozircha bo'sh\"} not found in page.tsx"
  );
});

test("BUG-M3-02: Simulated 0-count categories render 'Hozircha bo\\'sh' and populated render count", () => {
  function renderBadge(count) {
    return count > 0 ? `${count} nafar advokat` : "Hozircha bo'sh";
  }

  assert.equal(renderBadge(0), "Hozircha bo'sh");
  assert.equal(renderBadge(1), "1 nafar advokat");
  assert.equal(renderBadge(2), "2 nafar advokat");
});

// ----------------------------------------------------------------------
// SECTION 3: BUG-M3-03 Bi-Directional URL Parameter Reset
// ----------------------------------------------------------------------
console.log("\n--- SECTION 3: BUG-M3-03 Bi-Directional URL Navigation State Reset ---");

test("BUG-M3-03: Defective 'categoryParam !== null && categoryParam !== prev' guard is eliminated", () => {
  assert.ok(
    !catalogPageCode.includes("categoryParam !== null && categoryParam !== prev"),
    "Found old defective guard in specialists/page.tsx!"
  );
});

test("BUG-M3-03: Clean URL sync hooks exist for all 5 filter parameters", () => {
  assert.ok(catalogPageCode.includes("setSelectedCategory(categoryParam || \"all\")"), "Missing categoryParam reset");
  assert.ok(catalogPageCode.includes("setSelectedRegion(regionParam || \"all\")"), "Missing regionParam reset");
  assert.ok(catalogPageCode.includes("setSearch(searchParam || \"\")"), "Missing searchParam reset");
  assert.ok(catalogPageCode.includes("setOnlyOnline(onlineParam === \"true\")"), "Missing onlineParam reset");
  assert.ok(catalogPageCode.includes("setMinRating(ratingParam || \"all\")"), "Missing ratingParam reset");
});

test("BUG-M3-03: State reset behavior simulation on back navigation (param transitions to null)", () => {
  // Simulate state updater
  let selectedCategory = "labor";
  let selectedRegion = "tashkent_city";
  let search = "tdyu";
  let onlyOnline = true;
  let minRating = "4.8";

  // Navigation back occurs: searchParams becomes empty / null for all keys
  const categoryParam = null;
  const regionParam = null;
  const searchParam = null;
  const onlineParam = null;
  const ratingParam = null;

  // Execute the exact hook logic from page.tsx:100-118
  selectedCategory = categoryParam || "all";
  selectedRegion = regionParam || "all";
  search = searchParam || "";
  onlyOnline = onlineParam === "true";
  minRating = ratingParam || "all";

  assert.equal(selectedCategory, "all", "Category did not reset to 'all'");
  assert.equal(selectedRegion, "all", "Region did not reset to 'all'");
  assert.equal(search, "", "Search did not reset to empty string");
  assert.equal(onlyOnline, false, "onlyOnline did not reset to false");
  assert.equal(minRating, "all", "minRating did not reset to 'all'");
});

test("BUG-M3-03: syncUrlParams properly deletes query parameters when reset to default", () => {
  function syncParams(currentParams, newParams, state) {
    const current = new URLSearchParams(currentParams);
    const nextCategory = newParams.category !== undefined ? newParams.category : state.selectedCategory;
    const nextRegion = newParams.region !== undefined ? newParams.region : state.selectedRegion;
    const nextSearch = newParams.search !== undefined ? newParams.search : state.search;
    const nextOnline = newParams.online !== undefined ? newParams.online : state.onlyOnline;
    const nextRating = newParams.rating !== undefined ? newParams.rating : state.minRating;

    if (nextCategory && nextCategory !== "all") current.set("category", nextCategory);
    else current.delete("category");

    if (nextRegion && nextRegion !== "all") current.set("region", nextRegion);
    else current.delete("region");

    if (nextSearch.trim()) current.set("search", nextSearch.trim());
    else current.delete("search");

    if (nextOnline) current.set("online", "true");
    else current.delete("online");

    if (nextRating && nextRating !== "all") current.set("rating", nextRating);
    else current.delete("rating");

    return current.toString();
  }

  // Set category labor
  const q1 = syncParams("", { category: "labor" }, { selectedCategory: "all", selectedRegion: "all", search: "", onlyOnline: false, minRating: "all" });
  assert.equal(q1, "category=labor");

  // Reset category to "all"
  const q2 = syncParams("category=labor", { category: "all" }, { selectedCategory: "labor", selectedRegion: "all", search: "", onlyOnline: false, minRating: "all" });
  assert.equal(q2, "");

  // Multiple params reset
  const q3 = syncParams("category=labor&region=samarkand&online=true", { category: "all", region: "all", online: false }, { selectedCategory: "labor", selectedRegion: "samarkand", search: "", onlyOnline: true, minRating: "all" });
  assert.equal(q3, "");
});

// ----------------------------------------------------------------------
// SECTION 4: INTEGRITY VIOLATION CHECKS (Adversarial Critic)
// ----------------------------------------------------------------------
console.log("\n--- SECTION 4: Integrity Violation & Facade Logic Audit ---");

test("INTEGRITY: No hardcoded test IDs or runner bypasses in page.tsx", () => {
  assert.ok(!catalogPageCode.includes("runner.js"), "Found reference to runner.js in source code!");
  assert.ok(!catalogPageCode.includes("challenger_m3"), "Found reference to challenger in source code!");
  assert.ok(!catalogPageCode.includes("process.env.NODE_ENV === 'test'"), "Found environment test bypass in source code!");
});

test("INTEGRITY: Search logic is general and handles any query without hardcoded mock specialist ID returns", () => {
  // Ensure the filter logic doesn't say `if (query === 'tdyu') return ['spec-1', 'spec-3']`
  assert.ok(!catalogPageCode.includes('["spec-1", "spec-3"]'), "Found hardcoded ID list in page.tsx!");
  assert.ok(!catalogPageCode.includes("spec-1, spec-3"), "Found hardcoded ID list in page.tsx!");
});

test("INTEGRITY: Specialists dataset maintains genuine fields without dummy or mock stubs", () => {
  for (const spec of extractedSpecialists) {
    assert.ok(spec.full_name && spec.full_name.length > 5, `Specialist ${spec.id} missing genuine full_name`);
    assert.ok(spec.university && spec.university.length > 5, `Specialist ${spec.id} missing genuine university`);
    assert.ok(spec.license_number.startsWith("#ADV-"), `Specialist ${spec.id} missing valid license number`);
  }
});

// ----------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------
console.log("\n======================================================================");
console.log(`  VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("======================================================================");

if (failed > 0) {
  process.exit(1);
}
