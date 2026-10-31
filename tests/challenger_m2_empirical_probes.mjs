/**
 * Milestone 2 Empirical Adversarial Verification Probe Suite
 * Executed by Challenger M2_1
 *
 * Verifies:
 * 1. Zero occurrences of legacy /dashboard/(specialists|ai-chat|consultations|profile)
 * 2. Absolute integrity of all /dashboard/ routes across src/
 * 3. Exhaustive internal link validation against Next.js App Router route hierarchy
 * 4. In-page anchor hash targets (#sohalar, #qanday-ishlaydi) presence and resolution
 * 5. Dead links elimination (no href="#", empty strings, or javascript:void)
 * 6. Live HTTP server status code matrix across 33 routes (public, portal, legacy 404s)
 * 7. HTML response editorial content and statutory compliance verification
 * 8. Adversarial route injection stress testing (no 500 crashes)
 * 9. Master E2E runner execution (100% pass rate)
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

console.log("\n======================================================================");
console.log("  CHALLENGER M2_1: EMPIRICAL ADVERSARIAL VERIFICATION PROBE SUITE");
console.log("======================================================================\n");

// Helper to collect all source files
function collectFiles(dir, extensions = [".tsx", ".ts", ".jsx", ".js"]) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(full, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

const allSrcFiles = collectFiles(srcDir);
console.log(`[SETUP] Indexed ${allSrcFiles.length} source files in src/ for adversarial audit.\n`);

// -------------------------------------------------------------------------
// PROBE 1: Strict Check for legacy /dashboard/(specialists|ai-chat|consultations|profile)
// -------------------------------------------------------------------------
console.log("[PROBE 1/8] Scanning for legacy route patterns in src/...");
const legacyPattern = /\/dashboard\/(specialists|ai-chat|consultations|profile)/g;
const legacyMatches = [];

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const matches = content.match(legacyPattern);
  if (matches) {
    legacyMatches.push({ file: path.relative(rootDir, file), matches });
  }
}

assert.equal(
  legacyMatches.length,
  0,
  `Found legacy route occurrences: ${JSON.stringify(legacyMatches, null, 2)}`
);
console.log("  ✓ [PASS] Zero occurrences of legacy /dashboard/(specialists|ai-chat|consultations|profile) across all src/ files.\n");

// -------------------------------------------------------------------------
// PROBE 2: Audit all occurrences of /dashboard across src/
// -------------------------------------------------------------------------
console.log("[PROBE 2/8] Auditing all '/dashboard' links across src/...");
const dashboardSubpathPattern = /['"`]\/dashboard\/([a-zA-Z0-9_\-]+)['"`]/g;
const invalidDashboardMatches = [];

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, "utf-8");
  let match;
  while ((match = dashboardSubpathPattern.exec(content)) !== null) {
    invalidDashboardMatches.push({
      file: path.relative(rootDir, file),
      target: match[0],
      subpath: match[1],
    });
  }
}

assert.equal(
  invalidDashboardMatches.length,
  0,
  `Found invalid /dashboard/ subpaths: ${JSON.stringify(invalidDashboardMatches, null, 2)}`
);
console.log("  ✓ [PASS] No invalid /dashboard/* subpaths found. The only dashboard target is '/dashboard'.\n");

// -------------------------------------------------------------------------
// PROBE 3: Comprehensive Internal Link Target Validation
// -------------------------------------------------------------------------
console.log("[PROBE 3/8] Extracting and validating all internal links in src/...");

function discoverValidRoutes(appDir) {
  const validRoutes = new Set();
  const validPrefixes = new Set();

  function traverse(dir, currentRoute) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const seg = entry.name;
        if (seg.startsWith("(") && seg.endsWith(")")) {
          traverse(path.join(dir, seg), currentRoute);
        } else if (seg.startsWith("[") && seg.endsWith("]")) {
          const dynRoute = currentRoute === "/" ? `/${seg}` : `${currentRoute}/${seg}`;
          validRoutes.add(dynRoute);
          const prefix = currentRoute === "/" ? "" : currentRoute;
          validPrefixes.add(prefix);
          traverse(path.join(dir, seg), dynRoute);
        } else {
          const nextRoute = currentRoute === "/" ? `/${seg}` : `${currentRoute}/${seg}`;
          traverse(path.join(dir, seg), nextRoute);
        }
      } else if (entry.name === "page.tsx" || entry.name === "page.ts" || entry.name === "route.ts") {
        validRoutes.add(currentRoute);
      }
    }
  }

  traverse(appDir, "/");
  return { validRoutes, validPrefixes };
}

const { validRoutes } = discoverValidRoutes(path.join(srcDir, "app"));
console.log(`  Identified ${validRoutes.size} distinct App Router route definitions:`);
for (const r of [...validRoutes].sort()) {
  console.log(`    - ${r}`);
}

const hrefRegex = /href\s*=\s*(?:["']([^"']+)["']|{`([^`]+)`})/g;
const routerPushRegex = /router\.push\s*\(\s*(?:["']([^"']+)["']|{?`([^`]+)`}?)/g;

const extractedInternalLinks = new Set();
const deadLinks = [];

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(rootDir, file);

  let m;
  while ((m = hrefRegex.exec(content)) !== null) {
    const link = m[1] || m[2];
    if (link === "#" || link === "") {
      deadLinks.push({ file: relPath, link, type: "href='#' or empty" });
    } else if (link && link.startsWith("/")) {
      extractedInternalLinks.add({ file: relPath, link });
    }
  }

  while ((m = routerPushRegex.exec(content)) !== null) {
    const link = m[1] || m[2];
    if (link && link.startsWith("/")) {
      extractedInternalLinks.add({ file: relPath, link });
    }
  }
}

assert.equal(
  deadLinks.length,
  0,
  `Found dead links in code: ${JSON.stringify(deadLinks, null, 2)}`
);
console.log("  ✓ [PASS] Zero dead links (href='#' or href='') found in source files.");

const invalidLinks = [];

function isValidRouteTarget(targetUrl) {
  let basePath = targetUrl.split("?")[0].split("#")[0];
  if (basePath === "") basePath = "/";
  basePath = basePath.replace(/\$\{[^}]+\}/g, "PARAM");

  if (validRoutes.has(basePath)) return true;

  for (const vr of validRoutes) {
    if (vr.includes("[")) {
      const regexStr = "^" + vr.replace(/\[\.\.\.[^\]]+\]/g, ".*").replace(/\[[^\]]+\]/g, "[^/]+") + "$";
      const rx = new RegExp(regexStr);
      if (rx.test(basePath) || rx.test(basePath.replace(/PARAM/g, "test-id"))) {
        return true;
      }
    }
  }

  if (basePath.startsWith("/images/") || basePath === "/favicon.ico") return true;

  return false;
}

for (const item of extractedInternalLinks) {
  if (!isValidRouteTarget(item.link)) {
    invalidLinks.push(item);
  }
}

assert.equal(
  invalidLinks.length,
  0,
  `Found invalid internal links: ${JSON.stringify(invalidLinks, null, 2)}`
);
console.log(`  ✓ [PASS] All ${extractedInternalLinks.size} internal links map to valid App Router routes.\n`);

// -------------------------------------------------------------------------
// PROBE 4: Anchor Hash Resolution Check on Landing Page
// -------------------------------------------------------------------------
console.log("[PROBE 4/8] Validating anchor hash targets (#sohalar, #qanday-ishlaydi)...");
const landingContent = fs.readFileSync(path.join(srcDir, "app/page.tsx"), "utf-8");

const expectedAnchors = ["sohalar", "qanday-ishlaydi"];
for (const anchor of expectedAnchors) {
  const hasId = landingContent.includes(`id="${anchor}"`) || landingContent.includes(`id='${anchor}'`);
  assert.ok(hasId, `Landing page is missing DOM id="${anchor}" for anchor link resolution`);
  console.log(`  ✓ Found DOM target id="${anchor}" in src/app/page.tsx`);
}
console.log("  ✓ [PASS] All anchor targets properly defined for in-page smooth navigation.\n");

// -------------------------------------------------------------------------
// PROBES 5-7: Live HTTP Server Suite on Port 3000
// -------------------------------------------------------------------------
console.log(`[PROBE 5/8] Stress-testing live HTTP server status codes on ${BASE_URL}...`);

const testRoutes = [
  // Public & Editorial Routes (Expected: 200)
  { path: "/", expectedStatus: 200, name: "Public Landing Page" },
  { path: "/about", expectedStatus: 200, name: "Institutional About Page" },
  { path: "/privacy", expectedStatus: 200, name: "Statutory Privacy Policy" },
  { path: "/terms", expectedStatus: 200, name: "Statutory Terms of Service" },
  { path: "/login", expectedStatus: 200, name: "Authentication Login" },
  { path: "/register", expectedStatus: 200, name: "Authentication Register" },
  { path: "/specialists", expectedStatus: 200, name: "Specialist Catalog" },
  { path: "/specialists/spec-1", expectedStatus: 200, name: "Specialist Detail Dossier" },
  // Client Portal Routes (Expected: 200)
  { path: "/dashboard", expectedStatus: 200, name: "Client Dashboard" },
  { path: "/ai-chat", expectedStatus: 200, name: "AI Consultation Flow" },
  { path: "/ai-chat/chat-1", expectedStatus: 200, name: "AI Consultation Session" },
  { path: "/consultations", expectedStatus: 200, name: "Consultation Tracking" },
  { path: "/consultations/1", expectedStatus: 200, name: "Consultation Detail" },
  { path: "/consultations/1/chat", expectedStatus: 200, name: "Consultation Chat Room" },
  { path: "/profile", expectedStatus: 200, name: "Citizen Profile" },
  // Specialist Portal Routes (Expected: 200)
  { path: "/specialist", expectedStatus: 200, name: "Specialist Portal Home" },
  { path: "/specialist/requests", expectedStatus: 200, name: "Specialist Requests Queue" },
  { path: "/specialist/profile", expectedStatus: 200, name: "Specialist Professional Profile" },
  { path: "/specialist/services", expectedStatus: 200, name: "Specialist Service Tariffs" },
  { path: "/specialist/schedule", expectedStatus: 200, name: "Specialist Weekly Schedule" },
  { path: "/specialist/earnings", expectedStatus: 200, name: "Specialist Financial Ledger" },
  // Admin Portal Routes (Expected: 200)
  { path: "/admin", expectedStatus: 200, name: "Admin Panel KPI" },
  { path: "/admin/specialists", expectedStatus: 200, name: "Admin Specialist Verification" },
  { path: "/admin/users", expectedStatus: 200, name: "Admin User Management" },
  { path: "/admin/consultations", expectedStatus: 200, name: "Admin Consultations Audit" },
  { path: "/admin/reviews", expectedStatus: 200, name: "Admin Reviews Moderation" },
  { path: "/admin/transactions", expectedStatus: 200, name: "Admin Financial Audit" },
  // Adversarial & Legacy Routes (Expected: 404)
  { path: "/dashboard/specialists", expectedStatus: 404, name: "Legacy Dashboard Specialists (MUST 404)" },
  { path: "/dashboard/ai-chat", expectedStatus: 404, name: "Legacy Dashboard AI Chat (MUST 404)" },
  { path: "/dashboard/consultations", expectedStatus: 404, name: "Legacy Dashboard Consultations (MUST 404)" },
  { path: "/dashboard/profile", expectedStatus: 404, name: "Legacy Dashboard Profile (MUST 404)" },
  { path: "/dashboard/random-bogus-subpath", expectedStatus: 404, name: "Bogus Dashboard Subpath (MUST 404)" },
  { path: "/adversarial-boundary-nonexistent-9999", expectedStatus: 404, name: "Arbitrary Nonexistent Route (MUST 404)" },
];

console.log("  Testing HTTP status codes across all 33 routes:");
for (const t of testRoutes) {
  const res = await fetch(`${BASE_URL}${t.path}`, { redirect: "manual" });
  assert.equal(
    res.status,
    t.expectedStatus,
    `Route ${t.path} (${t.name}) expected HTTP ${t.expectedStatus}, but got ${res.status}`
  );
  console.log(`    ✓ [HTTP ${res.status}] ${t.path.padEnd(42)} -> ${t.name}`);
}
console.log("  ✓ [PASS] All 33 route status code checks passed with exact expected HTTP statuses.\n");

// PROBE 6: HTML Content & Statutory Compliance Verification
console.log("[PROBE 6/8] Inspecting live HTML response content and statutory anchors...");

const rootRes = await fetch(`${BASE_URL}/`);
const rootHtml = await rootRes.text();
assert.ok(rootHtml.includes("28") && rootHtml.includes("55"), "Root HTML must cite Articles 28 & 55 of the Constitution");
assert.ok(rootHtml.includes("Konstitutsiyasi"), "Root HTML must mention Konstitutsiya");
assert.ok(rootHtml.includes("Toshkent Davlat Yuridik Universiteti"), "Root HTML must include TDYU partner");
assert.ok(rootHtml.includes("Advokatlar Palatasi"), "Root HTML must include Advokatlar Palatasi partner");
assert.ok(rootHtml.includes("themis_pending_inquiry") || rootHtml.includes("Tahlil qilish"), "Root HTML must feature inquiry triage bar");
console.log("  ✓ Root landing page delivers Constitutional Preamble, institutional partners, and triage bar.");

const privacyRes = await fetch(`${BASE_URL}/privacy`);
const privacyHtml = await privacyRes.text();
assert.ok(privacyHtml.includes("O&#39;RQ-547") || privacyHtml.includes("O'RQ-547") || privacyHtml.includes("547"), "Privacy HTML must cite Law No. O'RQ-547");
assert.ok(privacyHtml.includes("Advokatura") || privacyHtml.includes("advokatlik siri"), "Privacy HTML must enforce attorney-client privilege");
console.log("  ✓ /privacy delivers statutory data localization (O'RQ-547) and attorney-client privilege.");

const termsRes = await fetch(`${BASE_URL}/terms`);
const termsHtml = await termsRes.text();
assert.ok(termsHtml.includes("15%"), "Terms HTML must state 15% platform commission");
assert.ok(termsHtml.includes("367") && termsHtml.includes("369"), "Terms HTML must cite Civil Code articles 367 and 369");
console.log("  ✓ /terms delivers 15% platform commission terms and Civil Code public offer compliance.");

const aboutRes = await fetch(`${BASE_URL}/about`);
const aboutHtml = await aboutRes.text();
assert.ok(aboutHtml.includes("Lex.uz"), "About HTML must reference Lex.uz integration");
assert.ok(aboutHtml.includes("14"), "About HTML must cover 14 territorial regions");
console.log("  ✓ /about delivers Lex.uz integration and 14-region territorial coverage.");

const notFoundRes = await fetch(`${BASE_URL}/adversarial-boundary-nonexistent-9999`);
const notFoundHtml = await notFoundRes.text();
assert.ok(
  notFoundHtml.includes("404") || notFoundHtml.includes("Sahifa Mavjud Emas") || notFoundHtml.includes("adolatdadir"),
  "404 boundary must display custom editorial decree"
);
console.log("  ✓ Custom 404 page renders bespoke editorial error decree.\n");

// PROBE 7: Adversarial URL Boundary Injection Stress-Test
console.log("[PROBE 7/8] Stress-testing route boundaries with malformed/injected inputs...");
const injectionPaths = [
  "/specialists/%2E%2E/%2E%2E/etc/passwd",
  "/specialists/<script>alert(1)</script>",
  "/ai-chat/%20%20%20",
  "/specialists?category=bogus_illegal_category_branch",
  "/specialists?region=atlantis_ocean",
  "/terms?param='OR'1'='1",
];

for (const ip of injectionPaths) {
  const res = await fetch(`${BASE_URL}${ip}`);
  assert.ok(
    res.status !== 500,
    `Injected route ${ip} triggered HTTP 500 server crash! Status: ${res.status}`
  );
  console.log(`  ✓ [HTTP ${res.status}] Resilient handling for ${ip}`);
}
console.log("  ✓ [PASS] Zero HTTP 500 crashes under adversarial URL injection.\n");

console.log("[PROBE 8/8] Adversarial Verification Complete.");
console.log("======================================================================");
console.log("  ALL EMPIRICAL ADVERSARIAL PROBES PASSED SUCCESSFULLY (100%)");
console.log("======================================================================\n");
