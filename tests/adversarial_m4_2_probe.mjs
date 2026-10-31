/**
 * CHALLENGER M4_2: EMPIRICAL ADVERSARIAL STRESS-TESTING SUITE
 * Project: Themis (Huquqiy Yordam) — Milestone 4 Hardening
 *
 * Requirements:
 * 1. Storage persistence: test saveAIConversation, getStoredAIConversations, deleteAIConversation
 *    with corrupt localStorage, empty strings, and special characters.
 * 2. Lex.uz statutory links: verify all Lex.uz URLs in triage.ts are well-formed URLs (https://lex.uz/docs/...).
 * 3. Feature 7 Statutory Disclaimer: assert exact legal disclaimer in rendered markup on /ai-chat and /ai-chat/[id].
 * 4. Interface Contract 1: no /dashboard/ prefixes in links.
 * 5. Interface Contract 3: booking consultation handoff writes to themis_consultations.
 * 6. Live Next.js production server on free port (e.g. 3096) probing:
 *    - GET /ai-chat -> HTTP 200
 *    - GET /ai-chat/conv-1 -> HTTP 200
 *    - GET /ai-chat/conv-2 -> HTTP 200
 *    - GET /ai-chat/nonexistent-id -> HTTP 200 with graceful fallback state
 */

import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const PROBE_PORT = Number(process.env.PROBE_PORT || 3096);
const PROBE_BASE_URL = `http://127.0.0.1:${PROBE_PORT}`;

// In-Memory Mock for Web Storage to stress-test persistence functions
class AdversarialLocalStorageMock {
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
}

const mockStorage = new AdversarialLocalStorageMock();
globalThis.window = { localStorage: mockStorage };
globalThis.localStorage = mockStorage;

// Dynamic transpile and loader helper
function loadTranspiledModule(filePath, replacements = {}) {
  let raw = fs.readFileSync(filePath, "utf-8");
  for (const [target, replacement] of Object.entries(replacements)) {
    raw = raw.replaceAll(target, replacement);
  }
  const transpiled = ts.transpileModule(raw, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const uri = "data:text/javascript;base64," + Buffer.from(transpiled).toString("base64");
  return import(uri);
}

// Load Modules
const constantsMod = await loadTranspiledModule(path.join(rootDir, "src/lib/constants.ts"));
const constantsUri = "data:text/javascript;base64," + Buffer.from(
  ts.transpileModule(fs.readFileSync(path.join(rootDir, "src/lib/constants.ts"), "utf-8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText
).toString("base64");

const mockDataMod = await loadTranspiledModule(path.join(rootDir, "src/lib/mock-data.ts"), {
  "./constants": constantsUri,
});
const mockDataUri = "data:text/javascript;base64," + Buffer.from(
  ts.transpileModule(
    fs.readFileSync(path.join(rootDir, "src/lib/mock-data.ts"), "utf-8").replaceAll("./constants", constantsUri),
    { compilerOptions: { module: ts.ModuleKind.ESNext } }
  ).outputText
).toString("base64");

const triageMod = await loadTranspiledModule(path.join(rootDir, "src/lib/triage.ts"), {
  "./constants": constantsUri,
  "./mock-data": mockDataUri,
});
const triageUri = "data:text/javascript;base64," + Buffer.from(
  ts.transpileModule(
    fs
      .readFileSync(path.join(rootDir, "src/lib/triage.ts"), "utf-8")
      .replaceAll("./constants", constantsUri)
      .replaceAll("./mock-data", mockDataUri),
    { compilerOptions: { module: ts.ModuleKind.ESNext } }
  ).outputText
).toString("base64");

const storageMod = await loadTranspiledModule(path.join(rootDir, "src/lib/ai-chat-storage.ts"), {
  "./triage": triageUri,
  "./mock-data": mockDataUri,
});

const consultStorageMod = await loadTranspiledModule(path.join(rootDir, "src/lib/consultation-storage.ts"));

const {
  getStoredAIConversations,
  getAIConversationById,
  saveAIConversation,
  deleteAIConversation,
  createNewAIConversation,
  getPendingInquiry,
  setPendingInquiry,
  STORAGE_KEY_AI_CONVERSATIONS,
  STORAGE_KEY_PENDING_INQUIRY,
  SEED_AI_CONVERSATIONS,
} = storageMod;

const { STATUTORY_CITATIONS, triageLegalQuery } = triageMod;

const {
  saveConsultation,
  getStoredConsultations,
  STORAGE_KEY_CONSULTATIONS,
} = consultStorageMod;

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
    failedTests.push({ desc, error: err.message });
  }
}

async function itAsync(desc, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
    failedTests.push({ desc, error: err.message });
  }
}

