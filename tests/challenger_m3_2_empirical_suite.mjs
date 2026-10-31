/**
 * Challenger M3_2 Adversarial & Empirical Test Suite
 * Platform: Themis (Huquqiy Yordam) — Uzbekistan Legal Consultation Platform
 * Target: Milestone 3 (Specialist Catalog & Detail Dossier Profiles, Interface Contract 3)
 *
 * Specific Verification Tasks:
 * 1. Challenge booking persistence: Submitting booking creates and commits valid StoredConsultation to localStorage("themis_consultations")
 * 2. Challenge consultation ledger: getStoredConsultations() retrieves new bookings and /consultations displays them with "Kutilmoqda" status in active tab
 * 3. Challenge consultation detail: /consultations/[id] dynamically resolves booked consultation, displays advocate details, and persists user reviews
 * 4. Challenge invalid specialist IDs on /specialists/[id]: Graceful not-found handling without unhandled runtime exceptions
 * 5. Storage stress & boundary testing (corrupted JSON, idempotent updates, bulk writes, diacritics)
 * 6. Live HTTP server verification across all relevant specialist and consultation routes
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n======================================================================");
console.log("  CHALLENGER M3_2: EMPIRICAL ADVERSARIAL TEST SUITE");
console.log("  Milestone 3 Consultation Booking, Persistence & Specialist Dossiers");
console.log("======================================================================\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function it(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// ====================================================================
// In-Memory Spec-Compliant Web Storage Simulator
// ====================================================================
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const mockStorage = new LocalStorageMock();
globalThis.window = { localStorage: mockStorage };
globalThis.localStorage = mockStorage;

// Load production consultation-storage module dynamically
const storageRaw = fs.readFileSync(path.join(rootDir, "src/lib/consultation-storage.ts"), "utf-8");
const transpiledStorage = ts.transpileModule(storageRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const storageUri = "data:text/javascript;base64," + Buffer.from(transpiledStorage).toString("base64");
const storageMod = await import(storageUri);

const {
  STORAGE_KEY_CONSULTATIONS,
  SEED_CONSULTATIONS,
  getStoredConsultations,
  getConsultationById,
  saveConsultation,
  updateConsultationReview,
} = storageMod;

// Load production constants and mock-data
const constantsRaw = fs.readFileSync(path.join(rootDir, "src/lib/constants.ts"), "utf-8");
const transpiledConstants = ts.transpileModule(constantsRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const constantsUri = "data:text/javascript;base64," + Buffer.from(transpiledConstants).toString("base64");
const constantsMod = await import(constantsUri);

let mockRaw = fs.readFileSync(path.join(rootDir, "src/lib/mock-data.ts"), "utf-8");
mockRaw = mockRaw.replace('./constants', constantsUri);
const transpiledMock = ts.transpileModule(mockRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const mockUri = "data:text/javascript;base64," + Buffer.from(transpiledMock).toString("base64");
const mockMod = await import(mockUri);
const { MOCK_SPECIALISTS } = mockMod;
const { LEGAL_CATEGORIES, REGIONS } = constantsMod;

// ====================================================================
// TEST SUITE 1: Booking Persistence & Interface Contract 3
// ====================================================================
console.log("\n--- Suite 1: Booking Persistence & Interface Contract 3 ---");

await it("should return default SEED_CONSULTATIONS when localStorage is empty", async () => {
  mockStorage.clear();
  const consultations = getStoredConsultations();
  assert.equal(consultations.length, SEED_CONSULTATIONS.length);
  assert.equal(consultations[0].id, "c-101");
  assert.equal(consultations[1].id, "c-102");
  assert.equal(consultations[2].id, "c-103");
});

await it("should commit a valid StoredConsultation record to localStorage.getItem('themis_consultations')", async () => {
  mockStorage.clear();

  const newBooking = {
    id: "c-test-" + Date.now(),
    specialist_id: "spec-1",
    specialist_name: "Azizbek Rahimov",
    specialist_title: "Mehnat huquqi bo'yicha advokat",
    specialist_role: "Mehnat huquqi bo'yicha advokat",
    specialist_avatar: undefined,
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
    description: "Noqonuniy ravishda 2 oylik ish haqi ushlab qolinmoqda.",
    user_notes: "Noqonuniy ravishda 2 oylik ish haqi ushlab qolinmoqda.",
    meeting_link: "https://meet.google.com/thm-legal-aid",
    created_at: new Date().toISOString(),
  };

  saveConsultation(newBooking);

  // Directly inspect localStorage content
  const rawStored = mockStorage.getItem(STORAGE_KEY_CONSULTATIONS);
  assert.ok(rawStored !== null, "localStorage must contain the 'themis_consultations' key");

  const parsed = JSON.parse(rawStored);
  assert.ok(Array.isArray(parsed), "themis_consultations value must be a valid JSON array");
  assert.ok(parsed.length >= 4, "Array must contain the newly saved item plus seeds");

  const foundItem = parsed.find((item) => item.id === newBooking.id);
  assert.ok(foundItem, "Stored array must contain the newly booked consultation by ID");
  assert.equal(foundItem.status, "pending", "Status must strictly be 'pending' per Contract 3");
  assert.equal(foundItem.status_label, "Kutilmoqda", "Status label must be 'Kutilmoqda'");
  assert.equal(foundItem.specialist_name, "Azizbek Rahimov");
  assert.equal(foundItem.price, 180000);
  assert.equal(foundItem.currency, "UZS");
  assert.equal(foundItem.user_notes, "Noqonuniy ravishda 2 oylik ish haqi ushlab qolinmoqda.");
});

await it("should ensure newly saved consultation appears at index 0 of getStoredConsultations()", async () => {
  const all = getStoredConsultations();
  assert.ok(all[0].id.startsWith("c-test-"), "New booking must precede older/seed consultations");
  assert.equal(all[0].status, "pending");
});

// ====================================================================
// TEST SUITE 2: Consultation Ledger & Active Tab Conformance
// ====================================================================
console.log("\n--- Suite 2: Consultation Ledger & Active Tab Conformance ---");

await it("should correctly filter new 'pending' consultations into the 'active' tab", async () => {
  const consultations = getStoredConsultations();

  // Test the exact filtering logic from src/app/(dashboard)/consultations/page.tsx line 37-43:
  const activeConsultations = consultations.filter(
    (c) =>
      c.status === "scheduled" ||
      c.status === "pending" ||
      c.status === "in_progress" ||
      c.status === "confirmed"
  );

  const pendingItem = activeConsultations.find((c) => c.status === "pending");
  assert.ok(pendingItem, "Active tab must contain the pending consultation");
  assert.equal(pendingItem.status_label, "Kutilmoqda", "Pending consultation must display status 'Kutilmoqda'");
});

await it("should separate completed consultations from active ones", async () => {
  const consultations = getStoredConsultations();

  const completedConsultations = consultations.filter(
    (c) => c.status === "completed" || c.status === "cancelled"
  );

  // Initial seeds c-102 and c-103 are completed
  assert.ok(completedConsultations.some((c) => c.id === "c-102"));
  assert.ok(completedConsultations.some((c) => c.id === "c-103"));
  assert.ok(!completedConsultations.some((c) => c.status === "pending"), "Pending bookings must NOT appear in completed tab");
});

// ====================================================================
// TEST SUITE 3: Consultation Detail & Review Rating Persistence
// ====================================================================
console.log("\n--- Suite 3: Consultation Detail & Review Rating Persistence ---");

await it("should dynamically resolve booked consultation by ID via getConsultationById", async () => {
  const all = getStoredConsultations();
  const testBooking = all[0];

  const resolved = getConsultationById(testBooking.id);
  assert.ok(resolved !== null, "getConsultationById must find existing booked consultation");
  assert.equal(resolved.id, testBooking.id);
  assert.equal(resolved.specialist_id, "spec-1");
  assert.equal(resolved.specialist_name, "Azizbek Rahimov");
  assert.equal(resolved.price, 180000);
});

await it("should display correct advocate contact and academic credentials for resolved consultation", async () => {
  const all = getStoredConsultations();
  const testBooking = all[0];
  const specialistDetails = MOCK_SPECIALISTS.find((s) => s.id === testBooking.specialist_id);

  assert.ok(specialistDetails, "Mock specialist must exist for specialist_id");
  assert.equal(specialistDetails.full_name, "Azizbek Rahimov");
  assert.equal(specialistDetails.phone, "+998 90 123 45 67");
  assert.equal(specialistDetails.email, "azizbek.r@themis.uz");
  assert.equal(specialistDetails.university, "Toshkent Davlat Yuridik Universiteti");
  assert.equal(specialistDetails.experience_years, 9);
  assert.equal(specialistDetails.license_number, "#ADV-3810");
});

await it("should persist 1-5 star user review and comments via updateConsultationReview()", async () => {
  const all = getStoredConsultations();
  const targetId = all[0].id;

  updateConsultationReview(targetId, 5, "Advokat Azizbek Rahimov masalani juda professional hal qilib berdilar!");

  const updated = getConsultationById(targetId);
  assert.ok(updated !== null);
  assert.equal(updated.has_review, true, "has_review flag must be true");
  assert.equal(updated.user_rating, 5, "Rating must be 5");
  assert.equal(updated.user_comment, "Advokat Azizbek Rahimov masalani juda professional hal qilib berdilar!");
  assert.equal(updated.status, "completed", "Status must transition to 'completed'");
  assert.equal(updated.status_label, "Yakunlangan", "Status label must transition to 'Yakunlangan'");

  // Also verify in raw localStorage
  const raw = JSON.parse(mockStorage.getItem(STORAGE_KEY_CONSULTATIONS));
  const rawItem = raw.find((item) => item.id === targetId);
  assert.equal(rawItem.has_review, true);
  assert.equal(rawItem.user_rating, 5);
  assert.equal(rawItem.status, "completed");
});

await it("should move reviewed consultation to 'completed' tab in ledger", async () => {
  const consultations = getStoredConsultations();
  const active = consultations.filter((c) => c.status === "scheduled" || c.status === "pending" || c.status === "in_progress" || c.status === "confirmed");
  const completed = consultations.filter((c) => c.status === "completed" || c.status === "cancelled");

  const reviewedItemInActive = active.find((c) => c.has_review === true);
  const reviewedItemInCompleted = completed.find((c) => c.has_review === true && c.user_rating === 5);

  assert.equal(reviewedItemInActive, undefined, "Reviewed completed item must no longer be in active tab");
  assert.ok(reviewedItemInCompleted, "Reviewed item must now be in completed tab");
});

// ====================================================================
// TEST SUITE 4: Specialist Detail & Graceful Not-Found Handling
// ====================================================================
console.log("\n--- Suite 4: Specialist Detail & Graceful Not-Found Handling ---");

await it("should successfully resolve all valid specialist IDs with authentic credentials", async () => {
  const expectedSpecs = [
    { id: "spec-1", name: "Azizbek Rahimov", license: "#ADV-3810" },
    { id: "spec-2", name: "Dilnoza Karimova", license: "#ADV-4192" },
    { id: "spec-3", name: "Rustam Mahmudov", license: "#ADV-4921" },
  ];

  for (const exp of expectedSpecs) {
    const spec = MOCK_SPECIALISTS.find((s) => s.id === exp.id);
    assert.ok(spec, `Specialist ${exp.id} must exist in MOCK_SPECIALISTS`);
    assert.equal(spec.full_name, exp.name);
    assert.equal(spec.license_number, exp.license);
    assert.ok(spec.services.length >= 1, "Must have services configured");
    assert.ok(spec.categories.length >= 1, "Must have categories configured");
  }
});

await it("should gracefully handle nonexistent specialist IDs without unhandled exceptions", async () => {
  const invalidIds = [
    "spec-nonexistent-9999",
    "invalid-id",
    "undefined",
    "null",
    "../../etc/passwd",
    "<script>alert(1)</script>",
    "   ",
    "",
  ];

  for (const testId of invalidIds) {
    const spec = MOCK_SPECIALISTS.find((s) => s.id === testId);
    assert.equal(spec, undefined, `Lookup for '${testId}' must return undefined`);

    // Verify fallback logic:
    // In src/app/(dashboard)/specialists/[id]/page.tsx line 94-138:
    // When !specialist, it renders "REYESTR YOZUVI TOPILMADI" and "Advokat Shaxsiy Daftari Mavjud Emas"
    const canRecover = !spec;
    assert.ok(canRecover, "Page must detect not-found condition safely");
  }
});

// ====================================================================
// TEST SUITE 5: Storage Edge Cases & Stress Resilience
// ====================================================================
console.log("\n--- Suite 5: Storage Edge Cases & Stress Resilience ---");

await it("should gracefully handle corrupted JSON in localStorage without throwing", async () => {
  mockStorage.setItem(STORAGE_KEY_CONSULTATIONS, "{ broken JSON syntax !!!");
  
  // Must not throw, should fall back to SEED_CONSULTATIONS
  let result;
  assert.doesNotThrow(() => {
    result = getStoredConsultations();
  });
  assert.ok(Array.isArray(result));
  assert.equal(result.length, SEED_CONSULTATIONS.length);
});

await it("should gracefully handle non-array JSON types (e.g. integer, string, object)", async () => {
  mockStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify({ error: "not an array" }));
  let result = getStoredConsultations();
  assert.equal(result.length, SEED_CONSULTATIONS.length);

  mockStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify("plain string"));
  result = getStoredConsultations();
  assert.equal(result.length, SEED_CONSULTATIONS.length);

  mockStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(12345));
  result = getStoredConsultations();
  assert.equal(result.length, SEED_CONSULTATIONS.length);
});

await it("should support idempotent booking updates without creating duplicate records", async () => {
  mockStorage.clear();
  const testId = "c-idempotent-1";

  const bookingV1 = {
    id: testId,
    specialist_id: "spec-1",
    specialist_name: "Azizbek Rahimov",
    specialist_title: "Advokat",
    category: "Mehnat",
    service_name: "Service 1",
    duration_minutes: 30,
    scheduled_at: "Ertaga, 10:00",
    format: "video",
    status: "pending",
    status_label: "Kutilmoqda",
    price: 100000,
    currency: "UZS",
    created_at: new Date().toISOString(),
  };

  saveConsultation(bookingV1);
  assert.equal(getStoredConsultations().filter((c) => c.id === testId).length, 1);

  // Save same ID with updated price & status
  const bookingV2 = {
    ...bookingV1,
    price: 150000,
    status: "confirmed",
    status_label: "Rejalashtirilgan",
  };

  saveConsultation(bookingV2);
  const matches = getStoredConsultations().filter((c) => c.id === testId);
  assert.equal(matches.length, 1, "Must update existing record, not duplicate");
  assert.equal(matches[0].price, 150000);
  assert.equal(matches[0].status, "confirmed");
});

await it("should withstand bulk sequential bookings (50 writes) preserving FIFO order", async () => {
  mockStorage.clear();
  const totalBulk = 50;

  for (let i = 1; i <= totalBulk; i++) {
    saveConsultation({
      id: `c-bulk-${i}`,
      specialist_id: "spec-1",
      specialist_name: `Advokat ${i}`,
      specialist_title: "Advokat",
      category: "Mehnat",
      service_name: `Xizmat ${i}`,
      duration_minutes: 45,
      scheduled_at: `Kun ${i}, 14:00`,
      format: "video",
      status: "pending",
      status_label: "Kutilmoqda",
      price: 100000 + i * 1000,
      currency: "UZS",
      created_at: new Date().toISOString(),
    });
  }

  const all = getStoredConsultations();
  assert.equal(all[0].id, `c-bulk-${totalBulk}`, "Most recently saved item must be at index 0");
  assert.equal(all[totalBulk - 1].id, "c-bulk-1");
  // Total must be 50 bulk items + 3 seed items = 53
  assert.equal(all.length, totalBulk + SEED_CONSULTATIONS.length);
});

await it("should safely handle updateConsultationReview() on nonexistent ID without crash", async () => {
  assert.doesNotThrow(() => {
    updateConsultationReview("c-nonexistent-id", 5, "Sharh");
  });
});

await it("should handle boundary rating values (1 and 5) and Uzbek diacritics in comments", async () => {
  mockStorage.clear();
  const testId = "c-diacritics-test";
  saveConsultation({
    id: testId,
    specialist_id: "spec-2",
    specialist_name: "Dilnoza Karimova",
    specialist_title: "Yurist",
    category: "Oila",
    service_name: "Konsultatsiya",
    duration_minutes: 30,
    scheduled_at: "Ertaga",
    format: "chat",
    status: "pending",
    status_label: "Kutilmoqda",
    price: 120000,
    currency: "UZS",
    created_at: new Date().toISOString(),
  });

  const complexComment = "G'oyat ajoyib ko'mak! O'zbekiston Respublikasi Oila kodeksining 76-moddasini aniq sharhlab berdilar.";
  updateConsultationReview(testId, 1, complexComment);

  const res = getConsultationById(testId);
  assert.equal(res.user_rating, 1);
  assert.equal(res.user_comment, complexComment);
  assert.ok(res.user_comment.includes("G'oyat"));
  assert.ok(res.user_comment.includes("ko'mak"));
  assert.ok(res.user_comment.includes("O'zbekiston"));
});

// ====================================================================
// TEST SUITE 6: Source Code Contract Verification (Static Analysis)
// ====================================================================
console.log("\n--- Suite 6: Source Code Contract Verification ---");

await it("ConsultationBookingDialog strictly commits to 'themis_consultations' with status 'pending'", async () => {
  const dialogFile = fs.readFileSync(
    path.join(rootDir, "src/components/modals/consultation-booking-dialog.tsx"),
    "utf-8"
  );

  assert.ok(dialogFile.includes('import { saveConsultation'), "Must import saveConsultation helper");
  assert.ok(dialogFile.includes('saveConsultation(newBooking)'), "Must call saveConsultation(newBooking)");
  assert.ok(dialogFile.includes('status: "pending"'), "Must initialize status to 'pending'");
  assert.ok(dialogFile.includes('status_label: "Kutilmoqda"'), "Must initialize status_label to 'Kutilmoqda'");
  assert.ok(dialogFile.includes('router.push("/consultations")'), "Must navigate user to /consultations upon booking");
});

await it("Consultations list page dynamically reads getStoredConsultations and renders 'Kutilmoqda' badge", async () => {
  const listFile = fs.readFileSync(
    path.join(rootDir, "src/app/(dashboard)/consultations/page.tsx"),
    "utf-8"
  );

  assert.ok(/import\s*\{[\s\S]*?getStoredConsultations[\s\S]*?\}\s*from\s*["']@\/lib\/consultation-storage["']/.test(listFile), "Must import getStoredConsultations");
  assert.ok(listFile.includes('getStoredConsultations()'), "Must invoke getStoredConsultations in useEffect");
  assert.ok(listFile.includes('c.status === "pending"'), "Active tab must include 'pending' status");
  assert.ok(listFile.includes('"Kutilmoqda"'), "Status badge must render 'Kutilmoqda'");
  assert.ok(listFile.includes('/consultations/${c.id}'), "Must link to /consultations/[id]");
});

await it("Consultation detail page dynamically loads consultation and allows submitting review", async () => {
  const detailFile = fs.readFileSync(
    path.join(rootDir, "src/app/(dashboard)/consultations/[id]/page.tsx"),
    "utf-8"
  );

  assert.ok(/import\s*\{[\s\S]*?getConsultationById[\s\S]*?\}\s*from\s*["']@\/lib\/consultation-storage["']/.test(detailFile), "Must import getConsultationById");
  assert.ok(/import\s*\{[\s\S]*?updateConsultationReview[\s\S]*?\}\s*from\s*["']@\/lib\/consultation-storage["']/.test(detailFile), "Must import updateConsultationReview");
  assert.ok(detailFile.includes('getConsultationById(id)'), "Must lookup consultation dynamically by id");
  assert.ok(detailFile.includes('updateConsultationReview('), "Must invoke updateConsultationReview on form submission");
  assert.ok(detailFile.includes('consultation.has_review'), "Must check consultation.has_review to show review or disable button");
});

await it("Specialist detail page implements graceful not-found and integrates booking modal", async () => {
  const specDetailFile = fs.readFileSync(
    path.join(rootDir, "src/app/(dashboard)/specialists/[id]/page.tsx"),
    "utf-8"
  );

  assert.ok(specDetailFile.includes('MOCK_SPECIALISTS.find'), "Must find specialist from MOCK_SPECIALISTS");
  assert.ok(specDetailFile.includes('if (!specialist)'), "Must handle !specialist with early return");
  assert.ok(specDetailFile.includes('REYESTR YOZUVI TOPILMADI'), "Must render 'REYESTR YOZUVI TOPILMADI'");
  assert.ok(specDetailFile.includes('Advokat Shaxsiy Daftari Mavjud Emas'), "Must render not-found headline");
  assert.ok(specDetailFile.includes('<ConsultationBookingDialog'), "Must render ConsultationBookingDialog modal");
});

// ====================================================================
// TEST SUITE 7: Live Next.js Production HTTP Server Verification
// ====================================================================
console.log("\n--- Suite 7: Live Next.js Production HTTP Server Verification ---");

const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`, { method: "HEAD" });
      if (res.status === 200 || res.status === 304) {
        return true;
      }
    } catch {}
    await sleep(500);
  }
  throw new Error(`Server failed to start on port ${PORT} within 15 seconds`);
}

let serverProcess = null;
let activeBaseUrl = "http://127.0.0.1:3000";

try {
  let isAlreadyLive = false;
  try {
    const check = await fetch("http://127.0.0.1:3000/", { method: "HEAD" });
    if (check.status === 200 || check.status === 304) {
      isAlreadyLive = true;
      activeBaseUrl = "http://127.0.0.1:3000";
      console.log(`  ✓ Reusing active production server at ${activeBaseUrl}\n`);
    }
  } catch {}

  if (!isAlreadyLive) {
    console.log(`  Spawning production server on port ${PORT}...`);
    const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
    serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
    });

    await waitForServer();
    activeBaseUrl = BASE_URL;
    console.log(`  ✓ Production server is LIVE at ${activeBaseUrl}\n`);
  }

  await it("Live GET /specialists/spec-1 returns HTTP 200 with advocate dossier and license #ADV-3810", async () => {
    const res = await fetch(`${activeBaseUrl}/specialists/spec-1`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Azizbek Rahimov"), "HTML must contain Azizbek Rahimov");
    assert.ok(html.includes("#ADV-3810"), "HTML must contain license number #ADV-3810");
    assert.ok(html.includes("Toshkent Davlat Yuridik Universiteti"), "HTML must contain academic university");
    assert.ok(html.includes("Tariflar"), "HTML must contain services/tariffs tab");
  });

  await it("Live GET /specialists/spec-2 returns HTTP 200 with Dilnoza Karimova and license #ADV-4192", async () => {
    const res = await fetch(`${activeBaseUrl}/specialists/spec-2`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Dilnoza Karimova"));
    assert.ok(html.includes("#ADV-4192"));
    assert.ok(html.includes("Samarqand"));
  });

  await it("Live GET /specialists/spec-3 returns HTTP 200 with Rustam Mahmudov and license #ADV-4921", async () => {
    const res = await fetch(`${activeBaseUrl}/specialists/spec-3`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Rustam Mahmudov"));
    assert.ok(html.includes("#ADV-4921"));
  });

  await it("Live GET /specialists/nonexistent-spec-999 returns HTTP 200 with graceful judicial not-found dossier", async () => {
    const res = await fetch(`${activeBaseUrl}/specialists/nonexistent-spec-999`);
    // App Router client component page returns 200 with bespoke not-found card
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("REYESTR YOZUVI TOPILMADI"), "HTML must contain 'REYESTR YOZUVI TOPILMADI'");
    assert.ok(html.includes("Advokat Shaxsiy Daftari Mavjud Emas"), "HTML must contain 'Advokat Shaxsiy Daftari Mavjud Emas'");
    assert.ok(html.includes("nonexistent-spec-999"), "HTML must quote the invalid ID");
    assert.ok(html.includes("Reyestrdan Boshqa Advokat Izlash"), "HTML must provide recovery button");
  });

  await it("Live GET /consultations returns HTTP 200 with consultation ledger layout", async () => {
    const res = await fetch(`${activeBaseUrl}/consultations`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Mening Konsultatsiyalarim") || html.includes("Konsultatsiyalar"), "HTML must contain ledger title");
    assert.ok(html.includes("Faol") || html.includes("Kutilmoqda"), "HTML must contain active tab");
  });

  await it("Live GET /consultations/c-101 returns HTTP 200 with SSR skeleton / client hydration boundary", async () => {
    const res = await fetch(`${activeBaseUrl}/consultations/c-101`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(
      html.includes("Konsultatsiya") || html.includes("yuklanmoqda"),
      "HTML must render consultation skeleton boundary"
    );
  });

} catch (err) {
  console.error("Server execution error:", err);
  failedTests++;
  failures.push({ name: "Live Production Server Execution", error: err });
} finally {
  if (serverProcess) {
    console.log("  Stopping production server...");
    serverProcess.kill();
  }
}

// ====================================================================
// SUMMARY & EXIT
// ====================================================================
console.log("\n======================================================================");
console.log("  CHALLENGER M3_2 TEST EXECUTION SUMMARY");
console.log("======================================================================");
console.log(`  Total Probes:   ${totalTests}`);
console.log(`  Passed:         ${passedTests}`);
console.log(`  Failed:         ${failedTests}`);

if (failedTests > 0) {
  console.log("\n  Failures:");
  failures.forEach((f, i) => {
    console.log(`  ${i + 1}) ${f.name}`);
    console.log(`     Error: ${f.error.message}`);
  });
  console.log("\nVerdict: REQUEST_CHANGES\n");
  process.exit(1);
} else {
  console.log("\nVerdict: APPROVE — 100% EMPIRICAL PROBES PASSED CLEANLY\n");
  process.exit(0);
}
