/**
 * CHALLENGER M4: EMPIRICAL ADVERSARIAL STRESS TEST HARNESS
 * Target: Legal Triage Engine (src/lib/triage.ts) and Backend API (src/app/api/ai/chat/route.ts)
 * 
 * Verifies:
 * 1. Keyword collision probes ("ish" verbal nouns, "uy" substring collisions)
 * 2. Cyrillic probe classifications
 * 3. Additional adversarial morphological edge cases
 * 4. Live HTTP endpoint (/api/ai/chat) responses, error handling, boundaries (>5k chars)
 * 5. Matched specialists for all 10 legal branches
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

// --- Transpile & Load Modules ---
const constantsRaw = fs.readFileSync(path.join(rootDir, "src/lib/constants.ts"), "utf-8");
const transpiledConstants = ts.transpileModule(constantsRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const constantsUri = "data:text/javascript;base64," + Buffer.from(transpiledConstants).toString("base64");
const constantsMod = await import(constantsUri);

let mockRaw = fs.readFileSync(path.join(rootDir, "src/lib/mock-data.ts"), "utf-8");
mockRaw = mockRaw.replace('./constants', constantsUri);
const transpiledMock = ts.transpileModule(mockRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const mockUri = "data:text/javascript;base64," + Buffer.from(transpiledMock).toString("base64");
const mockMod = await import(mockUri);

let triageRaw = fs.readFileSync(path.join(rootDir, "src/lib/triage.ts"), "utf-8");
triageRaw = triageRaw.replace('./constants', constantsUri).replace('./mock-data', mockUri);
const transpiledTriage = ts.transpileModule(triageRaw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const triageUri = "data:text/javascript;base64," + Buffer.from(transpiledTriage).toString("base64");
const triageMod = await import(triageUri);

const { classifyLegalQuery, triageLegalQuery, matchSpecialists, STATUTORY_CITATIONS } = triageMod;
const { LEGAL_CATEGORIES } = constantsMod;
const { MOCK_SPECIALISTS } = mockMod;

// --- Test Reporter ---
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
    failures.push({ name, error: err.message });
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
    failures.push({ name, error: err.message });
  }
}

// --- HTTP Helpers ---
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
          "Content-Length": Buffer.byteLength(bodyStr),
        },
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

console.log("======================================================================");
console.log("  CHALLENGER M4: EMPIRICAL ADVERSARIAL STRESS TEST HARNESS");
console.log("  Target: Triage Engine (src/lib/triage.ts) & API (/api/ai/chat)");
console.log("======================================================================\n");

// ====================================================================
// SECTION 1: MANDATED 'ISH' COLLISION PROBES
// ====================================================================
console.log("--- Section 1: Mandated 'ish' Keyword Collision Probes ---");

it("Probe ISH-1: 'Aliment undirish to\\'g\\'risida ariza' MUST classify as family, NOT labor", () => {
  const query = "Aliment undirish to'g'risida ariza";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "labor", `Query '${query}' must NOT classify as labor!`);
  assert.equal(res.category, "family", `Query '${query}' must classify as family, got ${res.category}`);
});

it("Probe ISH-2: 'Notarius orqali ishonchnoma berish tartibi' MUST classify as civil, NOT labor", () => {
  const query = "Notarius orqali ishonchnoma berish tartibi";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "labor", `Query '${query}' must NOT classify as labor!`);
  assert.equal(res.category, "civil", `Query '${query}' must classify as civil, got ${res.category}`);
});

it("Probe ISH-3: 'Yetkazib berish shartnomasi buzildi' MUST classify as contract, NOT labor", () => {
  const query = "Yetkazib berish shartnomasi buzildi";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "labor", `Query '${query}' must NOT classify as labor!`);
  assert.equal(res.category, "contract", `Query '${query}' must classify as contract, got ${res.category}`);
});

it("Probe ISH-4: 'Ko\\'chmas mulkni taqsimlash va ulush ajratish' MUST classify as property, NOT labor", () => {
  const query = "Ko'chmas mulkni taqsimlash va ulush ajratish";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "labor", `Query '${query}' must NOT classify as labor!`);
  assert.equal(res.category, "property", `Query '${query}' must classify as property, got ${res.category}`);
});

it("Probe ISH-5: 'Ish haqi to\\'lanmadi, ishdan noqonuniy bo\\'shatishdi' MUST classify as labor", () => {
  const query = "Ish haqi to'lanmadi, ishdan noqonuniy bo'shatishdi";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "labor", `Query '${query}' must classify as labor, got ${res.category}`);
});

// ====================================================================
// SECTION 2: MANDATED 'UY' COLLISION PROBES
// ====================================================================
console.log("\n--- Section 2: Mandated 'uy' Substring Collision Probes ---");

it("Probe UY-1: 'MCHJ buyurtmachi to\\'lov qilmadi' MUST classify as contract/business, NOT housing", () => {
  const query = "MCHJ buyurtmachi to'lov qilmadi";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "housing", `Query '${query}' must NOT classify as housing!`);
  assert.ok(
    res.category === "contract" || res.category === "business",
    `Query '${query}' must classify as contract or business, got ${res.category}`
  );
});

it("Probe UY-2: 'Sud buyrug\\'i ijro etilmadi' MUST classify as civil/administrative, NOT housing", () => {
  const query = "Sud buyrug'i ijro etilmadi";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "housing", `Query '${query}' must NOT classify as housing!`);
  assert.ok(
    res.category === "civil" || res.category === "administrative",
    `Query '${query}' must classify as civil or administrative, got ${res.category}`
  );
});

it("Probe UY-3: 'Mening xonadonimdan uydan majburiy chiqarishmoqda' MUST classify as housing", () => {
  const query = "Mening xonadonimdan uydan majburiy chiqarishmoqda";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "housing", `Query '${query}' must classify as housing, got ${res.category}`);
});

it("Probe UY-4: 'Ijara shartnomasi va depozit qaytarilmadi' MUST classify as housing", () => {
  const query = "Ijara shartnomasi va depozit qaytarilmadi";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "housing", `Query '${query}' must classify as housing, got ${res.category}`);
});

// ====================================================================
// SECTION 3: MANDATED CYRILLIC PROBES
// ====================================================================
console.log("\n--- Section 3: Mandated Cyrillic Probes ---");

it("Probe CYR-1: 'Иш берувчим ойлик маош бермаяпти' MUST classify as labor", () => {
  const query = "Иш берувчим ойлик маош бермаяпти";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "labor", `Query '${query}' must classify as labor, got ${res.category}`);
});

it("Probe CYR-2: 'Алимент ундириш бўйича даъво' MUST classify as family", () => {
  const query = "Алимент ундириш бўйича даъво";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "family", `Query '${query}' must classify as family, got ${res.category}`);
});

it("Probe CYR-3: 'Ижара пулини қайтармаяпти' MUST classify as housing", () => {
  const query = "Ижара пулини қайтармаяпти";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "housing", `Query '${query}' must classify as housing, got ${res.category}`);
});

// ====================================================================
// SECTION 4: EXTRA ADVERSARIAL STRESS PROBES
// ====================================================================
console.log("\n--- Section 4: Extra Adversarial Stress Probes ---");

it("Stress-1: Action suffix '-ish' in commercial negotiations must NOT trigger labor", () => {
  const query = "Kompaniyalar o'rtasida shartnoma tuzish va kelishuvga erishish jarayoni";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "labor", "Action suffixes '-ish' must not trigger labor");
  assert.ok(["contract", "business", "civil"].includes(res.category));
});

it("Stress-2: False positive 'uy' in words (uyg'onish, tuyg'u, buyurtma) must NOT trigger housing", () => {
  const query = "Xarid qilingan buyurtma bo'yicha e'tiroz va to'lov nizosi";
  const res = classifyLegalQuery(query);
  assert.notEqual(res.category, "housing", "Substring 'uy' in 'buyurtma' must not trigger housing");
});

it("Stress-3: Criminal inquiry with Latin diacritics must classify as criminal", () => {
  const query = "Tergov organi tomonidan noqonuniy qamoqqa olish va firibgarlik ayblovi";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "criminal");
});

it("Stress-4: Administrative radar fine inquiry must classify as administrative", () => {
  const query = "YHX radar jarimasi va ma'muriy bayonnoma ustidan shikoyat";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "administrative");
});

it("Stress-5: Tax audit and penalty must classify as tax", () => {
  const query = "Soliq tekshiruvi natijasida qo'shilgan penya va inkasso topshiriqnomasi";
  const res = classifyLegalQuery(query);
  assert.equal(res.category, "tax");
});

// ====================================================================
// SECTION 5: LIVE HTTP SERVER VERIFICATION (/api/ai/chat)
// ====================================================================
console.log("\n--- Section 5: Live HTTP Endpoint (/api/ai/chat) Verification ---");

await itAsync("HTTP-1: Empty input returns HTTP 400 with descriptive error", async () => {
  const res = await makePostRequest("/api/ai/chat", { message: "" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error, "Should return an error message");
  assert.ok(res.body.error.includes("Xabar") || res.body.error.includes("kiritilmadi"));
});

await itAsync("HTTP-2: Whitespace-only input returns HTTP 400", async () => {
  const res = await makePostRequest("/api/ai/chat", { message: "   \t \n  " });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

await itAsync("HTTP-3: Missing message field returns HTTP 400", async () => {
  const res = await makePostRequest("/api/ai/chat", {});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

await itAsync("HTTP-4: Extremely long inquiry (>5,000 characters) processes without crashing", async () => {
  const repeated = "Mening mehnat huquqlarim buzildi, ish beruvchim maosh to'lamayapti. ".repeat(150);
  assert.ok(repeated.length > 5000, `Payload must exceed 5000 chars, got ${repeated.length}`);
  
  const res = await makePostRequest("/api/ai/chat", { message: repeated });
  assert.equal(res.status, 200);
  assert.ok(res.body.response);
  assert.equal(res.body.response.category, "labor");
  assert.ok(res.body.response.content.length > 50);
});

await itAsync("HTTP-5: Labor response MUST contain required phrases ('Mehnat huquqi', 'Mehnat kodeksiga binoan')", async () => {
  const res = await makePostRequest("/api/ai/chat", {
    message: "Ish haqi to'lanmadi, ishdan noqonuniy bo'shatishdi",
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.response.category, "labor");
  const content = res.body.response.content;
  assert.ok(
    content.includes("Mehnat huquqi"),
    `Response must contain 'Mehnat huquqi', got: ${content}`
  );
  assert.ok(
    content.includes("Mehnat kodeksiga binoan"),
    `Response must contain 'Mehnat kodeksiga binoan', got: ${content}`
  );
  // Also verify Lex.uz statutory sources
  assert.ok(
    res.body.response.sources.some((s) => s.title.includes("Mehnat") && s.article.includes("161")),
    "Sources must include Mehnat Kodeksi 161-modda"
  );
});

// ====================================================================
// SECTION 6: MATCHED SPECIALISTS FOR ALL 10 LEGAL BRANCHES
// ====================================================================
console.log("\n--- Section 6: Matched Specialists Coverage for All 10 Legal Branches ---");

const ALL_10_BRANCHES = [
  "labor",
  "family",
  "civil",
  "housing",
  "criminal",
  "administrative",
  "business",
  "property",
  "contract",
  "tax",
];

for (const branch of ALL_10_BRANCHES) {
  it(`Specialist Match [${branch}]: matchSpecialists returns at least 1 recommended specialist`, () => {
    const matched = matchSpecialists(branch);
    assert.ok(
      Array.isArray(matched) && matched.length > 0,
      `Category '${branch}' must return at least 1 specialist, got ${matched?.length}`
    );
    // Verify each returned specialist is valid
    for (const s of matched) {
      assert.ok(s.id, `Specialist must have an id`);
      assert.ok(s.full_name, `Specialist must have a full_name`);
      assert.equal(s.verification_status, "approved", `Only approved specialists should be recommended`);
    }
  });

  await itAsync(`HTTP Match [${branch}]: live API returns non-empty recommended_specialists`, async () => {
    // Generate a representative query for the branch
    const queryMap = {
      labor: "Ish beruvchim maosh to'lamayapti",
      family: "Nikohdan ajralish va aliment undirish",
      civil: "Yetkazilgan moddiy zararni qoplash",
      housing: "Uydan majburiy chiqarish va ijara depoziti",
      criminal: "Tergov organlari va jinoyat ishi bo'yicha himoya",
      administrative: "YHX ma'muriy jarimasi ustidan shikoyat",
      business: "MCHJ ta'sischilari o'rtasidagi nizo",
      property: "Meros taqsimoti va mulk huquqi",
      contract: "Yetkazib berish shartnomasi buzildi",
      tax: "Soliq inspektsiyasi hisoblagan penya",
    };

    const res = await makePostRequest("/api/ai/chat", { message: queryMap[branch] });
    assert.equal(res.status, 200);
    assert.ok(res.body.response, `Response body must contain response object`);
    const specs = res.body.response.recommended_specialists;
    assert.ok(
      Array.isArray(specs) && specs.length > 0,
      `API for '${branch}' must return recommended_specialists, got ${specs?.length}`
    );
  });
}

// ====================================================================
// SUMMARY & VERDICT
// ====================================================================
console.log("\n======================================================================");
console.log(`  CHALLENGER M4 STRESS TEST EXECUTION SUMMARY`);
console.log(`  Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log("======================================================================\n");

if (failedTests > 0) {
  console.error("FAILURES:");
  for (const f of failures) {
    console.error(`- ${f.name}: ${f.error}`);
  }
  console.error("\nFinal Verdict: REQUEST_CHANGES (Regressions/Defects Detected)");
  process.exit(1);
} else {
  console.log("All adversarial probes passed successfully!");
  console.log("Final Verdict: APPROVE");
  process.exit(0);
}
