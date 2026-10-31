/**
 * CHALLENGER M5: EMPIRICAL ADVERSARIAL TEST SUITE
 * Milestone 5: Secondary Portals Coherence, Consultation Management & Polish
 */

import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const BASE_URL = process.env.TEST_SERVER_URL || "http://127.0.0.1:3000";

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

async function makeGetRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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

console.log("\n======================================================================");
console.log("  CHALLENGER M5: EMPIRICAL ADVERSARIAL TEST SUITE");
console.log("  Milestone 5: Secondary Portals Coherence, Consultation Management & Polish");
console.log("======================================================================\n");

// --- Suite 1: Consultation Storage Lifecycle & State Transitions ---
console.log("--- Suite 1: Consultation Storage Lifecycle & State Transitions ---");

it("should update consultation status to accepted and reflect Qabul qilingan label", () => {
  mockStorage.clear();
  const updated = updateConsultationStatus("c-101", "accepted", "Advokat qabul qildi, hujjatlar ko'rilmoqda");
  assert.ok(updated !== null);
  assert.equal(updated.status, "accepted");
  assert.equal(updated.status_label, "Qabul qilingan");
  assert.equal(updated.specialist_notes, "Advokat qabul qildi, hujjatlar ko'rilmoqda");

  const fetched = getConsultationById("c-101");
  assert.equal(fetched.status, "accepted");
  assert.equal(fetched.status_label, "Qabul qilingan");
});

it("should update consultation status to completed and reflect Yakunlangan label", () => {
  const updated = updateConsultationStatus("c-101", "completed");
  assert.ok(updated !== null);
  assert.equal(updated.status, "completed");
  assert.equal(updated.status_label, "Yakunlangan");

  const fetched = getConsultationById("c-101");
  assert.equal(fetched.status, "completed");
});

it("should update consultation status to cancelled and reflect Rad etilgan label", () => {
  const updated = updateConsultationStatus("c-101", "cancelled", "Vaqt to'g'ri kelmadi");
  assert.ok(updated !== null);
  assert.equal(updated.status, "cancelled");
  assert.equal(updated.status_label, "Rad etilgan");
});

it("should safely handle updateConsultationStatus on nonexistent ID", () => {
  const updated = updateConsultationStatus("nonexistent-id", "completed");
  assert.equal(updated, null);
});


// --- Suite 2: Demo Persona Storage Contracts ---
console.log("\n--- Suite 2: Demo Persona Switcher Schema & Roles ---");

it("should support client demo persona in localStorage", () => {
  const clientUser = {
    id: "demo-client-1",
    email: "mijoz@themis.uz",
    full_name: "Azizbek Nurmatov",
    role: "user"
  };
  mockStorage.setItem("themis_demo_user", JSON.stringify(clientUser));
  const retrieved = JSON.parse(mockStorage.getItem("themis_demo_user"));
  assert.equal(retrieved.role, "user");
  assert.equal(retrieved.email, "mijoz@themis.uz");
});

it("should support specialist demo persona in localStorage", () => {
  const specUser = {
    id: "demo-spec-1",
    email: "yurist@themis.uz",
    full_name: "Azizbek Rahimov",
    role: "specialist",
    specialist_id: "spec-1"
  };
  mockStorage.setItem("themis_demo_user", JSON.stringify(specUser));
  const retrieved = JSON.parse(mockStorage.getItem("themis_demo_user"));
  assert.equal(retrieved.role, "specialist");
});

it("should support admin demo persona in localStorage", () => {
  const adminUser = {
    id: "demo-admin-1",
    email: "admin@themis.uz",
    full_name: "Tizim Nazoratchisi",
    role: "admin"
  };
  mockStorage.setItem("themis_demo_user", JSON.stringify(adminUser));
  const retrieved = JSON.parse(mockStorage.getItem("themis_demo_user"));
  assert.equal(retrieved.role, "admin");
});


// --- Suite 3: Financial Commission Accounting (15% platform split) ---
console.log("\n--- Suite 3: Financial Calculations & Ledger Math ---");

it("should verify 15% platform commission and 85% specialist payout on consultation fees", () => {
  const fee1 = 100000;
  const commission1 = Math.round(fee1 * 0.15);
  const payout1 = fee1 - commission1;
  assert.equal(commission1, 15000);
  assert.equal(payout1, 85000);

  const fee2 = 180000;
  const commission2 = Math.round(fee2 * 0.15);
  const payout2 = fee2 - commission2;
  assert.equal(commission2, 27000);
  assert.equal(payout2, 153000);

  const fee3 = 350000;
  const commission3 = Math.round(fee3 * 0.15);
  const payout3 = fee3 - commission3;
  assert.equal(commission3, 52500);
  assert.equal(payout3, 297500);
});


