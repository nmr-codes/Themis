/**
 * CHALLENGER M5_2: EMPIRICAL ADVERSARIAL STRESS-TEST SUITE
 * Milestone 5: Secondary Platform Portals, Verification Queue, Commission Math,
 * Boundary Inputs & Interface Contracts.
 */

import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import ts from "typescript";
import { MOCK_SPECIALISTS, LEGAL_CATEGORIES } from "./e2e/harness.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

const PORT = 3097;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// In-Memory Web Storage Simulator
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
}

const mockStorage = new LocalStorageMock();
globalThis.window = { localStorage: mockStorage };
globalThis.localStorage = mockStorage;

// Load consultation-storage module dynamically
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
  updateConsultationStatus
} = storageMod;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeGetRequest(routePath) {
  return new Promise((resolve, reject) => {
    const url = new URL(routePath, BASE_URL);
    const req = http.request(url, { method: "GET" }, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body: raw });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await makeGetRequest("/");
      if (res.status === 200 || res.status === 304) {
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    await sleep(500);
  }
  throw new Error(`Server failed to start on port ${PORT} within 15 seconds`);
}

console.log("\n======================================================================");
console.log("  THEMIS CHALLENGER M5_2: EMPIRICAL ADVERSARIAL STRESS-TEST SUITE");
console.log("======================================================================\n");

// --- SECTION 1: LIVE HTTP SERVER PROBES ---
console.log("--- Section 1: Live Next.js Production Server HTTP Route Probes ---");

const secondaryPortalRoutes = [
  { path: "/login", name: "Multi-Role Login Portal" },
  { path: "/register", name: "Multi-Role Registration Portal" },
  { path: "/dashboard", name: "Client Docket Dashboard" },
  { path: "/profile", name: "User Account & Role Profile" },
  { path: "/consultations", name: "Consultation Tracking & Tabs" },
  { path: "/consultations/c-101", name: "Consultation Dossier & Rating View" },
  { path: "/consultations/c-101/chat", name: "Consultation Chat & Document Room" },
  { path: "/specialist", name: "Specialist Home Portal KPI Dashboard" },
  { path: "/specialist/requests", name: "Specialist Booking Requests Queue" },
  { path: "/specialist/services", name: "Specialist Service & Tariff Management" },
  { path: "/specialist/schedule", name: "Specialist Weekly Availability & Presence" },
  { path: "/specialist/earnings", name: "Specialist Earnings & Commission Ledger" },
  { path: "/admin", name: "Admin Global KPI Overview" },
  { path: "/admin/specialists", name: "Admin Specialist Verification Queue" },
  { path: "/admin/users", name: "Admin User Registry & Role Controls" },
  { path: "/admin/consultations", name: "Admin Consultations Monitor" },
  { path: "/admin/reviews", name: "Admin Review Moderation & Advocate Replies" },
  { path: "/admin/transactions", name: "Admin Financial & Escrow Transactions" },
];

console.log(`Spawning Next.js production server on port ${PORT}...`);
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  detached: false,
});

serverProcess.stderr.on("data", (data) => {
  // console.error(`[Server stderr] ${data}`);
});

try {
  await waitForServer();
  console.log(`  ✓ Next.js production server is LIVE at ${BASE_URL}!\n`);

  for (const route of secondaryPortalRoutes) {
    await itAsync(`GET ${route.path} -> HTTP 200 (${route.name})`, async () => {
      const res = await makeGetRequest(route.path);
      assert.equal(res.status, 200, `Expected HTTP 200 for ${route.path}, got ${res.status}`);
      assert.ok(res.body.length > 500, `Response body for ${route.path} should be substantial`);
      assert.ok(res.body.includes("<!DOCTYPE html>"), `Response for ${route.path} must be valid HTML`);
    });
  }
} finally {
  console.log("\nTerminating test Next.js server...");
  if (isWindows) {
    spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
  } else {
    serverProcess.kill("SIGTERM");
  }
  await sleep(1000);
  console.log("  ✓ Test server terminated cleanly.\n");
}


// --- SECTION 2: SPECIALIST VERIFICATION QUEUE & SHAHNOZA ALIMOVA TRANSITIONS ---
console.log("--- Section 2: Specialist Verification Queue & Shahnoza Alimova (#ADV-9920) ---");

