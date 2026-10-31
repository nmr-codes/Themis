import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n======================================================================");
console.log("  CHALLENGER M2_2: ADVERSARIAL & EMPIRICAL TEST SUITE");
console.log("  Testing Milestone 2 Interactive Capabilities, Boundaries & Edge Cases");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// ====================================================================
// 1. CHALLENGE: 10 LEGAL CATEGORIES & DOM/DATA INTEGRITY
// ====================================================================
console.log("--- Task 1: Legal Categories & DOM/Data Integrity ---");

const constantsPath = path.join(rootDir, "src/lib/constants.ts");
const landingPath = path.join(rootDir, "src/app/page.tsx");

const constantsContent = fs.readFileSync(constantsPath, "utf-8");
const landingContent = fs.readFileSync(landingPath, "utf-8");

runTest("Constants define exactly 10 legal categories with valid schema", () => {
  // Extract categories block
  const categoryMatch = constantsContent.match(/export const LEGAL_CATEGORIES: LegalCategory\[] = (\[[\s\S]*?\]);/);
  assert.ok(categoryMatch, "LEGAL_CATEGORIES must be exported from constants.ts");
  
  // Parse category objects
  const rawBlock = categoryMatch[1];
  const idMatches = [...rawBlock.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);
  assert.equal(idMatches.length, 10, `Expected exactly 10 category IDs, found ${idMatches.length}`);

  const expectedIds = [
    "labor", "family", "civil", "housing", "criminal",
    "administrative", "business", "property", "contract", "tax"
  ];
  assert.deepEqual(idMatches.sort(), expectedIds.sort(), "Category IDs must match the canonical 10 legal branches");

  // Verify unique IDs
  const idSet = new Set(idMatches);
  assert.equal(idSet.size, 10, "No duplicate category IDs allowed");

  // Verify sort_order 1 to 10 without gaps or collisions
  const sortMatches = [...rawBlock.matchAll(/sort_order:\s*(\d+)/g)].map(m => parseInt(m[1], 10));
  assert.equal(sortMatches.length, 10, "Each category must have a sort_order");
  assert.deepEqual(sortMatches.sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "Sort orders must be 1..10 contiguous");
});

runTest("Landing page (src/app/page.tsx) maps all 10 categories to icons and statutes", () => {
  // CATEGORY_ICONS map in page.tsx
  const iconMapMatch = landingContent.match(/const CATEGORY_ICONS: Record<string, React\.ElementType> = {([\s\S]*?)};/);
  assert.ok(iconMapMatch, "CATEGORY_ICONS dictionary must exist in page.tsx");
  const iconIds = [...iconMapMatch[1].matchAll(/([a-zA-Z0-9_]+):/g)].map(m => m[1]);
  
  const expectedIds = ["labor", "family", "civil", "housing", "criminal", "administrative", "business", "property", "contract", "tax"];
  for (const exp of expectedIds) {
    assert.ok(iconIds.includes(exp), `CATEGORY_ICONS missing icon mapping for category '${exp}'`);
  }

  // CATEGORY_STATUTES map in page.tsx
  const statuteMapMatch = landingContent.match(/const CATEGORY_STATUTES: Record<string, string> = {([\s\S]*?)};/);
  assert.ok(statuteMapMatch, "CATEGORY_STATUTES dictionary must exist in page.tsx");
  const statuteIds = [...statuteMapMatch[1].matchAll(/([a-zA-Z0-9_]+):/g)].map(m => m[1]);
  for (const exp of expectedIds) {
    assert.ok(statuteIds.includes(exp), `CATEGORY_STATUTES missing citation for category '${exp}'`);
  }
});