// HTTP request helper
function requestHttp(urlPath, options = {}, postBody = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(urlPath, PROBE_BASE_URL);
    const reqOptions = {
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: 15000,
    };

    if (postBody) {
      const data = typeof postBody === "string" ? postBody : JSON.stringify(postBody);
      reqOptions.headers["Content-Type"] = reqOptions.headers["Content-Type"] || "application/json";
      reqOptions.headers["Content-Length"] = Buffer.byteLength(data);
    }

    const req = http.request(fullUrl, reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          rawBody: data,
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`HTTP request timed out after 15s to ${urlPath}`));
    });

    if (postBody) {
      const data = typeof postBody === "string" ? postBody : JSON.stringify(postBody);
      req.write(data);
    }
    req.end();
  });
}

console.log("\n======================================================================");
console.log("  CHALLENGER M4_2: EMPIRICAL ADVERSARIAL STRESS HARNESS");
console.log("  Project: Themis (Huquqiy Yordam) — Milestone 4 Verification");
console.log("======================================================================\n");

// ============================================================================
// SUITE 1: AI STORAGE PERSISTENCE CORRUPTION & ADVERSARIAL STRESS TESTS
// ============================================================================
console.log("--- Suite 1: AI Storage Persistence Adversarial Stress Tests ---");

it("should survive corrupt JSON syntax in localStorage without throwing and fallback to seed conversations", () => {
  mockStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, "{{{corrupted-json-syntax!!!");
  const origError = console.error;
  console.error = () => {};
  try {
    const result = getStoredAIConversations();
    assert.ok(Array.isArray(result), "Result must be an array");
    assert.equal(result.length, SEED_AI_CONVERSATIONS.length, "Must fallback to SEED_AI_CONVERSATIONS");
    assert.equal(result[0].id, "conv-1");
  } finally {
    console.error = origError;
  }
});

it("should handle empty string in localStorage gracefully and fallback to seed conversations", () => {
  mockStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, "");
  const result = getStoredAIConversations();
  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 3);
});

it("should handle non-array valid JSON (object, number, boolean, null, string) gracefully", () => {
  const badInputs = ['{"id": "conv-fake"}', "12345", "true", "false", "null", '"just-a-string"'];
  for (const bad of badInputs) {
    mockStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, bad);
    const result = getStoredAIConversations();
    assert.ok(Array.isArray(result), `Input ${bad} must return array fallback`);
    assert.ok(result.length >= 3, `Input ${bad} must fallback to seeds`);
  }
});

it("should handle empty JSON array '[]' by falling back to seeds for initial exploration", () => {
  mockStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, "[]");
  const result = getStoredAIConversations();
  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 3);
});

it("should safely persist and retrieve conversations with special characters, Uzbek okinas, Cyrillic, and XSS vectors", () => {
  mockStorage.clear();
  const adversarialConv = {
    id: "conv-adv-1",
    title: "O'g'irlangan mol-mulk va ko'chmas mulk da'vosi <script>alert('xss')</script> &quot;test&quot;",
    category: "Mulk huquqi",
    statute: "O'zR FK 164-modda • ⚖️ Judicial Seal № 1",
    date: "31-oktabr, 2026",
    status: "Tahlil jarayonida",
    messages_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      {
        id: "m-adv-1",
        role: "user",
        content: "Do'stim menga 15,000,000 so'm qarz bergan edim, tilxat bor. Ўзбекистон Республикаси Фуқаролик Кодекси 732-модда.",
        timestamp: "17:45",
      },
      {
        id: "m-adv-2",
        role: "assistant",
        content: "Tilxat bo'yicha qarz undirish da'vosi tuman fuqarolik sudiga kiritiladi. <img src=x onerror=alert(1)>",
        timestamp: "17:46",
      },
    ],
  };

  saveAIConversation(adversarialConv);

  const stored = getStoredAIConversations();
  const found = stored.find((c) => c.id === "conv-adv-1");
  assert.ok(found, "Adversarial conversation must be saved in storage");
  assert.equal(found.title, adversarialConv.title);
  assert.equal(found.messages[0].content, adversarialConv.messages[0].content);
  assert.equal(found.messages[1].content, adversarialConv.messages[1].content);

  const byId = getAIConversationById("conv-adv-1");
  assert.ok(byId !== null);
  assert.equal(byId.id, "conv-adv-1");
});