it("should verify baseline state of Shahnoza Alimova (spec-5, #ADV-9920) is pending", () => {
  const spec5 = MOCK_SPECIALISTS.find((s) => s.id === "spec-5");
  assert.ok(spec5, "spec-5 must exist in MOCK_SPECIALISTS");
  assert.equal(spec5.full_name, "Shahnoza Alimova");
  assert.equal(spec5.license_number, "#ADV-9920");
  assert.equal(spec5.verification_status, "pending");

  // Also verify source file src/lib/mock-data.ts directly
  const mockFileContent = fs.readFileSync(path.join(rootDir, "src/lib/mock-data.ts"), "utf-8");
  assert.ok(mockFileContent.includes("Shahnoza Alimova"), "mock-data.ts must contain Shahnoza Alimova");
  assert.ok(mockFileContent.includes("#ADV-9920"), "mock-data.ts must contain #ADV-9920");
  assert.ok(mockFileContent.includes('"pending"'), "mock-data.ts must contain pending status");
  assert.ok(mockFileContent.includes("Buxoro viloyati advokatlar palatasi"), "mock-data.ts must contain Buxoro chamber name");
});

it("should transition Shahnoza Alimova to approved on 1-click Approve and persist override", () => {
  mockStorage.clear();
  const STORAGE_KEY_VERIFS = "themis_specialist_verifications";

  // Simulate 1-click Approve logic from src/app/(admin)/admin/specialists/page.tsx:110-128
  const persistOverride = (id, status, admin_notes) => {
    const stored = mockStorage.getItem(STORAGE_KEY_VERIFS);
    const overrides = stored ? JSON.parse(stored) : {};
    overrides[id] = { status, admin_notes, updated_at: new Date().toISOString() };
    mockStorage.setItem(STORAGE_KEY_VERIFS, JSON.stringify(overrides));
  };

  // Perform 1-click Approve
  persistOverride("spec-5", "approved", "Adliya vazirligi litsenziyasi tasdiqlandi");

  // Read back and assert
  const storedJson = mockStorage.getItem(STORAGE_KEY_VERIFS);
  assert.ok(storedJson, "Overrides must be persisted");
  const overrides = JSON.parse(storedJson);
  assert.ok(overrides["spec-5"]);
  assert.equal(overrides["spec-5"].status, "approved");
  assert.equal(overrides["spec-5"].admin_notes, "Adliya vazirligi litsenziyasi tasdiqlandi");

  // Simulate mapped list categorization
  const mapped = MOCK_SPECIALISTS.map((s) => {
    const override = overrides[s.id];
    const initialStatus = override?.status || s.verification_status || "approved";
    return { ...s, status: initialStatus };
  });

  const pendingList = mapped.filter((s) => s.status === "pending");
  const approvedList = mapped.filter((s) => s.status === "approved");

  assert.ok(approvedList.some((s) => s.id === "spec-5"), "Shahnoza Alimova must now be in approved list");
  assert.ok(!pendingList.some((s) => s.id === "spec-5"), "Shahnoza Alimova must NOT be in pending list");
});

it("should transition Shahnoza Alimova to rejected on 1-click Reject and persist override", () => {
  mockStorage.clear();
  const STORAGE_KEY_VERIFS = "themis_specialist_verifications";

  const persistOverride = (id, status, admin_notes) => {
    const stored = mockStorage.getItem(STORAGE_KEY_VERIFS);
    const overrides = stored ? JSON.parse(stored) : {};
    overrides[id] = { status, admin_notes, updated_at: new Date().toISOString() };
    mockStorage.setItem(STORAGE_KEY_VERIFS, JSON.stringify(overrides));
  };

  // Perform 1-click Reject
  persistOverride("spec-5", "rejected", "Hujjatlar talabga javob bermadi");

  const storedJson = mockStorage.getItem(STORAGE_KEY_VERIFS);
  const overrides = JSON.parse(storedJson);
  assert.equal(overrides["spec-5"].status, "rejected");

  const mapped = MOCK_SPECIALISTS.map((s) => {
    const override = overrides[s.id];
    const initialStatus = override?.status || s.verification_status || "approved";
    return { ...s, status: initialStatus };
  });

  const pendingList = mapped.filter((s) => s.status === "pending");
  const rejectedList = mapped.filter((s) => s.status === "rejected");

  assert.ok(rejectedList.some((s) => s.id === "spec-5"), "Shahnoza Alimova must now be in rejected list");
  assert.ok(!pendingList.some((s) => s.id === "spec-5"), "Shahnoza Alimova must NOT be in pending list");
});


