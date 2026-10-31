import fs from "node:fs";
import ts from "typescript";

console.log("======================================================================");
console.log("  THEMIS M4 ADVERSARIAL STRESS TEST & INTEGRITY VERIFICATION");
console.log("======================================================================");

// Read actual implementation files
const triageCode = fs.readFileSync("./src/lib/triage.ts", "utf-8");
const storageCode = fs.readFileSync("./src/lib/ai-chat-storage.ts", "utf-8");
const mockDataCode = fs.readFileSync("./src/lib/mock-data.ts", "utf-8");
const chatRouteCode = fs.readFileSync("./src/app/api/ai/chat/route.ts", "utf-8");
const aiChatPageCode = fs.readFileSync("./src/app/(dashboard)/ai-chat/page.tsx", "utf-8");
const aiChatIdPageCode = fs.readFileSync("./src/app/(dashboard)/ai-chat/[id]/page.tsx", "utf-8");

let passedCount = 0;
let failedCount = 0;

function assertTest(name, condition, details = "") {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${name} ${details}`);
    failedCount++;
  }
}

// ---------------------------------------------------------
// TEST GROUP 1: INTEGRITY VIOLATION CHECKS
// ---------------------------------------------------------
console.log("\n[TEST GROUP 1] Integrity & Anti-Cheating Verification");

const e2ePrompts = [
  "Ish beruvchim 2 oydan beri oylik maoshimni bermayapti va ishdan bo'shatish bilan tahdid qilmoqda",
  "Nikohdan ajralmoqchiman, voyaga yetmagan bolam uchun aliment belgilash tartibi qanday?",
  "Ijara uy egasi garov pulini bermayapti va kvartira shartnomasi bo'yicha e'tiroz bildirmoqda",
  "MCHJ buyurtmachi to'lov qilmadi",
];

for (const prompt of e2ePrompts) {
  const isHardcodedInTriage = triageCode.includes(prompt);
  const isHardcodedInRoute = chatRouteCode.includes(prompt);
  assertTest(`No hardcoded test prompt in triage.ts: "${prompt.slice(0, 30)}..."`, !isHardcodedInTriage);
  assertTest(`No hardcoded test prompt in route.ts: "${prompt.slice(0, 30)}..."`, !isHardcodedInRoute);
}

assertTest("Triage has normalizeUzbek implementation", triageCode.includes("function normalizeUzbek"));
assertTest("Triage has extractUzbekTokens implementation", triageCode.includes("function extractUzbekTokens"));
assertTest("Triage has classifyLegalQuery implementation", triageCode.includes("function classifyLegalQuery"));
assertTest("Triage has matchSpecialists implementation", triageCode.includes("function matchSpecialists"));
assertTest("Triage has generateLegalAnalysis implementation", triageCode.includes("function generateLegalAnalysis"));

// ---------------------------------------------------------
// TEST GROUP 2: CATEGORY COVERAGE & SPECIALIST COMPLETENESS
// ---------------------------------------------------------
console.log("\n[TEST GROUP 2] 10 Legal Branches & Specialist Coverage");

const all10Branches = [
  "labor", "family", "civil", "housing", "criminal",
  "administrative", "business", "property", "contract", "tax"
];

for (const branch of all10Branches) {
  const hasCitation = triageCode.includes(`${branch}: [`);
  assertTest(`Statutory citations defined for category "${branch}"`, hasCitation);
  
  const hasScoringRule = triageCode.includes(`${branch}: {`);
  assertTest(`Scoring rule dictionary defined for category "${branch}"`, hasScoringRule);
}

assertTest("Specialist spec-1 exists (Labor, Civil)", mockDataCode.includes('id: "spec-1"'));
assertTest("Specialist spec-2 exists (Family, Property)", mockDataCode.includes('id: "spec-2"'));
assertTest("Specialist spec-3 exists (Housing, Contract)", mockDataCode.includes('id: "spec-3"'));
assertTest("Specialist spec-4 exists (Criminal, Administrative)", mockDataCode.includes('id: "spec-4"'));
assertTest("Specialist spec-5 exists (Business, Tax)", mockDataCode.includes('id: "spec-5"'));

// ---------------------------------------------------------
// TEST GROUP 3: ROUTING CONTRACT & INTERFACE CONTRACT 1
// ---------------------------------------------------------
console.log("\n[TEST GROUP 3] Interface Contract 1: Route Normalization");

const dashboardPrefixViolations = [
  "/dashboard/ai-chat",
  "/dashboard/specialists",
  "/dashboard/consultations",
  "/dashboard/profile",
];

for (const badRoute of dashboardPrefixViolations) {
  assertTest(`No occurrence of ${badRoute} in ai-chat page.tsx`, !aiChatPageCode.includes(badRoute));
  assertTest(`No occurrence of ${badRoute} in ai-chat/[id] page.tsx`, !aiChatIdPageCode.includes(badRoute));
}

assertTest("Canonical /ai-chat link present in ai-chat/[id]/page.tsx", aiChatIdPageCode.includes('href="/ai-chat"'));
assertTest("Canonical /specialists/[id] link present in ai-chat/[id]/page.tsx", aiChatIdPageCode.includes('href={`/specialists/${spec.id}`}'));

// ---------------------------------------------------------
// TEST GROUP 4: PERSISTENCE & SSR SAFETY
// ---------------------------------------------------------
console.log("\n[TEST GROUP 4] Storage Persistence & SSR Safety");

assertTest("Storage checks typeof window !== 'undefined' on read", storageCode.includes('typeof window === "undefined"'));
assertTest("Storage defines themis_ai_conversations key", storageCode.includes('"themis_ai_conversations"'));
assertTest("Storage defines themis_pending_inquiry key", storageCode.includes('"themis_pending_inquiry"'));
assertTest("Storage has fallback SEED_AI_CONVERSATIONS", storageCode.includes("SEED_AI_CONVERSATIONS"));
assertTest("Page uses client-side mount before loading storage", aiChatPageCode.includes("useEffect") && aiChatPageCode.includes("setMounted(true)"));

// ---------------------------------------------------------
// TEST GROUP 5: MOBILE VIEWPORT & ERGONOMICS
// ---------------------------------------------------------
console.log("\n[TEST GROUP 5] Mobile Viewport & Ergonomics");

assertTest("ai-chat/[id] uses dynamic 100dvh height", aiChatIdPageCode.includes("100dvh"));
assertTest("ai-chat/[id] sticky blurred input bar present", aiChatIdPageCode.includes("sticky bottom-0") && aiChatIdPageCode.includes("backdrop-blur"));
assertTest("ai-chat/[id] scroll container is overflow-y-auto", aiChatIdPageCode.includes("overflow-y-auto"));
assertTest("ai-chat/[id] outer wrapper has overflow-hidden", aiChatIdPageCode.includes("overflow-hidden"));
assertTest("Statutory disclaimer present in ai-chat/page.tsx", aiChatPageCode.includes("Advokatura to'g'risida") || aiChatPageCode.includes("Advokatura to&apos;g&apos;risida"));
assertTest("Statutory disclaimer present in ai-chat/[id]/page.tsx", aiChatIdPageCode.includes("Advokatura to'g'risida") || aiChatIdPageCode.includes("Advokatura to&apos;g&apos;risida"));

// ---------------------------------------------------------
// TEST GROUP 6: TRIAGE ALGORITHM & COLLISION RESOLUTION
// ---------------------------------------------------------
console.log("\n[TEST GROUP 6] Tokenized Classification & Collision Resolution");

// Transpile triage.ts using typescript compiler
const transOutput = ts.transpileModule(triageCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

// Create mock data transpiled module
const mockTransOutput = ts.transpileModule(mockDataCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

// Run in CommonJS sandbox
const mockModule = { exports: {} };
const mockFn = new Function("exports", "require", "module", mockTransOutput.outputText.replace(/require\(['"].\/constants['"]\)/, JSON.stringify({ LEGAL_CATEGORIES: all10Branches.map(id => ({ id })) })));
mockFn(mockModule.exports, () => ({ LEGAL_CATEGORIES: [] }), mockModule);

const triageModule = { exports: {} };
const triageFn = new Function("exports", "require", "module", transOutput.outputText);
triageFn(triageModule.exports, (mod) => {
  if (mod === "./mock-data") return mockModule.exports;
  if (mod === "./constants") return { LEGAL_CATEGORIES: [] };
  return {};
}, triageModule);

const { classifyLegalQuery, triageLegalQuery, normalizeUzbek, extractUzbekTokens } = triageModule.exports;

const testCases = [
  {
    name: "Aliment ariza (must be family, NOT labor)",
    input: "Aliment undirish to'g'risida ariza va sud buyrug'i",
    expected: "family",
  },
  {
    name: "Ishonchnoma berish (must NOT be labor)",
    input: "Notarius orqali ishonchnoma berish tartibi",
    notExpected: "labor",
  },
  {
    name: "MCHJ buyurtmachi to'lov (must be business/contract, NOT housing)",
    input: "MCHJ buyurtmachi to'lov qilmadi va shartnoma buzildi",
    expectedOneOf: ["business", "contract"],
    notExpected: "housing",
  },
  {
    name: "Majburiy chiqarish (must be housing)",
    input: "Mening xonadonimdan uydan majburiy chiqarishmoqda va ijara shartnomasi bor",
    expected: "housing",
  },
  {
    name: "Ish beruvchim maosh bermadi (must be labor)",
    input: "Ish beruvchim 2 oydan beri oylik maoshimni bermayapti va ishdan bo'shatishmoqchi",
    expected: "labor",
  },
  {
    name: "Cyrillic labor: Иш берувчим ойлик маош бермаяпти",
    input: "Иш берувчим ойлик маош бермаяпти",
    expected: "labor",
  },
  {
    name: "Cyrillic family: Алимент ундириш бўйича даъво",
    input: "Алимент ундириш бўйича даъво аризаси",
    expected: "family",
  },
  {
    name: "Cyrillic housing: Уй-жой ижара шартномаси",
    input: "Уй-жой ижара шартномаси бузилди",
    expected: "housing",
  },
  {
    name: "Criminal investigation: Dastlabki tergov va qamoqqa olish",
    input: "Dastlabki tergov jarayonida qamoqqa olish ehtiyot chorasi qo'llanildi",
    expected: "criminal",
  },
  {
    name: "Administrative fine: YHX radar jarimasi ustidan shikoyat",
    input: "YHX radar jarimasi bo'yicha ma'muriy bayonnoma ustidan shikoyat",
    expected: "administrative",
  },
  {
    name: "Tax declaration: Soliq inspektsiyasi hisoblagan penya",
    input: "Soliq inspektsiyasi asossiz penya hisobladi, soliq qarzi bor deyapti",
    expected: "tax",
  },
  {
    name: "Property inheritance: Meros ochilganda vasiyatnoma",
    input: "Meros ochilishi va vasiyatnoma bo'yicha merosxo'rlar o'rtasida mulk",
    expected: "property",
  },
  {
    name: "Contract breach: Qarz tilxati bo'yicha majburiyat",
    input: "Qarz tilxati asosida berilgan pulni qaytarmayapti",
    expected: "contract",
  },
  {
    name: "Boundary: Empty string returns fallback",
    input: "",
    expected: "civil",
  },
  {
    name: "Boundary: Massive 5000 char inquiry with labor words",
    input: "Shartnoma tuzilgan edi. " + "A".repeat(4500) + " Lekin ish beruvchim ish haqi to'lamadi.",
    expected: "labor",
  },
  {
    name: "Boundary: Script injection neutralized",
    input: "<script>alert('xss')</script> Ish beruvchi maosh bermadi",
    expected: "labor",
  },
  {
    name: "Unicode apostrophe variety: boʻshatish & o'g'irlik & eʼtiroz",
    input: "Meni ishdan boʻshatish toʻgʻrisida noqonuniy buyruq chiqarildi",
    expected: "labor",
  },
  {
    name: "Civil fallback for unrecognizable query",
    input: "salom dunyo bugun ob-havo yaxshi",
    expected: "civil",
  },
];

for (const tc of testCases) {
  const res = classifyLegalQuery(tc.input);
  let ok = true;
  let extra = "";
  if (tc.expected && res.category !== tc.expected) {
    ok = false;
    extra = `(got ${res.category}, expected ${tc.expected})`;
  }
  if (tc.expectedOneOf && !tc.expectedOneOf.includes(res.category)) {
    ok = false;
    extra = `(got ${res.category}, expected one of ${tc.expectedOneOf.join(",")})`;
  }
  if (tc.notExpected && res.category === tc.notExpected) {
    ok = false;
    extra = `(got ${res.category}, should NOT be ${tc.notExpected})`;
  }
  assertTest(`Classification: ${tc.name}`, ok, extra);
}

// Test triageLegalQuery full output structure
console.log("\n[TEST GROUP 7] Triage Output Structure & Memorandums");
const laborTriage = triageLegalQuery("Ish beruvchim 2 oydan beri oylik bermadi");
assertTest("Labor triage has category labor", laborTriage.category === "labor");
assertTest("Labor triage has sources array", Array.isArray(laborTriage.sources) && laborTriage.sources.length > 0);
assertTest("Labor triage source has Lex.uz URL", laborTriage.sources[0].url.includes("lex.uz"));
assertTest("Labor triage has structured_sections", !!laborTriage.structured_sections);
assertTest("Labor triage has issue_statement", !!laborTriage.structured_sections.issue_statement);
assertTest("Labor triage has substantive_analysis", !!laborTriage.structured_sections.substantive_analysis);
assertTest("Labor triage has action_steps (3 steps)", laborTriage.structured_sections.action_steps.length >= 3);
assertTest("Labor triage recommends specialist", Array.isArray(laborTriage.recommended_specialists) && laborTriage.recommended_specialists.length > 0);

console.log("\n======================================================================");
console.log(`STRESS TEST SUMMARY: Passed: ${passedCount}, Failed: ${failedCount}`);
console.log("======================================================================");

if (failedCount > 0) {
  process.exit(1);
}