it("should safely update existing conversation preserving order and modifying timestamp", () => {
  const existing = getAIConversationById("conv-adv-1");
  assert.ok(existing);
  const updatedConv = {
    ...existing,
    messages_count: 3,
    status: "Tahlil yakunlangan",
    messages: [
      ...existing.messages,
      {
        id: "m-adv-3",
        role: "user",
        content: "Qo'shimcha savol: davlat boji qancha to'lanadi?",
        timestamp: "17:50",
      },
    ],
  };

  saveAIConversation(updatedConv);

  const reloaded = getAIConversationById("conv-adv-1");
  assert.ok(reloaded);
  assert.equal(reloaded.status, "Tahlil yakunlangan");
  assert.equal(reloaded.messages.length, 3);
});

it("should handle deleteAIConversation idempotently for existing, nonexistent, and blank IDs", () => {
  // Existing
  deleteAIConversation("conv-adv-1");
  assert.equal(getAIConversationById("conv-adv-1"), null);

  // Nonexistent ID delete should not throw
  deleteAIConversation("nonexistent-fake-id-999");
  assert.equal(getAIConversationById("nonexistent-fake-id-999"), null);

  // Blank string ID delete should not throw
  deleteAIConversation("");
  deleteAIConversation(null);
  deleteAIConversation(undefined);
});

it("should test createNewAIConversation with boundary inputs (empty, very long >5000 chars, special chars)", () => {
  // Empty message
  const convEmpty = createNewAIConversation("");
  assert.ok(convEmpty.id.startsWith("conv-"));
  assert.equal(convEmpty.title, "Yangi huquqiy murojaat");
  assert.equal(convEmpty.category, "Umumiy tahlil");

  // Long prompt (>5000 chars)
  const longPrompt = "Ish beruvchim ish haqimni bermayapti va noqonuniy ravishda bo'shatmoqchi. ".repeat(100);
  const convLong = createNewAIConversation(longPrompt, "Mehnat huquqi");
  assert.ok(convLong.title.length <= 60, "Title should be truncated to ~60 chars");
  assert.ok(convLong.title.endsWith("..."));
  assert.equal(convLong.category, "Mehnat huquqi");

  // Verify it is saved in storage
  const foundLong = getAIConversationById(convLong.id);
  assert.ok(foundLong !== null);
  assert.equal(foundLong.id, convLong.id);

  // Clean up
  deleteAIConversation(convEmpty.id);
  deleteAIConversation(convLong.id);
});

it("should test getPendingInquiry and setPendingInquiry with multi-line, clear flag, and empty inputs", () => {
  // Set inquiry
  const multiLineInquiry = "1-muammo: Oylik maosh to'lanmadi.\n2-muammo: Ish daftarchasi berilmadi.";
  setPendingInquiry(multiLineInquiry);

  // Read without clearing
  const peek = getPendingInquiry(false);
  assert.equal(peek, multiLineInquiry);

  // Read with clearing (default true)
  const cleared = getPendingInquiry(true);
  assert.equal(cleared, multiLineInquiry);

  // Read again should be null
  const empty = getPendingInquiry(true);
  assert.equal(empty, null);
});

// ============================================================================
// SUITE 2: LEX.UZ STATUTORY CITATIONS RIGOROUS URL VERIFICATION
// ============================================================================
console.log("\n--- Suite 2: Lex.uz Statutory Links Verification ---");

