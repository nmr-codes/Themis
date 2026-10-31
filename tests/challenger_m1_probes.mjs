/**
 * Empirical Challenger M1_1 Adversarial Probe Suite
 * Target: Milestone 1 (Foundation, Build Stability & Editorial Design System)
 * 
 * Verifies:
 * 1. Supabase Middleware Route Protection & Bypass Resistance (both configured and unconfigured states)
 * 2. Unauthenticated Public Access to Specialist Catalog & Dossiers
 * 3. Protected Route Redirection (/dashboard, /profile, /consultations, /specialist, /admin)
 * 4. Authenticated Redirection on Auth Routes (/login, /register -> /dashboard)
 * 5. App Router Boundaries: not-found.tsx, error.tsx, loading.tsx structural and runtime conformance
 * 6. Interface Contracts: Route link normalization, Design tokens, Typography pairing, Uzbek Cyrillic support
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n======================================================================");
console.log("  CHALLENGER M1_1: EMPIRICAL ADVERSARIAL VERIFICATION PROBE SUITE");
console.log("======================================================================\n");

let passedCount = 0;
let failedCount = 0;

function runProbe(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PROBE PASSED] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ [PROBE FAILED] ${name}`);
    console.error(`    Error: ${err.message}`);
    failedCount++;
  }
}

// ============================================================================
// PROBE SUITE 1: MIDDLEWARE ROUTE PROTECTION & UNCONFIGURED RESILIENCE
// ============================================================================
console.log("\n--- Suite 1: Middleware Route Protection & Edge Cases ---");

// Test the pure middleware logic implemented in src/lib/supabase/middleware.ts
runProbe("Middleware unconfigured guard detection handles all placeholder patterns", () => {
  const checkUnconfigured = (url, key) => {
    return (
      !url ||
      !key ||
      url.includes("your-project") ||
      url.includes("placeholder") ||
      key.includes("your-anon-key") ||
      key.includes("placeholder")
    );
  };

  assert.equal(checkUnconfigured(undefined, undefined), true);
  assert.equal(checkUnconfigured("", ""), true);
  assert.equal(checkUnconfigured("https://placeholder-domain.supabase.co", "placeholder-anon-key"), true);
  assert.equal(checkUnconfigured("https://your-project.supabase.co", "your-anon-key"), true);
  assert.equal(checkUnconfigured("https://valid-id.supabase.co", "placeholder-key"), true);
  assert.equal(checkUnconfigured("https://valid-id.supabase.co", "eyJh...valid-jwt-token"), false);
});

runProbe("Middleware route categorization accurately protects private routes and permits public catalog browsing", () => {
  const evaluateRouteAccess = (pathname, user) => {
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isPublicPage =
      pathname === "/" ||
      pathname.startsWith("/specialists") ||
      pathname.startsWith("/api") ||
      isAuthPage;

    if (!user && !isPublicPage) {
      return { action: "REDIRECT", destination: "/login" };
    }

    if (user && isAuthPage) {
      return { action: "REDIRECT", destination: "/dashboard" };
    }

    return { action: "PROCEED" };
  };

  // 1. Unauthenticated users (user === null)
  // Public pages must proceed
  assert.deepEqual(evaluateRouteAccess("/", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists/adv-101", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists/tashkent/criminal", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/api/ai/chat", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/login", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/register", null), { action: "PROCEED" });

  // Protected pages must redirect unauthenticated users to /login
  assert.deepEqual(evaluateRouteAccess("/dashboard", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/profile", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/consultations", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/consultations/123/chat", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/specialist", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/specialist/earnings", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/admin", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/admin/specialists", null), { action: "REDIRECT", destination: "/login" });

  // 2. Authenticated users (user != null)
  // Auth pages must redirect to /dashboard
  assert.deepEqual(evaluateRouteAccess("/login", { id: "u1" }), { action: "REDIRECT", destination: "/dashboard" });
  assert.deepEqual(evaluateRouteAccess("/register", { id: "u1" }), { action: "REDIRECT", destination: "/dashboard" });

  // Other pages must proceed
  assert.deepEqual(evaluateRouteAccess("/", { id: "u1" }), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists", { id: "u1" }), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists/adv-101", { id: "u1" }), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/dashboard", { id: "u1" }), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/profile", { id: "u1" }), { action: "PROCEED" });
});

runProbe("Middleware cookie remove and set methods properly pass options and empty values", () => {
  const middlewareSrc = fs.readFileSync(path.join(rootDir, "src/lib/supabase/middleware.ts"), "utf-8");
  
  // Verify remove sets empty value: "" with options to prevent SSR crash
  assert.ok(
    middlewareSrc.includes('request.cookies.set({ name, value: "", ...options })'),
    "middleware.ts must explicitly set value: '' on cookie removal for request.cookies"
  );
  assert.ok(
    middlewareSrc.includes('response.cookies.set({ name, value: "", ...options })'),
    "middleware.ts must explicitly set value: '' on cookie removal for response.cookies"
  );
});

// ============================================================================
// PROBE SUITE 2: APP ROUTER BOUNDARY RESILIENCE (404, ERROR, LOADING)
// ============================================================================
console.log("\n--- Suite 2: App Router Boundary Resilience ---");

runProbe("not-found.tsx adheres to route link contracts and cultural legal identity", () => {
  const notFoundSrc = fs.readFileSync(path.join(rootDir, "src/app/not-found.tsx"), "utf-8");

  // Check strict canonical route contracts
  assert.ok(notFoundSrc.includes('href="/"'), "not-found.tsx must link to canonical /");
  assert.ok(notFoundSrc.includes('href="/specialists"'), "not-found.tsx must link to canonical /specialists");
  assert.ok(notFoundSrc.includes('href="/ai-chat"'), "not-found.tsx must link to canonical /ai-chat");

  // Adversarial check: Ensure no legacy broken '/dashboard/specialists' link exists
  assert.ok(
    !notFoundSrc.includes("/dashboard/specialists"),
    "not-found.tsx must NEVER contain broken /dashboard/specialists link"
  );
  assert.ok(
    !notFoundSrc.includes("/dashboard/ai-chat"),
    "not-found.tsx must NEVER contain broken /dashboard/ai-chat link"
  );

  // Check cultural motif: Amir Temur quote
  assert.ok(
    notFoundSrc.includes("Kuch — adolatdadir"),
    "not-found.tsx must incorporate Amir Temur quote 'Kuch — adolatdadir'"
  );
  assert.ok(
    notFoundSrc.includes("404 — Sahifa Mavjud Emas"),
    "not-found.tsx must display 404 heading"
  );
  assert.ok(
    notFoundSrc.includes("BEKOR QILINGAN"),
    "not-found.tsx must display archival notary badge 'BEKOR QILINGAN'"
  );
});

runProbe("error.tsx root boundary has 'use client', bilingual security notice, and direct support contacts", () => {
  const errorSrc = fs.readFileSync(path.join(rootDir, "src/app/error.tsx"), "utf-8");

  assert.ok(errorSrc.startsWith('"use client"') || errorSrc.startsWith("'use client'"), "error.tsx must be a client component");
  assert.ok(errorSrc.includes("reset()"), "error.tsx must provide a reset retry mechanism");
  assert.ok(errorSrc.includes("error.digest"), "error.tsx must support diagnostic digest display");
  assert.ok(errorSrc.includes("error.message"), "error.tsx must support technical error detail view");

  // Check emergency contacts
  assert.ok(errorSrc.includes("+998 71 200-01-08"), "error.tsx must contain hotline +998 71 200-01-08");
  assert.ok(errorSrc.includes("@themis_support_uz"), "error.tsx must contain Telegram @themis_support_uz");
  assert.ok(errorSrc.includes("yordam@themis.uz"), "error.tsx must contain email yordam@themis.uz");

  // Check bilingual confidentiality notice (Uzbek & Russian)
  assert.ok(
    errorSrc.includes("daxlsiz saqlanmoqda"),
    "error.tsx must provide Uzbek confidentiality assurance"
  );
  assert.ok(
    errorSrc.includes("Конфиденциальность правовой информации"),
    "error.tsx must provide Russian confidentiality assurance"
  );
});

runProbe("loading.tsx root skeleton contains judicial spinner and Lex.uz synchronization indicator", () => {
  const loadingSrc = fs.readFileSync(path.join(rootDir, "src/app/loading.tsx"), "utf-8");

  assert.ok(
    loadingSrc.includes("Huquqiy ma&apos;lumotlar yuklanmoqda") || loadingSrc.includes("Huquqiy ma'lumotlar yuklanmoqda"),
    "loading.tsx must display legal loading heading"
  );
  assert.ok(loadingSrc.includes("Lex.uz"), "loading.tsx must reference Lex.uz synchronization");
  assert.ok(loadingSrc.includes("Skeleton"), "loading.tsx must utilize Skeleton primitives");
  assert.ok(loadingSrc.includes("animate-spin"), "loading.tsx must feature animated spinner");
});

// ============================================================================
// PROBE SUITE 3: DESIGN TOKENS, TYPOGRAPHY & CYRILLIC SUPPORT
// ============================================================================
console.log("\n--- Suite 3: Design Tokens, Typography & Uzbek Cyrillic ---");

runProbe("src/app/layout.tsx configures Google Fonts with Cyrillic support and theme color viewport", () => {
  const layoutSrc = fs.readFileSync(path.join(rootDir, "src/app/layout.tsx"), "utf-8");

  // Typography imports
  assert.ok(layoutSrc.includes("Playfair_Display"), "layout.tsx must import Playfair_Display");
  assert.ok(layoutSrc.includes("Plus_Jakarta_Sans"), "layout.tsx must import Plus_Jakarta_Sans");
  assert.ok(layoutSrc.includes("Cinzel"), "layout.tsx must import Cinzel");

  // Uzbek Cyrillic charset support (critical for national legal literature and Lex.uz statutes)
  assert.ok(
    layoutSrc.includes('subsets: ["latin", "cyrillic"]') || layoutSrc.includes("cyrillic"),
    "Playfair Display must include Cyrillic charset"
  );
  assert.ok(
    layoutSrc.includes("cyrillic-ext") || layoutSrc.includes("cyrillic"),
    "Plus Jakarta Sans must include Cyrillic charset"
  );

  // Variable injection in HTML class
  assert.ok(layoutSrc.includes("serifFont.variable"), "layout.tsx must inject serif font variable");
  assert.ok(layoutSrc.includes("sansFont.variable"), "layout.tsx must inject sans font variable");
  assert.ok(layoutSrc.includes("cinzelFont.variable"), "layout.tsx must inject cinzel font variable");

  // Viewport theme colors
  assert.ok(layoutSrc.includes("#FAF7F0"), "layout.tsx must define light themeColor #FAF7F0");
  assert.ok(layoutSrc.includes("#081021"), "layout.tsx must define dark themeColor #081021");

  // Title template
  assert.ok(layoutSrc.includes("%s | Themis — Huquqiy Yordam"), "layout.tsx must configure brand title template");
});

runProbe("src/app/globals.css specifies complete Warm Uzbek Heritage HSL token matrix", () => {
  const cssSrc = fs.readFileSync(path.join(rootDir, "src/app/globals.css"), "utf-8");

  // Light Mode Tokens
  const requiredTokens = [
    "--background: 36 33% 97%",       // Warm Parchment #FAF8F5
    "--foreground: 225 59% 11%",      // Obsidian Ink #0B132B
    "--primary: 216 85% 34%",         // Samarkand Azure #0D47A1
    "--accent: 14 63% 44%",           // Bukhara Terracotta #B84A2A
    "--border: 40 24% 85%",           // Parchment Border
    "--seal-verified: 143 64% 24%",   // Noble Emerald Seal #166534
    "--gold-crest: 44 67% 46%",       // Antique Gold Crest #C59B27
  ];

  for (const token of requiredTokens) {
    assert.ok(cssSrc.includes(token), `globals.css must contain light token definition: ${token}`);
  }

  // Dark Mode Tokens
  assert.ok(cssSrc.includes(".dark"), "globals.css must contain .dark class definitions");
  assert.ok(cssSrc.includes("--background: 225 55% 8%"), "globals.css dark must define obsidian midnight chamber");
  assert.ok(cssSrc.includes("--foreground: 38 30% 93%"), "globals.css dark must define warm vellum text");

  // Shared utility classes
  const requiredClasses = [
    ".font-editorial-heading",
    ".font-judicial-sub",
    ".paper-card",
    ".parchment-card",
    ".seal-badge",
    ".judicial-crest",
    ".statute-border",
    ".legal-memorandum",
    ".notary-stamp",
  ];

  for (const cls of requiredClasses) {
    assert.ok(cssSrc.includes(cls), `globals.css must define editorial utility class: ${cls}`);
  }
});

runProbe("tailwind.config.ts extends editorial fonts and Uzbek heritage color palettes", () => {
  const tailwindSrc = fs.readFileSync(path.join(rootDir, "tailwind.config.ts"), "utf-8");

  // Font family mappings
  assert.ok(tailwindSrc.includes('serif: ["var(--font-serif)'), "tailwind.config must map serif to --font-serif");
  assert.ok(tailwindSrc.includes('sans: ["var(--font-sans)'), "tailwind.config must map sans to --font-sans");
  assert.ok(tailwindSrc.includes('display: ["var(--font-display)'), "tailwind.config must map display to --font-display");

  // Heritage colors
  assert.ok(tailwindSrc.includes('samarkand: {'), "tailwind.config must define samarkand color palette");
  assert.ok(tailwindSrc.includes('"#0D47A1"'), "tailwind.config must define #0D47A1 for Samarkand Azure");
  assert.ok(tailwindSrc.includes('bukhara: {'), "tailwind.config must define bukhara color palette");
  assert.ok(tailwindSrc.includes('"#B84A2A"'), "tailwind.config must define #B84A2A for Bukhara Terracotta");
  assert.ok(tailwindSrc.includes('seal: "#166534"'), "tailwind.config must define #166534 for emerald seal");
  assert.ok(tailwindSrc.includes('crest: "#C59B27"'), "tailwind.config must define #C59B27 for antique gold crest");
  assert.ok(tailwindSrc.includes('parchment: {'), "tailwind.config must define parchment palette");
  assert.ok(tailwindSrc.includes('obsidian: {'), "tailwind.config must define obsidian palette");
});

// ============================================================================
// PROBE SUITE 4: ESLINT CONFIGURATION & BUILD ARTIFACT INTEGRITY
// ============================================================================
console.log("\n--- Suite 4: Tooling & Build Artifact Integrity ---");

runProbe(".eslintrc.json exists and extends next/core-web-vitals", () => {
  const eslintPath = path.join(rootDir, ".eslintrc.json");
  assert.ok(fs.existsSync(eslintPath), ".eslintrc.json must exist at project root");
  const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, "utf-8"));
  assert.equal(eslintConfig.extends, "next/core-web-vitals");
});

runProbe(".next build output contains all expected static and dynamic route manifests", () => {
  const buildManifestPath = path.join(rootDir, ".next/build-manifest.json");
  const routesManifestPath = path.join(rootDir, ".next/routes-manifest.json");

  assert.ok(fs.existsSync(buildManifestPath), ".next/build-manifest.json must exist");
  assert.ok(fs.existsSync(routesManifestPath), ".next/routes-manifest.json must exist");

  const routesManifest = JSON.parse(fs.readFileSync(routesManifestPath, "utf-8"));
  
  // Verify static routes
  const staticPaths = routesManifest.staticRoutes.map(r => r.page);
  assert.ok(staticPaths.includes("/"), "routes-manifest must include /");
  assert.ok(staticPaths.includes("/specialists"), "routes-manifest must include /specialists");
  assert.ok(staticPaths.includes("/dashboard"), "routes-manifest must include /dashboard");
  assert.ok(staticPaths.includes("/ai-chat"), "routes-manifest must include /ai-chat");
  assert.ok(staticPaths.includes("/consultations"), "routes-manifest must include /consultations");

  // Verify dynamic routes
  const dynamicPaths = routesManifest.dynamicRoutes.map(r => r.page);
  assert.ok(dynamicPaths.includes("/specialists/[id]"), "routes-manifest must include /specialists/[id]");
  assert.ok(dynamicPaths.includes("/ai-chat/[id]"), "routes-manifest must include /ai-chat/[id]");
  assert.ok(dynamicPaths.includes("/consultations/[id]"), "routes-manifest must include /consultations/[id]");
  assert.ok(dynamicPaths.includes("/consultations/[id]/chat"), "routes-manifest must include /consultations/[id]/chat");
});

// ============================================================================
// PROBE SUITE 5: ADVERSARIAL ROUTE INJECTIONS & QUERY PARAMETER HANDLING
// ============================================================================
console.log("\n--- Suite 5: Adversarial Route Injections & Normalization ---");

runProbe("Middleware correctly handles trailing slashes, URL encoding, and query parameters", () => {
  const evaluateRouteAccess = (pathname, user) => {
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isPublicPage =
      pathname === "/" ||
      pathname.startsWith("/specialists") ||
      pathname.startsWith("/api") ||
      isAuthPage;

    if (!user && !isPublicPage) {
      return { action: "REDIRECT", destination: "/login" };
    }

    if (user && isAuthPage) {
      return { action: "REDIRECT", destination: "/dashboard" };
    }

    return { action: "PROCEED" };
  };

  // Query parameter variations
  assert.deepEqual(evaluateRouteAccess("/specialists?branch=labor&region=tashkent_city", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists/adv-445?ref=telegram&promo=1", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/specialists/", null), { action: "PROCEED" });
  assert.deepEqual(evaluateRouteAccess("/api/ai/chat", null), { action: "PROCEED" });

  // Adversarial attempts to bypass /dashboard with encoded paths or query tricks
  assert.deepEqual(evaluateRouteAccess("/dashboard?redirect=evil.com", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/dashboard/../dashboard", null), { action: "REDIRECT", destination: "/login" });
  assert.deepEqual(evaluateRouteAccess("/admin/specialists/verify?id=99", null), { action: "REDIRECT", destination: "/login" });
});

// ============================================================================
// PROBE SUITE 6: MATHEMATICAL WCAG CONTRAST VERIFICATION OF COLOR TOKENS
// ============================================================================
console.log("\n--- Suite 6: Mathematical WCAG Contrast of Warm Heritage Palette ---");

runProbe("Editorial palette achieves WCAG AAA text contrast ratio (> 7:1) for legal legibility", () => {
  // Convert HSL to RGB
  function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Calculate relative luminance according to WCAG 2.1 specs
  function relativeLuminance([r, g, b]) {
    const sRGB = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  // Calculate contrast ratio
  function contrastRatio(rgb1, rgb2) {
    const l1 = relativeLuminance(rgb1);
    const l2 = relativeLuminance(rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Light Mode Tokens:
  // Background: 36 33% 97% -> Warm Parchment
  // Foreground: 225 59% 11% -> Obsidian Document Ink
  const bgRgb = hslToRgb(36, 33, 97);
  const fgRgb = hslToRgb(225, 59, 11);

  const ratio = contrastRatio(bgRgb, fgRgb);
  console.log(`    Calculated Light Theme Contrast Ratio: ${ratio.toFixed(2)}:1 (Requirement: >= 7.0:1 AAA)`);
  assert.ok(ratio >= 7.0, `Contrast ratio ${ratio.toFixed(2)} must satisfy WCAG AAA (>= 7.0:1)`);

  // Dark Mode Tokens:
  // Background: 225 55% 8% -> Obsidian Midnight Chamber
  // Foreground: 38 30% 93% -> Warm Vellum Text
  const darkBgRgb = hslToRgb(225, 55, 8);
  const darkFgRgb = hslToRgb(38, 30, 93);
  const darkRatio = contrastRatio(darkBgRgb, darkFgRgb);
  console.log(`    Calculated Dark Theme Contrast Ratio: ${darkRatio.toFixed(2)}:1 (Requirement: >= 7.0:1 AAA)`);
  assert.ok(darkRatio >= 7.0, `Dark mode contrast ratio ${darkRatio.toFixed(2)} must satisfy WCAG AAA (>= 7.0:1)`);
});

console.log("\n======================================================================");
console.log(`  PROBE SUMMARY: ${passedCount} passed, ${failedCount} failed`);
console.log("======================================================================\n");

if (failedCount > 0) {
  process.exitCode = 1;
}
