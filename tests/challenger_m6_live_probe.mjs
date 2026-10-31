/**
 * Challenger M6_2: Comprehensive Live Production Server & Route Probe Runner
 * Tests all 27 Next.js static & dynamic routes, API endpoints, error boundaries,
 * and response headers against a live Next.js production server.
 */

import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const PORT = 3098;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`, { method: "HEAD" });
      if (res.status === 200 || res.status === 304) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await sleep(500);
  }
  throw new Error(`Server failed to start on port ${PORT} within 20 seconds`);
}

// Error signatures that must NEVER appear in responses
const ERROR_SIGNATURES = [
  "Application error: a server-side exception has occurred",
  "Unhandled Runtime Error",
  "500 - Internal Server Error",
  "TypeError:",
  "ReferenceError:",
  "ChunkLoadError:",
];

async function probeRoute(routePath, expectedStatuses = [200], options = {}) {
  const url = `${BASE_URL}${routePath}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: options.headers || {},
    body: options.body,
    redirect: "manual",
  });

  const contentType = res.headers.get("content-type") || "";
  let text = "";
  try {
    text = await res.text();
  } catch (err) {
    text = `<failed to read body: ${err.message}>`;
  }

  const passedStatus = expectedStatuses.includes(res.status);
  
  // Verify absence of 500 runtime error boundaries
  let errorFound = null;
  for (const sig of ERROR_SIGNATURES) {
    if (text.includes(sig)) {
      errorFound = sig;
      break;
    }
  }

  return {
    path: routePath,
    status: res.status,
    passedStatus,
    contentType,
    contentLength: text.length,
    errorFound,
    body: text,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

async function main() {
  console.log("======================================================================");
  console.log("  CHALLENGER M6_2: COMPREHENSIVE LIVE PRODUCTION PROBE RUNNER");
  console.log(`  Target: Next.js Production Server on port ${PORT}`);
  console.log("======================================================================\n");

  const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
  console.log(`[1] Launching production server: node ${nextBin} start -p ${PORT}...`);

  const serverErrors = [];
  const serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
    detached: false,
  });

  serverProcess.stdout.on("data", (chunk) => {
    // console.log(`[Server stdout] ${chunk}`);
  });

  serverProcess.stderr.on("data", (chunk) => {
    const msg = chunk.toString();
    if (msg.includes("Error:") || msg.includes("TypeError") || msg.includes("Exception")) {
      serverErrors.push(msg.trim());
    }
  });

  let probeResults = [];

  try {
    console.log(`[2] Polling server health at ${BASE_URL}...`);
    await waitForServer();
    console.log(`  ✓ Production server is healthy and accepting requests on port ${PORT}!\n`);

    console.log("[3] Commencing comprehensive route probes across all platform tiers...\n");

    // -------------------------------------------------------------------------
    // Tier A: Public Routes & Content Pages
    // -------------------------------------------------------------------------
    console.log("--- TIER A: PUBLIC ROUTES ---");
    const publicRoutes = [
      { path: "/", expected: [200], name: "Root Editorial Landing Page" },
      { path: "/privacy", expected: [200], name: "Maxfiylik Siyosati (Privacy Policy)" },
      { path: "/terms", expected: [200], name: "Foydalanish Qoidalari (Terms)" },
      { path: "/about", expected: [200], name: "Platforma Haqida (About)" },
      { path: "/specialists", expected: [200], name: "Advokatlar Katalogi (Specialists Directory)" },
      { path: "/specialists/spec-1", expected: [200], name: "Specialist Dossier 1 (Azizbek Rahimov)" },
      { path: "/specialists/spec-2", expected: [200], name: "Specialist Dossier 2 (Dilnoza Karimova)" },
      { path: "/specialists/spec-3", expected: [200], name: "Specialist Dossier 3 (Rustam Mahmudov)" },
      { path: "/specialists/spec-4", expected: [200], name: "Specialist Dossier 4 (Otabek Yusupov)" },
      { path: "/specialists/spec-5", expected: [200], name: "Specialist Dossier 5 (Shahnoza Alimova)" },
      { path: "/specialists/nonexistent-id", expected: [200, 404], name: "Specialist Invalid ID Dossier Graceful UI" },
      { path: "/_not-found", expected: [404, 200], name: "Explicit /_not-found Internal Route" },
      { path: "/adversarial-404-nonexistent-page", expected: [404], name: "System 404 Error Boundary Handler" },
    ];

    for (const r of publicRoutes) {
      const res = await probeRoute(r.path, r.expected);
      probeResults.push({ ...res, name: r.name, group: "Public" });
      const symbol = res.passedStatus && !res.errorFound ? "✓" : "✗";
      const headerSnippet = `[content-type: ${res.contentType || "none"}]`;
      console.log(`  ${symbol} ${r.path.padEnd(38)} [HTTP ${res.status}] ${headerSnippet.padEnd(35)} (${res.contentLength} bytes) - ${r.name}`);
      assert.ok(res.passedStatus, `Route ${r.path} failed status check (got ${res.status}, expected ${r.expected})`);
      assert.equal(res.errorFound, null, `Route ${r.path} exposed error boundary: ${res.errorFound}`);
    }

    // -------------------------------------------------------------------------
    // Tier B: Authentication Pages
    // -------------------------------------------------------------------------
    console.log("\n--- TIER B: AUTHENTICATION ROUTES ---");
    const authRoutes = [
      { path: "/login", expected: [200], name: "Kirish Sahifasi & Demo Switcher" },
      { path: "/register", expected: [200], name: "Ro'yxatdan O'tish Sahifasi" },
    ];

    for (const r of authRoutes) {
      const res = await probeRoute(r.path, r.expected);
      probeResults.push({ ...res, name: r.name, group: "Auth" });
      const symbol = res.passedStatus && !res.errorFound ? "✓" : "✗";
      const headerSnippet = `[content-type: ${res.contentType || "none"}]`;
      console.log(`  ${symbol} ${r.path.padEnd(38)} [HTTP ${res.status}] ${headerSnippet.padEnd(35)} (${res.contentLength} bytes) - ${r.name}`);
      assert.ok(res.passedStatus, `Route ${r.path} failed status check`);
      assert.equal(res.errorFound, null, `Route ${r.path} exposed error boundary`);
    }

    // -------------------------------------------------------------------------
    // Tier C: Client Portal Routes
    // -------------------------------------------------------------------------
    console.log("\n--- TIER C: CLIENT PORTAL ROUTES ---");
    const clientRoutes = [
      { path: "/dashboard", expected: [200], name: "Fuqaro Shaxsiy Kabineti (Client Dashboard)" },
      { path: "/profile", expected: [200], name: "Mijoz Profili (User Profile)" },
      { path: "/ai-chat", expected: [200], name: "AI Huquqiy Tahlil (Conversations List)" },
      { path: "/ai-chat/conv-1", expected: [200], name: "AI Memorandum Dossier (conv-1 Labor)" },
      { path: "/ai-chat/conv-2", expected: [200], name: "AI Memorandum Dossier (conv-2 Family)" },
      { path: "/ai-chat/conv-3", expected: [200], name: "AI Memorandum Dossier (conv-3 Housing)" },
      { path: "/consultations", expected: [200], name: "Mening Konsultatsiyalarim (Bookings List)" },
      { path: "/consultations/c-101", expected: [200], name: "Konsultatsiya Tafsiloti (c-101 Detail)" },
      { path: "/consultations/c-101/chat", expected: [200], name: "Advokat Bilan Onlayn Xona (c-101 Chat Room)" },
    ];

    for (const r of clientRoutes) {
      const res = await probeRoute(r.path, r.expected);
      probeResults.push({ ...res, name: r.name, group: "Client" });
      const symbol = res.passedStatus && !res.errorFound ? "✓" : "✗";
      const headerSnippet = `[content-type: ${res.contentType || "none"}]`;
      console.log(`  ${symbol} ${r.path.padEnd(38)} [HTTP ${res.status}] ${headerSnippet.padEnd(35)} (${res.contentLength} bytes) - ${r.name}`);
      assert.ok(res.passedStatus, `Route ${r.path} failed status check`);
      assert.equal(res.errorFound, null, `Route ${r.path} exposed error boundary`);
    }

    // -------------------------------------------------------------------------
    // Tier D: Specialist Portal Routes
    // -------------------------------------------------------------------------
    console.log("\n--- TIER D: SPECIALIST PORTAL ROUTES ---");
    const specialistRoutes = [
      { path: "/specialist", expected: [200], name: "Advokat Boshqaruv Paneli (Specialist KPI)" },
      { path: "/specialist/requests", expected: [200], name: "Mijoz Murojaatlari (Incoming Requests)" },
      { path: "/specialist/services", expected: [200], name: "Xizmatlar & Tariflar Boshqaruvi" },
      { path: "/specialist/schedule", expected: [200], name: "Ish Vaqti & Qabul Jadvali (Schedule)" },
      { path: "/specialist/earnings", expected: [200], name: "Moliyaviy Daromad & 15% Komissiya" },
      { path: "/specialist/profile", expected: [200], name: "Advokat Kasbiy Profili & Litsenziya" },
    ];

    for (const r of specialistRoutes) {
      const res = await probeRoute(r.path, r.expected);
      probeResults.push({ ...res, name: r.name, group: "Specialist" });
      const symbol = res.passedStatus && !res.errorFound ? "✓" : "✗";
      const headerSnippet = `[content-type: ${res.contentType || "none"}]`;
      console.log(`  ${symbol} ${r.path.padEnd(38)} [HTTP ${res.status}] ${headerSnippet.padEnd(35)} (${res.contentLength} bytes) - ${r.name}`);
      assert.ok(res.passedStatus, `Route ${r.path} failed status check`);
      assert.equal(res.errorFound, null, `Route ${r.path} exposed error boundary`);
    }

    // -------------------------------------------------------------------------
    // Tier E: Admin Portal Routes
    // -------------------------------------------------------------------------
    console.log("\n--- TIER E: ADMIN PORTAL ROUTES ---");
    const adminRoutes = [
      { path: "/admin", expected: [200], name: "Tizim Administrator Boshqaruvi (Admin KPI)" },
      { path: "/admin/specialists", expected: [200], name: "Advokat Litsenziyalarini Tasdiqlash" },
      { path: "/admin/users", expected: [200], name: "Foydalanuvchilar Ro'yxati (User Management)" },
      { path: "/admin/consultations", expected: [200], name: "Konsultatsiyalar Nazorati" },
      { path: "/admin/reviews", expected: [200], name: "Mijozlar Fikrlari & Sharhlar Moderatsiyasi" },
      { path: "/admin/transactions", expected: [200], name: "Moliyaviy Operatsiyalar & Audit Jurnali" },
    ];

    for (const r of adminRoutes) {
      const res = await probeRoute(r.path, r.expected);
      probeResults.push({ ...res, name: r.name, group: "Admin" });
      const symbol = res.passedStatus && !res.errorFound ? "✓" : "✗";
      const headerSnippet = `[content-type: ${res.contentType || "none"}]`;
      console.log(`  ${symbol} ${r.path.padEnd(38)} [HTTP ${res.status}] ${headerSnippet.padEnd(35)} (${res.contentLength} bytes) - ${r.name}`);
      assert.ok(res.passedStatus, `Route ${r.path} failed status check`);
      assert.equal(res.errorFound, null, `Route ${r.path} exposed error boundary`);
    }

    // -------------------------------------------------------------------------
    // Tier F: API Endpoint Adversarial Stress Testing (/api/ai/chat)
    // -------------------------------------------------------------------------
    console.log("\n--- TIER F: API ENDPOINT ADVERSARIAL STRESS TESTING (POST /api/ai/chat) ---");

    // F.1: Valid Labor Dispute Query
    console.log("  [F.1] Testing valid labor dispute query...");
    const laborRes = await probeRoute("/api/ai/chat", [200], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Ish beruvchim 3 oydan beri oylik maoshimni to'lamayapti va noqonuniy bo'shatmoqchi",
        region: "tashkent_city",
      }),
    });
    assert.equal(laborRes.status, 200, "Valid labor inquiry must return 200");
    const laborJson = JSON.parse(laborRes.body);
    assert.equal(laborJson.response.category, "labor", "Must classify as labor");
    assert.ok(
      laborJson.response.sources.some((s) => s.title.includes("Mehnat") || s.article.includes("161")),
      "Must cite Mehnat Kodeksi"
    );
    assert.ok(Array.isArray(laborJson.response.recommended_specialists), "Must return recommended specialists");
    console.log("    ✓ Labor inquiry classified: labor, Mehnat Kodeksi cited, specialists recommended.");

    // F.2: Valid Family Dispute Query
    console.log("  [F.2] Testing valid family/child support query...");
    const familyRes = await probeRoute("/api/ai/chat", [200], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Turmush o'rtog'im bilan ajrashyapmiz, 2 nafar voyaga yetmagan farzandim uchun aliment undirish tartibi qanday?",
        region: "samarkand",
      }),
    });
    assert.equal(familyRes.status, 200, "Valid family inquiry must return 200");
    const familyJson = JSON.parse(familyRes.body);
    assert.equal(familyJson.response.category, "family", "Must classify as family");
    assert.ok(
      familyJson.response.sources.some((s) => s.title.includes("Oila") || s.article.includes("96")),
      "Must cite Oila Kodeksi"
    );
    console.log("    ✓ Family inquiry classified: family, Oila Kodeksi cited.");

    // F.3: Empty Query Object {}
    console.log("  [F.3] Testing empty payload {}...");
    const emptyObjRes = await probeRoute("/api/ai/chat", [400], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(emptyObjRes.status, 400, "Empty JSON object must return HTTP 400");
    const emptyObjJson = JSON.parse(emptyObjRes.body);
    assert.ok(emptyObjJson.error, "Must include error message");
    console.log(`    ✓ Empty JSON payload returned HTTP 400 (${emptyObjJson.error}).`);

    // F.4: Empty String Query {"message": "   "}
    console.log("  [F.4] Testing whitespace-only payload...");
    const whitespaceRes = await probeRoute("/api/ai/chat", [400], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "    \n\t  " }),
    });
    assert.equal(whitespaceRes.status, 400, "Whitespace message must return HTTP 400");
    console.log("    ✓ Whitespace payload returned HTTP 400.");

    // F.5: Malformed JSON
    console.log("  [F.5] Testing malformed JSON payload...");
    const malformedRes = await probeRoute("/api/ai/chat", [400, 500], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json syntax, missing braces ...",
    });
    assert.ok(
      [400, 500].includes(malformedRes.status),
      `Malformed JSON should return 400 or 500, got ${malformedRes.status}`
    );
    console.log(`    ✓ Malformed JSON handled gracefully without crashing server (HTTP ${malformedRes.status}).`);

    // F.6: Ultra-Long Legal Inquiry (>6,000 chars)
    console.log("  [F.6] Testing ultra-long payload (>6,000 characters)...");
    const longText = "Fuqaro va korxona o'rtasidagi shartnomaviy majburiyatlar buzilishi to'g'risida. ".repeat(85);
    const longRes = await probeRoute("/api/ai/chat", [200], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: longText }),
    });
    assert.equal(longRes.status, 200, "Long inquiry must return HTTP 200 without buffer overflow");
    const longJson = JSON.parse(longRes.body);
    assert.ok(longJson.response.category, "Long inquiry classified successfully");
    console.log(`    ✓ Ultra-long payload (${longText.length} chars) processed cleanly (HTTP 200).`);

    // -------------------------------------------------------------------------
    // Verification Summary & Console Error Checks
    // -------------------------------------------------------------------------
    console.log("\n======================================================================");
    console.log("  LIVE PROBE SUMMARY MATRIX");
    console.log("======================================================================\n");
    console.log(`Total Routes Probed:       ${probeResults.length}`);
    console.log(`Routes Passing Status:     ${probeResults.filter((p) => p.passedStatus).length}`);
    console.log(`500 Error Boundaries Hit:  ${probeResults.filter((p) => p.errorFound !== null).length}`);
    console.log(`Uncaught Server Errors:    ${serverErrors.length}`);

    if (serverErrors.length > 0) {
      console.warn("Server STDERR messages captured during run:");
      serverErrors.forEach((e) => console.warn(`  - ${e}`));
    }

    assert.equal(
      probeResults.every((p) => p.passedStatus && p.errorFound === null),
      true,
      "All route probes must succeed without status errors or error boundaries"
    );
    assert.equal(serverErrors.length, 0, "No fatal uncaught server exceptions should occur");

    console.log("\n✔ ALL 27+ PLATFORM ROUTES AND API PROBES PASSED WITH 100% SUCCESS!\n");
  } finally {
    console.log("[Teardown] Shutting down live test server...");
    if (isWindows) {
      spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
    } else {
      serverProcess.kill("SIGTERM");
    }
    await sleep(1500);
    console.log("[Teardown] Server terminated cleanly.");
  }
}

main().catch((err) => {
  console.error("FATAL ERROR IN LIVE PROBE RUNNER:", err);
  process.exit(1);
});