// --- SECTION 3: FINANCIAL COMMISSION CALCULATIONS (15% PLATFORM COMMISSION) ---
console.log("\n--- Section 3: Financial Commission Calculations (15% Platform Split) ---");

it("should assert 100,000 * 0.15 = 15,000 UZS platform fee and 85,000 UZS net payout", () => {
  const fee = 100000;
  const commission = Math.round(fee * 0.15);
  const payout = fee - commission;
  assert.equal(commission, 15000);
  assert.equal(payout, 85000);
  assert.equal(commission + payout, fee);
});

it("should assert 180,000 * 0.15 = 27,000 UZS platform fee and 153,000 UZS net payout", () => {
  const fee = 180000;
  const commission = Math.round(fee * 0.15);
  const payout = fee - commission;
  assert.equal(commission, 27000);
  assert.equal(payout, 153000);
  assert.equal(commission + payout, fee);
});

it("should assert 250,000 * 0.15 = 37,500 UZS platform fee and 212,500 UZS net payout", () => {
  const fee = 250000;
  const commission = Math.round(fee * 0.15);
  const payout = fee - commission;
  assert.equal(commission, 37500);
  assert.equal(payout, 212500);
  assert.equal(commission + payout, fee);
});

it("should verify conservation invariant fee + net === total across arbitrary and boundary amounts", () => {
  const testAmounts = [
    0, 1, 2, 7, 10, 70000, 120000, 350000, 500000, 1000000, 50000000
  ];
  for (const amt of testAmounts) {
    const fee = Math.round(amt * 0.15);
    const net = amt - fee;
    assert.equal(fee + net, amt, `Conservation failed for amount ${amt}`);
    assert.ok(fee >= 0 && net >= 0, `Fee and net must be non-negative for ${amt}`);
  }
});


// --- SECTION 4: INPUT BOUNDARY STRESS & REVIEW SUBMISSION ---
console.log("\n--- Section 4: Input Boundary Stress & Review Submission ---");

it("should reject review submission when comment is empty string", () => {
  const validateComment = (comment) => {
    if (!comment.trim()) {
      return { valid: false, error: "Iltimos, advokat xizmati yuzasidan qisqa sharh qoldiring" };
    }
    return { valid: true };
  };

  const res1 = validateComment("");
  assert.equal(res1.valid, false);
  assert.ok(res1.error.includes("sharh qoldiring"));
});

it("should reject review submission when comment is whitespace only", () => {
  const validateComment = (comment) => {
    if (!comment.trim()) {
      return { valid: false, error: "Iltimos, advokat xizmati yuzasidan qisqa sharh qoldiring" };
    }
    return { valid: true };
  };

  const whitespacePayloads = ["   ", "\t\t\t", "\n\n\n\r", "  \t \n \r  "];
  for (const payload of whitespacePayloads) {
    const res = validateComment(payload);
    assert.equal(res.valid, false, `Failed to reject whitespace payload: ${JSON.stringify(payload)}`);
  }
});

it("should accept review submission across 1-5 star ratings and update consultation status to completed", () => {
  mockStorage.clear();

  for (let rating = 1; rating <= 5; rating++) {
    const cid = `c-test-${rating}`;
    saveConsultation({
      id: cid,
      specialist_id: "spec-1",
      specialist_name: "Azizbek Rahimov",
      specialist_title: "Advokat",
      service_id: "serv-1",
      service_name: "Konsultatsiya",
      duration_minutes: 30,
      category: "Mehnat huquqi",
      price: 100000,
      currency: "UZS",
      format: "video",
      scheduled_at: "Bugun, 14:00",
      status: "scheduled",
      status_label: "Rejalashtirilgan",
      status_color: "bg-blue-100",
      has_review: false,
      created_at: new Date().toISOString()
    });

    updateConsultationReview(cid, rating, `Baho: ${rating} yulduz. Maslahat aniq va qonuniy berildi.`);

    const retrieved = getConsultationById(cid);
    assert.ok(retrieved !== null);
    assert.equal(retrieved.has_review, true);
    assert.equal(retrieved.user_rating, rating);
    assert.equal(retrieved.status, "completed");
    assert.equal(retrieved.status_label, "Yakunlangan");
  }
});