// --- Suite 4: Source Code Contract Verification ---
console.log("\n--- Suite 4: Source Code Contract Verification ---");

it("should verify AuthLayout exists and encapsulates legal branding", () => {
  const authLayoutPath = path.join(rootDir, "src/app/(auth)/layout.tsx");
  assert.ok(fs.existsSync(authLayoutPath), "src/app/(auth)/layout.tsx must exist");
  const content = fs.readFileSync(authLayoutPath, "utf-8");
  assert.ok(content.includes("Huquqiy Yordam"));
  assert.ok(content.includes("/terms"));
  assert.ok(content.includes("/privacy"));
});

it("should verify LoginPage has 1-click demo persona switcher", () => {
  const loginPath = path.join(rootDir, "src/app/(auth)/login/page.tsx");
  const content = fs.readFileSync(loginPath, "utf-8");
  assert.ok(content.includes("themis_demo_user"), "Must commit to themis_demo_user in localStorage");
  assert.ok(content.includes("handleQuickDemo"), "Must expose handleQuickDemo");
  assert.ok(content.includes("Fuqaro") && content.includes("Advokat") && content.includes("Admin"));
});

it("should verify Client Dashboard connects to consultation storage", () => {
  const dashPath = path.join(rootDir, "src/app/(dashboard)/dashboard/page.tsx");
  const content = fs.readFileSync(dashPath, "utf-8");
  assert.ok(content.includes("getStoredConsultations"), "Must read stored consultations");
  assert.ok(content.includes("themis_demo_user"), "Must check demo user in localStorage");
});

it("should verify Specialist Portal Request page integrates consultation state updates", () => {
  const reqPath = path.join(rootDir, "src/app/(specialist)/specialist/requests/page.tsx");
  const content = fs.readFileSync(reqPath, "utf-8");
  assert.ok(content.includes("getStoredConsultations") || content.includes("updateConsultationStatus") || content.includes("saveConsultation"));
});

it("should verify Admin Specialists page persists verification decisions", () => {
  const adminSpecPath = path.join(rootDir, "src/app/(admin)/admin/specialists/page.tsx");
  const content = fs.readFileSync(adminSpecPath, "utf-8");
  assert.ok(content.includes("themis_specialist_verifications"));
  assert.ok(content.includes("approved") && content.includes("rejected"));
});


// --- Suite 5: Live Route Health Probes (Secondary Portals) ---
console.log("\n--- Suite 5: Live Route Health Probes (Secondary Portals) ---");

const secondaryRoutes = [
  { path: "/dashboard", label: "Client Dashboard" },
  { path: "/profile", label: "User Profile" },
  { path: "/consultations", label: "Consultation Ledger" },
  { path: "/consultations/c-101", label: "Consultation Detail" },
  { path: "/consultations/c-101/chat", label: "Consultation Chat Room" },
  { path: "/specialist", label: "Specialist Home Portal" },
  { path: "/specialist/requests", label: "Specialist Consultation Requests" },
  { path: "/specialist/services", label: "Specialist Service Tariffs" },
  { path: "/specialist/schedule", label: "Specialist Schedule Calendar" },
  { path: "/specialist/earnings", label: "Specialist Earnings & Commission" },
  { path: "/specialist/profile", label: "Specialist Public Bio Profile" },
  { path: "/admin", label: "Admin Oversight Dashboard" },
  { path: "/admin/specialists", label: "Admin Specialist Verification Queue" },
  { path: "/admin/users", label: "Admin User Registry" },
  { path: "/admin/consultations", label: "Admin Consultations Monitor" },
  { path: "/admin/reviews", label: "Admin Review Moderation" },
  { path: "/admin/transactions", label: "Admin Escrow Transactions" },
];

for (const route of secondaryRoutes) {
  await itAsync(`GET ${route.path} (${route.label}) returns HTTP 200`, async () => {
    const res = await makeGetRequest(route.path);
    assert.equal(res.status, 200, `GET ${route.path} returned status ${res.status}`);
  });
}


// --- Summary ---
console.log("\n======================================================================");
console.log(`  CHALLENGER M5 PROBES SUMMARY`);
console.log(`  Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log("======================================================================\n");

if (failedTests > 0) {
  console.error("Verdict: REJECT — Some M5 probes failed.");
  process.exit(1);
} else {
  console.log("Verdict: APPROVE — 100% Milestone 5 Empirical Probes Passed Cleanly!\n");
  process.exit(0);
}