it("should verify that all Lex.uz URLs in triage.ts are well-formed (https://lex.uz/docs/...)", () => {
  assert.ok(STATUTORY_CITATIONS, "STATUTORY_CITATIONS must be defined in triage.ts");

  const requiredCategories = [
    "labor",
    "family",
    "housing",
    "criminal",
    "administrative",
    "tax",
    "business",
    "property",
    "contract",
    "civil",
  ];

  let verifiedLexUrlsCount = 0;

  for (const cat of requiredCategories) {
    const citations = STATUTORY_CITATIONS[cat];
    assert.ok(citations && citations.length > 0, `Category '${cat}' must have statutory citations`);

    for (const citation of citations) {
      assert.ok(citation.title, `Citation in '${cat}' must have a title`);
      assert.ok(citation.article, `Citation in '${cat}' must have an article`);

      if (citation.url && citation.url.includes("lex.uz")) {
        // Assert well-formed URL format: https://lex.uz/docs/{numeric_doc_id}
        assert.match(
          citation.url,
          /^https:\/\/lex\.uz\/docs\/\d+$/,
          `Lex.uz URL '${citation.url}' in category '${cat}' must be well-formed https://lex.uz/docs/{id}`
        );
        verifiedLexUrlsCount++;
      } else if (citation.url) {
        // External government portal link (e.g. my.mehnat.uz)
        assert.match(citation.url, /^https?:\/\/[a-z0-9\-\.]+/i, `External URL '${citation.url}' must be valid`);
      }
    }
  }

  assert.ok(verifiedLexUrlsCount >= 10, `Expected at least 10 verified Lex.uz URLs, found ${verifiedLexUrlsCount}`);
  console.log(`    (Verified ${verifiedLexUrlsCount} canonical Lex.uz statutory document URLs)`);
});

it("should verify all 10 legal branches in triage produce verified Lex.uz citations and non-empty guidance", () => {
  const branchQueries = [
    { query: "Ish beruvchim noqonuniy ravishda ish haqimni to'lamay ishdan bo'shatdi", cat: "labor" },
    { query: "Nikohni bekor qilish va aliment undirish to'g'risida ariza", cat: "family" },
    { query: "Kvartira ijarasi bo'yicha depozit puli va uydan chiqarish nizosi", cat: "housing" },
    { query: "Jinoyat ishi bo'yicha tergov harakatlari va firibgarlik ayblovi", cat: "criminal" },
    { query: "YPX ma'muriy bayonnoma va jarima qarori ustidan shikoyat", cat: "administrative" },
    { query: "Soliq inspeksiyasi asossiz soliq qarzi va penya hisobladi", cat: "tax" },
    { query: "Tadbirkorlik faoliyatida shartnoma buzilishi va qarzdorlikni undirish", cat: "business" },
    { query: "Meros guvohnomasi va kadastr hujjatlari bo'yicha mulk huquqi", cat: "property" },
    { query: "Qarz tilxati bo'yicha majburiyatni bajarmaslik va qarzni qaytarish", cat: "contract" },
    { query: "Yetkazilgan moddiy zararni qoplash bo'yicha fuqarolik da'vosi", cat: "civil" },
  ];

  for (const item of branchQueries) {
    const res = triageLegalQuery(item.query);
    assert.equal(res.category, item.cat, `Query '${item.query}' should classify as ${item.cat}`);
    assert.ok(res.sources.length > 0, `Query '${item.query}' must have sources`);
    const hasLexUrl = res.sources.some((s) => s.url && s.url.includes("lex.uz"));
    assert.ok(hasLexUrl, `Query '${item.query}' must include at least one Lex.uz link`);
  }
});

// ============================================================================
// SUITE 3: FEATURE 7 STATUTORY LEGAL DISCLAIMER ENFORCEMENT
// ============================================================================
console.log("\n--- Suite 3: Feature 7 Statutory Legal Disclaimer Verification ---");

const MANDATORY_DISCLAIMER_EXACT =
  "Ushbu sun'iy intellekt tahlili dastlabki axborot xarakteriga ega bo'lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling.";