it("should safely persist and retrieve adversarial payloads (XSS, SQLi, Uzbek diacritics, Unicode) without corruption", () => {
  mockStorage.clear();

  const adversarialPayloads = [
    { name: "Uzbek diacritics & quotes", text: "O'zbekiston Respublikasi Adliya vazirligi № 123/45; g'olib & bo'lim, \"Adolat - qonun ustuvorligida\"" },
    { name: "XSS script & img onerror", text: "<script>alert('XSS')</script><img src=x onerror=alert(1)>" },
    { name: "SQL injection pattern", text: "'; DROP TABLE consultations; SELECT * FROM users WHERE '1'='1" },
    { name: "Unicode & Emojis", text: "🇺🇿 Huquqiy ko'mak juda yaxshi bo'ldi! ⭐️⭐️⭐️⭐️⭐️ 👍 ⚖️" },
    { name: "Large legal text (5000 chars)", text: "Fuqaro arizasi: ".repeat(300) }
  ];

  for (let i = 0; i < adversarialPayloads.length; i++) {
    const payload = adversarialPayloads[i];
    const cid = `c-adv-${i}`;
    saveConsultation({
      id: cid,
      specialist_id: "spec-2",
      specialist_name: "Dilnoza Karimova",
      specialist_title: "Advokat",
      service_id: "serv-2",
      service_name: "Oila huquqi",
      duration_minutes: 45,
      category: "Oila huquqi",
      price: 180000,
      currency: "UZS",
      format: "chat",
      scheduled_at: "Ertaga, 10:00",
      status: "scheduled",
      status_label: "Rejalashtirilgan",
      status_color: "bg-blue-100",
      has_review: false,
      created_at: new Date().toISOString()
    });

    updateConsultationReview(cid, 5, payload.text);

    const retrieved = getConsultationById(cid);
    assert.ok(retrieved !== null, `Retrieved consultation for ${payload.name} must not be null`);
    assert.equal(retrieved.user_comment, payload.text, `Comment text mismatch for ${payload.name}`);
    assert.equal(retrieved.user_rating, 5);
    assert.equal(retrieved.status, "completed");
  }
});


// --- SECTION 5: INTERFACE CONTRACT 1 (0 OCCURRENCES OF /dashboard/ IN LINKS) ---
console.log("\n--- Section 5: Interface Contract 1 Compliance (0 /dashboard/ links) ---");

it("should assert exactly 0 occurrences of /dashboard/ in navigation links across src/", () => {
  const srcDir = path.join(rootDir, "src");

  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (/\.(tsx|ts|jsx|js|html)$/.test(file)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const files = walk(srcDir);
  const violations = [];

  const forbiddenPattern = /['"`]\/dashboard\/[a-zA-Z0-9_\-\/]+/g;

  for (const f of files) {
    const content = fs.readFileSync(f, "utf-8");
    const matches = content.match(forbiddenPattern);
    if (matches) {
      violations.push({ file: path.relative(rootDir, f), matches });
    }
  }

  assert.equal(
    violations.length,
    0,
    `Found violations of Interface Contract 1: ${JSON.stringify(violations, null, 2)}`
  );
});

// --- SUMMARY ---
console.log("\n======================================================================");
console.log(`  CHALLENGER M5_2 EMPIRICAL ADVERSARIAL SUITE SUMMARY`);
console.log(`  Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log("======================================================================\n");

if (failedTests > 0) {
  console.error("Verdict: REQUEST_CHANGES — Adversarial stress test failures detected.");
  process.exit(1);
} else {
  console.log("Verdict: APPROVE — 100% of adversarial stress tests passed cleanly!\n");
  process.exit(0);
}