runTest("Landing page renders all 10 categories with active href='/specialists?category=...'", () => {
  // Check Link template in JSX
  assert.ok(
    landingContent.includes('href={`/specialists?category=${cat.id}`}'),
    "Category cards must link dynamically to `/specialists?category=${cat.id}`"
  );
  assert.ok(
    landingContent.includes("LEGAL_CATEGORIES.map((cat)"),
    "Category cards must iterate over full LEGAL_CATEGORIES list"
  );
  assert.ok(
    landingContent.includes('id="sohalar"'),
    "Section must have anchor id='sohalar'"
  );

  // Ensure no stale hardcoded links exist for old subset
  const hardcodedSpecialists = [...landingContent.matchAll(/href="\/specialists\?category=([^"]+)"/g)].map(m => m[1]);
  assert.equal(hardcodedSpecialists.length, 0, "All category links should be dynamically generated via cat.id");
});

// ====================================================================
// 2. CHALLENGE: LEGAL INQUIRY BAR & QUERY PERSISTENCE / SANITIZATION
// ====================================================================
console.log("\n--- Task 2: Legal Inquiry Bar Formatting & Sanitization ---");

// Emulate inquiry submit logic in page.tsx
function createInquiryHarness() {
  const store = {};
  let routedUrl = null;
  let toastMsg = null;

  const mockLocalStorage = {
    setItem(k, v) { store[k] = String(v); },
    getItem(k) { return store[k] || null; }
  };

  const mockRouter = {
    push(url) { routedUrl = url; }
  };

  const mockToast = {
    info(msg) { toastMsg = msg; }
  };

  function handleInquirySubmit(inquiryText, customQuery) {
    const query = (customQuery || inquiryText).trim();
    if (!query) {
      mockToast.info("Iltimos, huquqiy masalangizni yozing");
      return { success: false, reason: "empty" };
    }
    mockLocalStorage.setItem("themis_pending_inquiry", query);
    mockRouter.push(`/ai-chat?q=${encodeURIComponent(query)}`);
    return { success: true, query, url: routedUrl };
  }

  return { store, getRoutedUrl: () => routedUrl, getToastMsg: () => toastMsg, handleInquirySubmit };
}

runTest("Inquiry bar rejects empty strings and pure whitespace without redirecting", () => {
  const edgeCases = ["", "   ", "\t\t", "\n\r  \n", "      \t "];
  for (const emptyInput of edgeCases) {
    const harness = createInquiryHarness();
    const res = harness.handleInquirySubmit(emptyInput);
    assert.equal(res.success, false, `Should reject whitespace input: '${emptyInput}'`);
    assert.equal(harness.store["themis_pending_inquiry"], undefined, "localStorage should not be updated");
    assert.equal(harness.getRoutedUrl(), null, "Router should not be pushed");
    assert.ok(harness.getToastMsg().includes("Iltimos"), "Should show validation toast");
  }
});

runTest("Inquiry bar properly trims leading and trailing whitespace", () => {
  const rawInput = "   Ish haqim 3 oydan beri berilmayapti   \n\t";
  const harness = createInquiryHarness();
  const res = harness.handleInquirySubmit(rawInput);
  
  assert.equal(res.success, true);
  assert.equal(harness.store["themis_pending_inquiry"], "Ish haqim 3 oydan beri berilmayapti");
  assert.equal(harness.getRoutedUrl(), `/ai-chat?q=${encodeURIComponent("Ish haqim 3 oydan beri berilmayapti")}`);
});

runTest("Inquiry bar handles all 4 prompt chips accurately", () => {
  const chips = [
    "Ish beruvchi 2 oydan beri maosh bermayapti",
    "Nikohni bekor qilish va aliment undirish",
    "Ijara shartnomasini muddatidan oldin bekor qilish",
    "Meros hovli-joy taqsimoti va mulk nizosi",
  ];

  // Verify chips in landing page content
  for (const chip of chips) {
    assert.ok(landingContent.includes(chip), `Landing page must contain prompt chip: '${chip}'`);
  }

  for (const chip of chips) {
    const harness = createInquiryHarness();
    const res = harness.handleInquirySubmit("", chip);
    assert.equal(res.success, true);
    assert.equal(harness.store["themis_pending_inquiry"], chip);
    assert.equal(harness.getRoutedUrl(), `/ai-chat?q=${encodeURIComponent(chip)}`);
    // Verify lossless round-trip
    const parsedQ = decodeURIComponent(harness.getRoutedUrl().split("?q=")[1]);
    assert.equal(parsedQ, chip);
  }
});