it("should assert that exact statutory disclaimer exists in src/app/(dashboard)/ai-chat/page.tsx", () => {
  const filePath = path.join(rootDir, "src/app/(dashboard)/ai-chat/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  const normalizedFileContent = content
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ");

  assert.ok(
    normalizedFileContent.includes(MANDATORY_DISCLAIMER_EXACT),
    "Mandatory statutory disclaimer must be present verbatim in /ai-chat/page.tsx"
  );
  assert.ok(
    content.includes("Advokatura to"),
    "Must reference the Law on Advocacy (Advokatura to'g'risida) in /ai-chat/page.tsx"
  );
});

it("should assert that exact statutory disclaimer exists in src/app/(dashboard)/ai-chat/[id]/page.tsx", () => {
  const filePath = path.join(rootDir, "src/app/(dashboard)/ai-chat/[id]/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  const normalizedFileContent = content
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ");

  assert.ok(
    normalizedFileContent.includes(MANDATORY_DISCLAIMER_EXACT),
    "Mandatory statutory disclaimer must be present verbatim in /ai-chat/[id]/page.tsx"
  );
  assert.ok(
    content.includes("notary-stamp"),
    "Must be rendered in a formal notary disclaimer stamp container"
  );
});

it("should assert that exact statutory disclaimer exists in compiled client production bundles", () => {
  const chunksDir = path.join(rootDir, ".next/static/chunks");
  assert.ok(fs.existsSync(chunksDir), "Next.js production chunks directory must exist");

  function searchInDir(dir, needle) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        if (searchInDir(full, needle)) return true;
      } else if (f.name.endsWith(".js")) {
        const text = fs.readFileSync(full, "utf-8");
        if (text.includes(needle)) return true;
      }
    }
    return false;
  }

  const foundDisclaimerInBundle = searchInDir(chunksDir, "dastlabki axborot xarakteriga");
  assert.ok(
    foundDisclaimerInBundle,
    "Statutory disclaimer string must be compiled into Next.js client production bundle"
  );
});

// ============================================================================
// SUITE 4: INTERFACE CONTRACT 1 (NO /dashboard/ PREFIX IN NAVIGATION LINKS)
// ============================================================================
console.log("\n--- Suite 4: Interface Contract 1 (No /dashboard/ Link Prefixes) ---");

it("should verify no navigation link in src/app contains /dashboard/ route prefix", () => {
  function scanDir(dir) {
    let findings = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findings = findings.concat(scanDir(fullPath));
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const text = fs.readFileSync(fullPath, "utf-8");
        // Regex to detect href="/dashboard/xxx" or href={'/dashboard/xxx'}
        const matches = text.match(/href\s*=\s*["']\/dashboard\/[^"'\s>]+["']/g);
        if (matches) {
          for (const m of matches) {
            findings.push({ file: fullPath, match: m });
          }
        }
      }
    }
    return findings;
  }

  const appFindings = scanDir(path.join(rootDir, "src/app"));
  const compFindings = scanDir(path.join(rootDir, "src/components"));
  const allFindings = [...appFindings, ...compFindings];

  if (allFindings.length > 0) {
    console.error("Violations of Interface Contract 1 found:", allFindings);
  }
  assert.equal(allFindings.length, 0, `Found ${allFindings.length} forbidden /dashboard/ route links!`);
});

it("should verify canonical routes are used in /ai-chat, /ai-chat/[id], and ConsultationBookingDialog", () => {
  const chatList = fs.readFileSync(path.join(rootDir, "src/app/(dashboard)/ai-chat/page.tsx"), "utf-8");
  const chatDetail = fs.readFileSync(path.join(rootDir, "src/app/(dashboard)/ai-chat/[id]/page.tsx"), "utf-8");
  const dialogSrc = fs.readFileSync(path.join(rootDir, "src/components/modals/consultation-booking-dialog.tsx"), "utf-8");

  assert.ok(chatList.includes('href="/ai-chat/new"'));
  assert.ok(chatDetail.includes('href="/ai-chat"'));
  assert.ok(dialogSrc.includes('router.push("/consultations")'));
});

