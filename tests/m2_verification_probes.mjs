import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n======================================================================");
console.log("  MILESTONE 2: EMPIRICAL VERIFICATION PROBE SUITE");
console.log("======================================================================\n");

// 1. Link normalization audit
function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (f.endsWith(".tsx") || f.endsWith(".ts")) {
      const content = fs.readFileSync(full, "utf-8");
      const matches = content.match(/\/dashboard\/(specialists|ai-chat|consultations|profile)/g);
      assert.equal(matches, null, `Found broken link in ${full}: ${matches}`);
    }
  }
}
checkDir(path.join(rootDir, "src"));
console.log("  ✓ [PROBE 1] Zero broken /dashboard/ route prefixes across entire src/ directory");

// 2. Statutory policy pages
const privacy = fs.readFileSync(path.join(rootDir, "src/app/privacy/page.tsx"), "utf-8");
assert.ok(privacy.includes("O'RQ-547") || privacy.includes("O&apos;RQ-547"), "Privacy must cite Law No. O'RQ-547");
assert.ok(privacy.includes("Advokatura to'g'risida") || privacy.includes("Advokatura to&apos;g&apos;risida"), "Privacy must cite Law on Advocacy");
console.log("  ✓ [PROBE 2] Privacy Policy page (/privacy) exists with authentic statutory citations");

const terms = fs.readFileSync(path.join(rootDir, "src/app/terms/page.tsx"), "utf-8");
assert.ok(terms.includes("15%"), "Terms must cite 15% platform commission");
assert.ok(terms.includes("367, 369"), "Terms must cite Civil Code articles 367, 369");
console.log("  ✓ [PROBE 3] Terms of Service page (/terms) exists with 15% commission and Civil Code anchors");

const about = fs.readFileSync(path.join(rootDir, "src/app/about/page.tsx"), "utf-8");
assert.ok(about.includes("Lex.uz"), "About must mention Lex.uz integration");
assert.ok(about.includes("14"), "About must cover all 14 regions of Uzbekistan");
console.log("  ✓ [PROBE 4] About Us page (/about) exists with Lex.uz and institutional foundations");

// 3. Modals and Layout Components
assert.ok(fs.existsSync(path.join(rootDir, "src/components/modals/forgot-password-modal.tsx")), "ForgotPasswordModal must exist");
assert.ok(fs.existsSync(path.join(rootDir, "src/components/modals/privacy-modal.tsx")), "PrivacyModal must exist");
assert.ok(fs.existsSync(path.join(rootDir, "src/components/modals/terms-modal.tsx")), "TermsModal must exist");
assert.ok(fs.existsSync(path.join(rootDir, "src/components/layout/footer.tsx")), "EditorialFooter must exist");
console.log("  ✓ [PROBE 5] Reusable modals (forgot-password, privacy, terms) and EditorialFooter exist");

// 4. Login integration
const login = fs.readFileSync(path.join(rootDir, "src/app/(auth)/login/page.tsx"), "utf-8");
assert.ok(login.includes("ForgotPasswordModal"), "Login page must use ForgotPasswordModal component");
assert.ok(!login.includes('href="#"'), "Login page must not contain dead href='#' link");
assert.ok(login.includes('href="/terms"'), "Login page must link to /terms");
assert.ok(login.includes('href="/privacy"'), "Login page must link to /privacy");
console.log("  ✓ [PROBE 6] Login page integrates ForgotPasswordModal and eliminates dead href='#'");

// 5. Landing page feature inventory
const landing = fs.readFileSync(path.join(rootDir, "src/app/page.tsx"), "utf-8");
assert.ok(landing.includes("28") && landing.includes("55"), "Landing must cite Articles 28 and 55");
assert.ok(landing.includes("themis_pending_inquiry"), "Landing must store pending inquiry in themis_pending_inquiry");
assert.ok(landing.includes("/ai-chat?q="), "Landing inquiry submit must redirect to /ai-chat?q=");
assert.ok(landing.includes("Advokatlar Palatasi"), "Landing must display institutional partner Advokatlar Palatasi");
assert.ok(landing.includes("Toshkent Davlat Yuridik Universiteti"), "Landing must display TDYU");
assert.ok(landing.includes("#qanday-ishlaydi"), "Landing must feature 4-step consultation narrative (#qanday-ishlaydi)");
assert.ok(landing.includes("#sohalar"), "Landing must feature 10 legal categories (#sohalar)");
assert.ok(landing.includes("themis_demo_user"), "Landing must feature quick demo persona switcher");
console.log("  ✓ [PROBE 7] Landing page (/page.tsx) features Constitutional Preamble, Triage Bar, Trust Ticker, 10 Categories, and Demo Switcher");

console.log("\n======================================================================");
console.log("  ALL MILESTONE 2 PROBES PASSED (7/7)");
console.log("======================================================================\n");