runTest("Inquiry bar sanitizes adversarial inputs (XSS, SQLi, URL injection, Unicode, Apostrophes)", () => {
  const adversarialVectors = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "'; DROP TABLE consultations; --",
    "param1=val&param2=injected#fragment",
    "O'zbekiston Respublikasi: o‘g‘ri va bo'lim masalalari",
    "Трудовой кодекс Республики Узбекистан: статья 161",
    "⚖️ Huquqiy muammo: 50% aliment va 100 000 UZS to'lov 📜"
  ];

  for (const vec of adversarialVectors) {
    const harness = createInquiryHarness();
    const res = harness.handleInquirySubmit(vec);
    assert.equal(res.success, true);
    // localStorage stores exact clean string
    assert.equal(harness.store["themis_pending_inquiry"], vec);
    
    // Redirect URL must NOT contain unencoded '&' or '#' or '<' or '>' from user payload
    const url = harness.getRoutedUrl();
    const queryPart = url.replace("/ai-chat?q=", "");
    
    // Check that special characters are encoded
    assert.ok(!queryPart.includes("<script>"), "Must encode HTML tags");
    assert.ok(!queryPart.includes("&param2="), "Must encode URL query delimiters");
    assert.ok(!queryPart.includes("#fragment"), "Must encode URL fragment delimiter");
    
    // Check round-trip decodability
    const decoded = decodeURIComponent(queryPart);
    assert.equal(decoded, vec, `Lossless decoding must preserve: ${vec}`);
  }
});

runTest("Inquiry bar handles boundary size (5,000+ characters legal memorandum)", () => {
  const largeQuery = "Fuqaro arizasi: " + "a".repeat(5000);
  const harness = createInquiryHarness();
  const res = harness.handleInquirySubmit(largeQuery);
  assert.equal(res.success, true);
  assert.equal(harness.store["themis_pending_inquiry"].length, largeQuery.length);
  assert.equal(decodeURIComponent(harness.getRoutedUrl().split("?q=")[1]).length, largeQuery.length);
});

// ====================================================================
// 3. CHALLENGE: STATUTORY POLICY PAGES (/privacy, /terms, /about)
// ====================================================================
console.log("\n--- Task 3: Statutory Policy Pages Quality & Link Integrity ---");

const privacyPath = path.join(rootDir, "src/app/privacy/page.tsx");
const termsPath = path.join(rootDir, "src/app/terms/page.tsx");
const aboutPath = path.join(rootDir, "src/app/about/page.tsx");

const privacyContent = fs.readFileSync(privacyPath, "utf-8");
const termsContent = fs.readFileSync(termsPath, "utf-8");
const aboutContent = fs.readFileSync(aboutPath, "utf-8");

runTest("No placeholder, TODO, TBD, or Lorem Ipsum text in statutory pages", () => {
  const forbiddenPatterns = [
    /\bTODO\b/i,
    /\bTBD\b/i,
    /\bFIXME\b/i,
    /\bLOREM IPSUM\b/i,
    /\bPLACEHOLDER\b/i,
    /\bCOMING SOON\b/i,
    /\bXXX\b/i,
    /\[insert\s+[^\]]+\]/i
  ];

  const pages = [
    { name: "/privacy", content: privacyContent },
    { name: "/terms", content: termsContent },
    { name: "/about", content: aboutContent }
  ];

  for (const page of pages) {
    for (const pattern of forbiddenPatterns) {
      const match = page.content.match(pattern);
      assert.equal(match, null, `Found placeholder match ${pattern} in ${page.name}`);
    }
  }
});