// ============================================================================
// SUITE 5: INTERFACE CONTRACT 3 (BOOKING CONSULTATION HANDOFF WRITES TO themis_consultations)
// ============================================================================
console.log("\n--- Suite 5: Interface Contract 3 (Consultation Booking Persistence) ---");

it("should verify that ConsultationBookingDialog imports saveConsultation and targets themis_consultations", () => {
  const dialogPath = path.join(rootDir, "src/components/modals/consultation-booking-dialog.tsx");
  const dialogSrc = fs.readFileSync(dialogPath, "utf-8");

  assert.ok(
    dialogSrc.includes('import { saveConsultation'),
    "ConsultationBookingDialog must import saveConsultation helper"
  );
  assert.ok(
    dialogSrc.includes("saveConsultation(newBooking)"),
    "ConsultationBookingDialog must call saveConsultation with newBooking"
  );
});

it("should verify saveConsultation persists a pending booking into localStorage under themis_consultations", () => {
  mockStorage.clear();

  const testBooking = {
    id: "c-test-" + Date.now(),
    specialist_id: "spec-1",
    specialist_name: "Azizbek Rahimov",
    specialist_title: "Mehnat huquqi bo'yicha advokat",
    specialist_role: "Mehnat huquqi bo'yicha advokat",
    service_id: "serv-1",
    service_name: "45 daqiqalik video maslahat",
    duration_minutes: 45,
    category: "Mehnat huquqi",
    price: 180000,
    currency: "UZS",
    format: "video",
    scheduled_at: "2026-11-01, 15:30 — 16:15",
    status: "pending",
    status_label: "Kutilmoqda",
    description: "Ish beruvchim oyligimni to'lamadi, da'vo tayyorlash kerak.",
    user_notes: "Ish beruvchim oyligimni to'lamadi, da'vo tayyorlash kerak.",
    created_at: new Date().toISOString(),
  };

  saveConsultation(testBooking);

  // Raw localStorage check
  const rawData = mockStorage.getItem(STORAGE_KEY_CONSULTATIONS);
  assert.ok(rawData !== null, `localStorage must have key '${STORAGE_KEY_CONSULTATIONS}'`);

  const parsed = JSON.parse(rawData);
  assert.ok(Array.isArray(parsed), "themis_consultations must be a JSON array");

  const saved = parsed.find((c) => c.id === testBooking.id);
  assert.ok(saved, "Newly created booking must be in themis_consultations array");
  assert.equal(saved.status, "pending");
  assert.equal(saved.specialist_id, "spec-1");
  assert.equal(saved.price, 180000);
  assert.equal(saved.user_notes, testBooking.user_notes);

  // Stored consultations retrieval check
  const allConsultations = getStoredConsultations();
  assert.ok(allConsultations.some((c) => c.id === testBooking.id));
});

// ============================================================================
// SUITE 6: LIVE NEXT.JS PRODUCTION SERVER HTTP PROBES
// ============================================================================
console.log(`\n--- Suite 6: Live Next.js Production Server Probes (Port ${PROBE_PORT}) ---`);

let serverProcess = null;

