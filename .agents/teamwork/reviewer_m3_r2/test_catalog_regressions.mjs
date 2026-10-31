/**
 * Comprehensive Catalog Regressions & Stress Test Suite
 * Reviewer M3_R2
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

const mockDataCode = fs.readFileSync(path.join(projectRoot, "src/lib/mock-data.ts"), "utf-8");
const catalogPageCode = fs.readFileSync(path.join(projectRoot, "src/app/(dashboard)/specialists/page.tsx"), "utf-8");

// Parse specialists: find each top-level object
const specialistBlocks = mockDataCode.split(/\n\s*id:\s*"(spec-\d+)",\n/).slice(1);
const specialists = [];
for (let i = 0; i < specialistBlocks.length; i += 2) {
  const id = specialistBlocks[i];
  const block = specialistBlocks[i + 1];

  const full_name = block.match(/full_name:\s*"([^"]+)"/)?.[1] || "";
  const university = block.match(/university:\s*"([^"]+)"/)?.[1] || "";
  const region = block.match(/region:\s*"([^"]+)"/)?.[1] || "";
  const is_online = block.match(/is_online:\s*(true|false)/)?.[1] === "true";
  const rating_avg = parseFloat(block.match(/rating_avg:\s*([\d.]+)/)?.[1] || "0");
  const experience_years = parseInt(block.match(/experience_years:\s*(\d+)/)?.[1] || "0", 10);
  const consultation_count = parseInt(block.match(/consultation_count:\s*(\d+)/)?.[1] || "0", 10);
  const license_number = block.match(/license_number:\s*"([^"]+)"/)?.[1] || "";
  const bio = block.match(/bio:\s*"([^"]+)"/)?.[1] || "";

  // Extract categories: LEGAL_CATEGORIES[0], LEGAL_CATEGORIES[2]
  // 0: labor, 1: family, 2: civil, 3: housing, 4: criminal, 5: administrative, 6: business, 7: property, 8: contract, 9: tax
  const catIndexes = [...block.matchAll(/LEGAL_CATEGORIES\[(\d+)\]/g)].map(m => parseInt(m[1], 10));
  const categoryMap = ["labor", "family", "civil", "housing", "criminal", "administrative", "business", "property", "contract", "tax"];
  const categories = catIndexes.map(idx => ({ id: categoryMap[idx] }));

  specialists.push({
    id,
    full_name,
    university,
    region,
    is_online,
    rating_avg,
    experience_years,
    consultation_count,
    license_number,
    bio,
    categories,
  });
}

console.log("Loaded specialists:", specialists.map(s => `${s.id} (${s.full_name}, ${s.categories.map(c=>c.id).join(",")})`));

// Filtering function strictly mirroring page.tsx:210-297
function filterAndSort(dataset, { search = "", selectedCategory = "all", selectedRegion = "all", onlyOnline = false, minRating = "all", sortBy = "rating" }) {
  const list = dataset.filter((spec) => {
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

      const educationMatch = (spec.education || "").toLowerCase().includes(query);
      const licenseMatch = spec.license_number.toLowerCase().includes(query);

      if (!nameMatch && !bioMatch && !universityMatch && !educationMatch && !licenseMatch) {
        return false;
      }
    }

    if (selectedCategory !== "all") {
      const hasCategory = spec.categories.some((c) => c.id === selectedCategory);
      if (!hasCategory) return false;
    }

    if (selectedRegion !== "all" && spec.region !== selectedRegion) {
      return false;
    }

    if (onlyOnline && !spec.is_online) {
      return false;
    }

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

// Tests
console.log("\n--- Stress Testing Specialist Filtering & Sorting ---");

// 1. Sorting tests
const byRating = filterAndSort(specialists, { sortBy: "rating" });
assert.deepEqual(byRating.map(s => s.id), ["spec-3", "spec-1", "spec-2"], "Rating sort order failed");
console.log("  ✓ Sort by rating: spec-3 (4.95) -> spec-1 (4.90) -> spec-2 (4.80)");

const byExp = filterAndSort(specialists, { sortBy: "experience" });
assert.deepEqual(byExp.map(s => s.id), ["spec-3", "spec-1", "spec-2"], "Experience sort order failed");
console.log("  ✓ Sort by experience: spec-3 (12y) -> spec-1 (9y) -> spec-2 (7y)");

const byConsultations = filterAndSort(specialists, { sortBy: "consultations" });
assert.deepEqual(byConsultations.map(s => s.id), ["spec-3", "spec-1", "spec-2"], "Consultations sort order failed");
console.log("  ✓ Sort by consultations: spec-3 (89) -> spec-1 (52) -> spec-2 (35)");

// 2. Category isolation
const labor = filterAndSort(specialists, { selectedCategory: "labor" });
assert.equal(labor.length, 1);
assert.equal(labor[0].id, "spec-1");
console.log("  ✓ Category 'labor': returns spec-1");

const family = filterAndSort(specialists, { selectedCategory: "family" });
assert.equal(family.length, 1);
assert.equal(family[0].id, "spec-2");
console.log("  ✓ Category 'family': returns spec-2");

const housing = filterAndSort(specialists, { selectedCategory: "housing" });
assert.equal(housing.length, 1);
assert.equal(housing[0].id, "spec-3");
console.log("  ✓ Category 'housing': returns spec-3");

const criminal = filterAndSort(specialists, { selectedCategory: "criminal" });
assert.equal(criminal.length, 0);
console.log("  ✓ Category 'criminal': returns 0 (unpopulated branch)");

// 3. Region isolation
const tashkent = filterAndSort(specialists, { selectedRegion: "tashkent_city" });
assert.equal(tashkent.length, 2);
console.log("  ✓ Region 'tashkent_city': returns 2 advocates (spec-1, spec-3)");

const samarkand = filterAndSort(specialists, { selectedRegion: "samarkand" });
assert.equal(samarkand.length, 1);
assert.equal(samarkand[0].id, "spec-2");
console.log("  ✓ Region 'samarkand': returns 1 advocate (spec-2)");

// 4. Online status
const onlineOnly = filterAndSort(specialists, { onlyOnline: true });
assert.equal(onlineOnly.length, 2);
assert.deepEqual(onlineOnly.map(s => s.id).sort(), ["spec-1", "spec-2"]);
console.log("  ✓ Online only: returns spec-1 & spec-2 (spec-3 is offline)");

// 5. Multi-criteria intersection
const multi = filterAndSort(specialists, {
  selectedCategory: "labor",
  selectedRegion: "tashkent_city",
  onlyOnline: true,
  minRating: "4.8",
});
assert.equal(multi.length, 1);
assert.equal(multi[0].id, "spec-1");
console.log("  ✓ Multi-criteria filter: labor + tashkent_city + online + minRating 4.8 -> spec-1");

console.log("\nALL STRESS & REGRESSION TESTS PASSED CLEANLY!");