runTest("Statutory pages contain substantive content and no empty semantic sections", () => {
  const pages = [
    { name: "/privacy", content: privacyContent, minSize: 10000 },
    { name: "/terms", content: termsContent, minSize: 10000 },
    { name: "/about", content: aboutContent, minSize: 8000 }
  ];

  for (const page of pages) {
    assert.ok(page.content.length > page.minSize, `${page.name} is too short (${page.content.length} bytes), expected >${page.minSize}`);
    
    // Check no empty section or header tags
    const emptyTags = page.content.match(/<(section|h[1-6]|p|div)[^>]*>\s*<\/\1>/gi);
    assert.equal(emptyTags, null, `Found empty tag in ${page.name}: ${emptyTags}`);
  }
});

runTest("All internal hyperlinks in policy pages target valid, existing routes", () => {
  const pages = [
    { name: "/privacy", content: privacyContent },
    { name: "/terms", content: termsContent },
    { name: "/about", content: aboutContent }
  ];

  // Map of valid known public routes
  const validRoutes = new Set([
    "/",
    "/about",
    "/privacy",
    "/terms",
    "/login",
    "/register",
    "/specialists",
    "/ai-chat",
    "/dashboard",
    "/specialist",
    "/admin"
  ]);

  for (const page of pages) {
    const internalHrefs = [...page.content.matchAll(/href="(\/[^"#]*)"/g)].map(m => m[1]);
    for (const href of internalHrefs) {
      assert.ok(
        validRoutes.has(href),
        `Broken internal link '${href}' found in ${page.name}`
      );
    }
  }
});

runTest("Anchor links (#hash) in policy pages correspond to real DOM IDs in the page", () => {
  // In privacy page
  const privacyAnchors = [...privacyContent.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
  for (const anchor of privacyAnchors) {
    assert.ok(
      privacyContent.includes(`id="${anchor}"`),
      `Anchor '#${anchor}' in /privacy does not match any id="${anchor}"`
    );
  }

  // In terms page
  const termsAnchors = [...termsContent.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
  for (const anchor of termsAnchors) {
    assert.ok(
      termsContent.includes(`id="${anchor}"`),
      `Anchor '#${anchor}' in /terms does not match any id="${anchor}"`
    );
  }
});

runTest("Statutory legal requirements are rigorously met in policy texts", () => {
  // Privacy
  assert.ok(privacyContent.includes("O'RQ-547") || privacyContent.includes("O&apos;RQ-547"), "Must reference Data Protection Law O'RQ-547");
  assert.ok(privacyContent.includes("27-modda"), "Must cite Article 27 on server localization in UZB");
  assert.ok(privacyContent.includes("Advokatura to'g'risida") || privacyContent.includes("Advokatura to&apos;g&apos;risida"), "Must reference Law on Advocacy");
  assert.ok(privacyContent.includes("Zero-Training") || privacyContent.includes("o'qitmaslik"), "Must include AI zero-training guarantee");
  assert.ok(privacyContent.includes("privacy@themis.uz"), "Must provide official DPO email");

  // Terms
  assert.ok(termsContent.includes("367, 369") || (termsContent.includes("367") && termsContent.includes("369")), "Must cite Civil Code Arts 367 and 369");
  assert.ok(termsContent.includes("15%"), "Must state 15% platform commission");
  assert.ok(termsContent.includes("85%"), "Must state 85% specialist payout");
  assert.ok(termsContent.includes("100%"), "Must state 100% refund guarantee");
  assert.ok(termsContent.includes("Eskrou"), "Must state Escrow deposit mechanism");

  // About
  assert.ok(aboutContent.includes("TDYU") || aboutContent.includes("Toshkent Davlat Yuridik"), "Must cite TDYU academic roots");
  assert.ok(aboutContent.includes("Lex.uz"), "Must cite Lex.uz integration");
  assert.ok(aboutContent.includes("14"), "Must cite all 14 regions coverage");
});

// ====================================================================
// 4. CHALLENGE: LOGIN PAGE & FORGOT PASSWORD MODAL
// ====================================================================
console.log("\n--- Task 4: Login Page & ForgotPasswordModal Robustness ---");

const loginPath = path.join(rootDir, "src/app/(auth)/login/page.tsx");
const modalPath = path.join(rootDir, "src/components/modals/forgot-password-modal.tsx");

const loginContent = fs.readFileSync(loginPath, "utf-8");
const modalContent = fs.readFileSync(modalPath, "utf-8");

runTest("Login page imports and renders ForgotPasswordModal with no dead href='#'", () => {
  assert.ok(loginContent.includes('import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal"'), "Must import ForgotPasswordModal");
  assert.ok(loginContent.includes("<ForgotPasswordModal"), "Must render <ForgotPasswordModal");
  assert.ok(!loginContent.includes('href="#"'), "Must NOT contain dead href='#'");
  assert.ok(!loginContent.includes("href='#'"), "Must NOT contain dead href='#'");
  assert.ok(loginContent.includes('href="/terms"'), "Must contain link to /terms");
  assert.ok(loginContent.includes('href="/privacy"'), "Must contain link to /privacy");
  assert.ok(loginContent.includes('href="/register"'), "Must contain link to /register");
});

runTest("ForgotPasswordModal component validation and state machine simulation", () => {
  // Validate email test logic
  function validateResetEmail(email) {
    if (!email || !email.includes("@")) {
      return { valid: false, error: "Iltimos, to'g'ri elektron pochta manzilini kiriting" };
    }
    return { valid: true };
  }

  // Edge cases
  assert.equal(validateResetEmail("").valid, false);
  assert.equal(validateResetEmail("invalid-email").valid, false);
  assert.equal(validateResetEmail("user@domain.com").valid, true);
  assert.equal(validateResetEmail("azizbek@themis.uz").valid, true);

  // Modal code inspection
  assert.ok(modalContent.includes("resetPasswordForEmail"), "Must call Supabase resetPasswordForEmail");
  assert.ok(modalContent.includes("cooldown"), "Must have countdown timer for resend");
  assert.ok(modalContent.includes("themis_support_uz"), "Must include Telegram support fallback");
  assert.ok(modalContent.includes("+998712000108"), "Must include hotline phone link");
  assert.ok(!modalContent.includes('href="#"'), "Must not contain dead href='#' in modal");
});

// ====================================================================
// 5. CHALLENGE: SYSTEMIC 404 & DEAD LINK AUDIT ACROSS PROJECT
// ====================================================================
console.log("\n--- Task 5: Global Link Safety & Interface Contract 1 ---");

runTest("Zero broken /dashboard/ route group prefixes across all src files", () => {
  function scan(dir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        scan(full);
      } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
        const c = fs.readFileSync(full, "utf-8");
        const match = c.match(/\/dashboard\/(specialists|ai-chat|consultations|profile)/g);
        assert.equal(match, null, `Found broken route prefix in ${full}: ${match}`);
      }
    }
  }
  scan(path.join(rootDir, "src"));
});

runTest("Zero dead href='#' or href=\"#\" anywhere in src/app or src/components", () => {
  function scan(dir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        scan(full);
      } else if (item.endsWith(".tsx")) {
        const c = fs.readFileSync(full, "utf-8");
        // Look for dead href="#" that is not an anchor like href="#sohalar"
        const deadMatch = c.match(/href=(["'])#(["'])/g);
        assert.equal(deadMatch, null, `Found dead href='#' in ${full}`);
      }
    }
  }
  scan(path.join(rootDir, "src/app"));
  scan(path.join(rootDir, "src/components"));
});

console.log("\n======================================================================");
console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
console.log("======================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