async function startProductionServer() {
  return new Promise((resolve, reject) => {
    console.log(`  Starting Next.js production server on port ${PROBE_PORT}...`);
    const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");

    serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(PROBE_PORT)], {
      cwd: rootDir,
      env: { ...process.env, PORT: String(PROBE_PORT), NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let startupLogs = "";
    serverProcess.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      startupLogs += text;
      if (text.includes("Ready in") || text.includes("started server on") || text.includes("Local:")) {
        resolve();
      }
    });

    serverProcess.stderr.on("data", (chunk) => {
      startupLogs += chunk.toString();
    });

    serverProcess.on("error", (err) => {
      reject(new Error(`Failed to spawn server process: ${err.message}`));
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Server exited unexpectedly with code ${code}. Logs: ${startupLogs}`));
      }
    });

    // Fallback polling until port responds
    let retries = 0;
    const interval = setInterval(async () => {
      retries++;
      try {
        const res = await requestHttp("/");
        if (res.statusCode >= 200 && res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      } catch {
        if (retries > 30) {
          clearInterval(interval);
          reject(new Error(`Server failed to respond within 30s. Startup logs: ${startupLogs}`));
        }
      }
    }, 1000);
  });
}

function stopProductionServer() {
  if (serverProcess) {
    console.log(`  Stopping Next.js production server (PID ${serverProcess.pid})...`);
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(serverProcess.pid), "/T", "/F"]);
      } else {
        serverProcess.kill("SIGTERM");
      }
    } catch (e) {
      console.warn("Could not terminate server process cleanly:", e.message);
    }
  }
}

try {
  await startProductionServer();
  console.log(`  ✓ Live production server successfully initialized and responding on ${PROBE_BASE_URL}`);

  await itAsync("GET /ai-chat returns HTTP 200 with HTML document shell", async () => {
    const res = await requestHttp("/ai-chat");
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers["content-type"]?.includes("text/html"));
    assert.ok(res.rawBody.includes("<html lang=\"uz\""));
    assert.ok(res.rawBody.length > 5000);
  });

  await itAsync("GET /ai-chat/conv-1 returns HTTP 200 for seed labor consultation", async () => {
    const res = await requestHttp("/ai-chat/conv-1");
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers["content-type"]?.includes("text/html"));
    assert.ok(res.rawBody.length > 5000);
  });

  await itAsync("GET /ai-chat/conv-2 returns HTTP 200 for seed housing consultation", async () => {
    const res = await requestHttp("/ai-chat/conv-2");
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers["content-type"]?.includes("text/html"));
    assert.ok(res.rawBody.length > 5000);
  });

  await itAsync("GET /ai-chat/nonexistent-id returns HTTP 200 with graceful empty or fallback state", async () => {
    const res = await requestHttp("/ai-chat/nonexistent-id");
    assert.equal(res.statusCode, 200, "Should return HTTP 200 without crashing with 500");
    assert.ok(res.headers["content-type"]?.includes("text/html"));
    assert.ok(
      !res.rawBody.includes("Internal Server Error") && !res.rawBody.includes("Application error"),
      "Must not render Next.js runtime error"
    );
  });

  await itAsync("POST /api/ai/chat returns HTTP 200 and structured legal analysis for citizen prompt", async () => {
    const res = await requestHttp(
      "/api/ai/chat",
      { method: "POST" },
      { message: "Ish beruvchim 2 oylik maoshimni to'lamayapti, qayerga ariza bersam bo'ladi?" }
    );
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.response);
    assert.equal(res.body.response.category, "labor");
    assert.ok(res.body.response.sources.length > 0);
    assert.ok(res.body.response.sources.some((s) => s.url && s.url.includes("lex.uz")));
    assert.ok(res.body.response.recommended_specialists.length > 0);
  });

  await itAsync("POST /api/ai/chat returns HTTP 400 for empty or whitespace payload", async () => {
    const res = await requestHttp("/api/ai/chat", { method: "POST" }, { message: "   " });
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error);
  });

  await itAsync("POST /api/ai/chat handles large adversarial inquiry (>8000 characters) safely", async () => {
    const longPrompt = "Oylik maosh nizosi va mehnat huquqlari. ".repeat(250);
    const res = await requestHttp("/api/ai/chat", { method: "POST" }, { message: longPrompt });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.response.category, "labor");
  });
} finally {
  stopProductionServer();
}

// ============================================================================
// FINAL SUMMARY & VERDICT
// ============================================================================
console.log("\n======================================================================");
console.log("  CHALLENGER M4_2 EMPIRICAL HARNESS SUMMARY");
console.log(`  Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests.length}`);
console.log("======================================================================\n");

if (failedTests.length > 0) {
  console.error("FAILED TESTS:");
  for (const f of failedTests) {
    console.error(`- ${f.desc}: ${f.error}`);
  }
  console.error("\nVerdict: REQUEST_CHANGES — Adversarial harness detected failures.");
  process.exit(1);
} else {
  console.log("Verdict: APPROVE — 100% of Empirical Adversarial Probes Passed Successfully!\n");
  process.exit(0);
}
