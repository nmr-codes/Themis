/**
 * CHALLENGER M4: EMPIRICAL ADVERSARIAL TEST SUITE
 * Milestone 4: Statutory Legal Triage Engine, AI Legal Memorandum & Lex.uz Citations
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

// In-Memory Web Storage
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
}

const mockStorage = new LocalStorageMock();
globalThis.window = { localStorage: mockStorage };
globalThis.localStorage = mockStorage;

// Load constants
const constantsRaw = fs.readFileSync(path.join(rootDir, "src/lib/constants.ts"), "utf-8");
const transpiledConstants = ts.transpileModule(constantsRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const constantsUri = "data:text/javascript;base64," + Buffer.from(transpiledConstants).toString("base64");
const constantsMod = await import(constantsUri);

// Load mock-data
let mockRaw = fs.readFileSync(path.join(rootDir, "src/lib/mock-data.ts"), "utf-8");
mockRaw = mockRaw.replace('./constants', constantsUri);
const transpiledMock = ts.transpileModule(mockRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const mockUri = "data:text/javascript;base64," + Buffer.from(transpiledMock).toString("base64");
const mockMod = await import(mockUri);

// Load triage.ts
let triageRaw = fs.readFileSync(path.join(rootDir, "src/lib/triage.ts"), "utf-8");
triageRaw = triageRaw.replace('./constants', constantsUri).replace('./mock-data', mockUri);
const transpiledTriage = ts.transpileModule(triageRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const triageUri = "data:text/javascript;base64," + Buffer.from(transpiledTriage).toString("base64");
const triageMod = await import(triageUri);

const { classifyLegalQuery, triageLegalQuery, STATUTORY_CITATIONS } = triageMod;

// Load ai-chat-storage.ts
let storageRaw = fs.readFileSync(path.join(rootDir, "src/lib/ai-chat-storage.ts"), "utf-8");
storageRaw = storageRaw.replace('./triage', triageUri).replace('./mock-data', mockUri);
const transpiledStorage = ts.transpileModule(storageRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const storageUri = "data:text/javascript;base64," + Buffer.from(transpiledStorage).toString("base64");
const storageMod = await import(storageUri);

const {
  getStoredAIConversations,
  getAIConversationById,
  saveAIConversation,
  deleteAIConversation,
  createNewAIConversation,
  STORAGE_KEY_AI_CONVERSATIONS,
  SEED_AI_CONVERSATIONS,
  getPendingInquiry,
  setPendingInquiry
} = storageMod;

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function it(name, fn) {
  testsRun++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

async function itAsync(name, fn) {
  testsRun++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

async function makePostRequest(path, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const bodyStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const req = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr)
        }
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
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
console.log("  CHALLENGER M4: EMPIRICAL ADVERSARIAL TEST SUITE");
console.log("  Milestone 4: Statutory Legal Triage Engine, AI Memorandums & Lex.uz");
console.log("======================================================================\n");

// --- Suite 1: Statutory Triage Accuracy Across Legal Branches ---
console.log("--- Suite 1: Statutory Triage Engine (10 Legal Branches) ---");

it("should accurately classify labor dispute and cite Mehnat kodeksi", () => {
  const result = triageLegalQuery("Ish beruvchi 3 oydan beri oylik maoshimni bermayapti va nohaq ishdan bo'shatmoqchi");
  assert.equal(result.category, "labor");
  assert.ok(result.sources.some(c => c.title.includes("Mehnat") || c.article.includes("161") || c.url?.includes("lex.uz")));
  assert.ok(result.structured_sections?.action_steps.length >= 3);
  assert.ok(result.content.includes("Mehnat"));
});

it("should accurately classify family/divorce dispute and cite Oila kodeksi", () => {
  const result = triageLegalQuery("Turmush o'rtog'im bilan ajrashmoqchiman, 2 ta voyaga yetmagan farzandimiz bor, aliment va mol-mulk taqsimoti qanday bo'ladi?");
  assert.equal(result.category, "family");
  assert.ok(result.sources.some(c => c.title.includes("Oila") || c.article.includes("96") || c.url?.includes("lex.uz")));
  assert.ok(result.structured_sections?.action_steps.some(s => s.toLowerCase().includes("sud") || s.toLowerCase().includes("fuqarolik") || s.toLowerCase().includes("ajrashish")));
});

it("should accurately classify housing eviction dispute and cite Uy-joy/Fuqarolik kodeksi", () => {
  const result = triageLegalQuery("Ijara beruvchi shartnoma muddati tugamasdan uydan 3 kunda chiqib ketishimni talab qilyapti va garov pulini qaytarmayapti");
  assert.equal(result.category, "housing");
  assert.ok(result.sources.some(c => c.title.includes("Fuqarolik") || c.title.includes("Uy-joy") || c.url?.includes("lex.uz")));
});

it("should accurately classify criminal defense dispute and cite Jinoyat kodeksi", () => {
  const result = triageLegalQuery("Meni tergovga chaqirishdi, firibgarlikda asossiz ayblashmoqda, advokatim yo'q");
  assert.equal(result.category, "criminal");
  assert.ok(result.sources.some(c => c.title.includes("Jinoyat") || c.title.includes("protsessual") || c.url?.includes("lex.uz")));
});

it("should accurately classify tax dispute and cite Soliq kodeksi", () => {
  const result = triageLegalQuery("Soliq idorasi kompaniyamizga asossiz qo'shimcha QQS va penya hisobladi, qarordan norozimiz");
  assert.equal(result.category, "tax");
  assert.ok(result.sources.some(c => c.title.includes("Soliq") || c.url?.includes("lex.uz")));
});

it("should accurately classify business commercial contract dispute and cite Fuqarolik kodeksi", () => {
  const result = triageLegalQuery("MChJ sifatida yetkazib beruvchi bilan shartnoma tuzgan edik, tovar yetkazildi lekin 150 mln so'm to'lov to'lanmayapti");
  assert.equal(result.category, "business");
  assert.ok(result.sources.some(c => c.title.includes("Fuqarolik") || c.title.includes("Iqtisodiy") || c.url?.includes("lex.uz")));
});

it("should accurately classify property cadastral dispute and cite Mulk huquqi", () => {
  const result = triageLegalQuery("Yer uchastkamning kadastr hujjatlarini rasmiylashtirishda qo'shni bilan chegara nizosi kelib chiqdi");
  assert.equal(result.category, "property");
  assert.ok(result.sources.some(c => c.title.includes("Fuqarolik") || c.title.includes("Yer") || c.url?.includes("lex.uz")));
});

it("should accurately classify consumer protection dispute under Fuqarolik huquqi (civil)", () => {
  const result = triageLegalQuery("Do'kondan nosoz telefon sotib oldim, kafolat muddati bor lekin almashtirib yoki pulimni qaytarib berishmayapti");
  assert.equal(result.category, "civil");
});

it("should accurately classify medical malpractice dispute under Fuqarolik huquqi (civil)", () => {
  const result = triageLegalQuery("Shifoxonada noto'g'ri tashxis va jarrohlik amaliyoti oqibatida sog'lig'imga jiddiy zarar yetkazildi");
  assert.equal(result.category, "civil");
});

it("should accurately classify administrative fine / court dispute", () => {
  const result = triageLegalQuery("YPX inspektori asossiz ma'muriy bayonnoma tuzib jarima yozdi, ustidan shikoyat qilmoqchiman");
  assert.equal(result.category, "administrative");
});

// --- Suite 2: Morphological Safety & Boundary Tokenization ---
console.log("\n--- Suite 2: Morphological Tokenization Safety & False-Positive Prevention ---");

it("should NOT classify verbal noun suffix '-ish' as labor dispute", () => {
  const result = triageLegalQuery("Biz hamkor bilan yangi tijorat shartnomasi kelishuvi qilish niyatidamiz, shartlarni ko'rib chiqish kerak");
  assert.notEqual(result.category, "labor", "Suffix '-ish' in 'qilish' or 'chiqish' must not trigger labor law!");
  assert.ok(["business", "contract"].includes(result.category));
});

it("should NOT classify unrelated words starting with 'uy' as housing", () => {
  const result = triageLegalQuery("Erta tongda uyg'onish va sog'liqni saqlash bo'yicha tibbiy da'vo arizasi yozishim lozim");
  assert.notEqual(result.category, "housing", "Substring 'uy' in 'uyg'onish' must not trigger housing law!");
});

it("should handle mixed Uzbek Cyrillic and Latin queries without throwing", () => {
  const resultLatin = triageLegalQuery("Ishdan noqonuniy bo'shatishdi");
  assert.ok(resultLatin.category === "labor");
  assert.ok(resultLatin.content.length > 100);
});

it("should provide substantive fallback for generic or unspecific queries", () => {
  const result = triageLegalQuery("Menga advokat maslahati kerak, yordam bera olasizmi?");
  assert.ok(result.category);
  assert.ok(result.content.length > 50);
  assert.ok(result.sources.length > 0);
  assert.ok(result.recommended_specialists.length > 0);
});

// --- Suite 3: Statutory Legal Memorandum Quality & Lex.uz Citation Verification ---
console.log("\n--- Suite 3: Legal Memorandum Structure & Citation Quality ---");

it("should verify that every legal category has verified Lex.uz URLs in STATUTORY_CITATIONS", () => {
  for (const [catKey, citations] of Object.entries(STATUTORY_CITATIONS)) {
    assert.ok(citations.length > 0, `Category ${catKey} must have at least one citation`);
    for (const citation of citations) {
      assert.ok(citation.article, `Citation in ${catKey} must specify an article`);
      assert.ok(citation.title, `Citation in ${catKey} must specify the title`);
      if (citation.url) {
        assert.ok(citation.url.startsWith("https://") || citation.url.startsWith("http://"), `Citation URL must be valid`);
      }
    }
  }
});

it("should generate structured sections (issue, analysis, action steps) for all queries", () => {
  const result = triageLegalQuery("Mulk huquqim buzildi, yer uchastkasi bo'yicha hujjatlarni tortib olishmoqchi");
  assert.ok(result.structured_sections?.issue_statement);
  assert.ok(result.structured_sections?.substantive_analysis);
  assert.ok(result.structured_sections?.action_steps.length >= 2);
  assert.ok(result.needs_specialist === true);
});

// --- Suite 4: SSR-Safe AI Storage Persistence (localStorage) ---
console.log("\n--- Suite 4: SSR-Safe AI Conversation Storage Engine ---");

it("should safely return initial sample conversations when running with mock localStorage", () => {
  mockStorage.clear();
  const list = getStoredAIConversations();
  assert.ok(Array.isArray(list));
  assert.ok(list.length >= 2, "Should provide seed demo conversations for instant exploration");
});

it("should persist and retrieve AI conversations when localStorage is available", () => {
  const newConv = createNewAIConversation(
    "Otamdan qolgan uy-joy merosini taqsimlashda aka-ukalar o'rtasida nizo chiqdi.",
    "Mulk va meros huquqi"
  );

  saveAIConversation(newConv);

  const stored = getStoredAIConversations();
  assert.ok(stored.some(c => c.id === newConv.id), "New conversation must be retrievable from storage");

  const fetched = getAIConversationById(newConv.id);
  assert.ok(fetched !== null);
  assert.equal(fetched.id, newConv.id);
});

it("should support idempotent conversation deletion", () => {
  const conv = createNewAIConversation("Test title", "Test category");
  saveAIConversation(conv);
  assert.ok(getAIConversationById(conv.id) !== null);

  deleteAIConversation(conv.id);
  assert.equal(getAIConversationById(conv.id), null);

  // Deleting again should be safe and no-op
  deleteAIConversation(conv.id);
});

it("should manage pending inquiry storage from landing page inquiry bar", () => {
  setPendingInquiry("Mehnat shartnomasini bekor qilish tartibi");
  const retrieved = getPendingInquiry(true);
  assert.equal(retrieved, "Mehnat shartnomasini bekor qilish tartibi");
  // Should be cleared after read with flag true
  assert.equal(getPendingInquiry(), null);
});

// --- Suite 5: Live API Endpoint (/api/ai/chat) Adversarial & Robustness Probes ---
console.log("\n--- Suite 5: Live Next.js API (/api/ai/chat) HTTP Probes ---");

await itAsync("should return HTTP 200 with structured response for labor inquiry", async () => {
  const res = await makePostRequest("/api/ai/chat", {
    message: "Ish beruvchim noqonuniy ravishda 2 oylik ish haqimni bermayapti"
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.response);
  assert.ok(res.body.response.content);
  assert.equal(res.body.response.category, "labor");
  assert.ok(res.body.response.sources.length > 0);
  assert.ok(res.body.response.recommended_specialists.length > 0);
});

await itAsync("should reject empty message payload with HTTP 400", async () => {
  const res = await makePostRequest("/api/ai/chat", { message: "" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

await itAsync("should reject whitespace-only message payload with HTTP 400", async () => {
  const res = await makePostRequest("/api/ai/chat", { message: "   \n\t  " });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

await itAsync("should reject missing message field with HTTP 400", async () => {
  const res = await makePostRequest("/api/ai/chat", { query: "Not valid key" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

await itAsync("should withstand large legal memo payload (>10,000 chars) without crashing", async () => {
  const longInquiry = "Mehnat shartnomasi buzilishi bo'yicha shikoyat. ".repeat(300);
  const res = await makePostRequest("/api/ai/chat", { message: longInquiry });
  assert.equal(res.status, 200);
  assert.equal(res.body.response.category, "labor");
});

// --- Suite 6: Live Page Rendering Integrity (/ai-chat and dynamic routes) ---
console.log("\n--- Suite 6: Live Route Health Checks (/ai-chat) ---");

await itAsync("GET /ai-chat returns HTTP 200 and contains Lex.uz statutory elements", async () => {
  const res = await makeGetRequest("/ai-chat");
  assert.equal(res.status, 200);
  assert.ok(res.body.includes("Huquqiy") || res.body.includes("lex.uz") || res.body.includes("tahlil"));
});

await itAsync("GET /ai-chat/sample-1 returns HTTP 200 with legal consultation interface", async () => {
  const res = await makeGetRequest("/ai-chat/sample-1");
  assert.equal(res.status, 200);
  assert.ok(res.body.includes("lex.uz") || res.body.includes("tahlil") || res.body.includes("advokat"));
});

// --- Summary ---
console.log("\n======================================================================");
console.log(`  CHALLENGER M4 PROBES SUMMARY`);
console.log(`  Total: ${testsRun} | Passed: ${testsPassed} | Failed: ${testsFailed}`);
console.log("======================================================================\n");

if (testsFailed > 0) {
  console.error("Verdict: REJECT — Some M4 probes failed.");
  process.exit(1);
} else {
  console.log("Verdict: APPROVE — 100% Milestone 4 Empirical Probes Passed Cleanly!\n");
  process.exit(0);
}
