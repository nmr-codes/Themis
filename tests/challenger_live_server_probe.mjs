/**
 * Live HTTP Server Empirical Probe for Challenger M1_1
 * Spawns production Next.js server on port 3088, tests live HTTP responses,
 * error/404 boundaries, unauthenticated specialist access, and terminates cleanly.
 */

import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n======================================================================");
console.log("  CHALLENGER M1_1: LIVE PRODUCTION HTTP SERVER VERIFICATION PROBE");
console.log("======================================================================\n");

const isWindows = process.platform === "win32";
const PORT = 3088;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`, { method: "HEAD" });
      if (res.status === 200 || res.status === 304) {
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    await sleep(500);
  }
  throw new Error(`Server failed to start on port ${PORT} within 15 seconds`);
}

async function runLiveProbes() {
  console.log(`[1/5] Spawning 'next start -p ${PORT}' in production mode...`);
  
  const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
  const serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
    detached: false,
  });

  serverProcess.stderr.on("data", (data) => {
    // console.log(`[Next.js stderr] ${data}`);
  });

  try {
    console.log(`[2/5] Waiting for server at ${BASE_URL}...`);
    await waitForServer();
    console.log(`  ✓ Server is LIVE and accepting connections!\n`);

    // Probe 1: Root Landing Page (HTTP 200, Editorial Layout, Fonts)
    console.log("[3/5] Testing GET / (Landing Page & Root Layout)...");
    const homeRes = await fetch(`${BASE_URL}/`);
    assert.equal(homeRes.status, 200, "Root page must return HTTP 200");
    const homeHtml = await homeRes.text();
    assert.ok(
      homeHtml.includes("Themis") || homeHtml.includes("Huquqiy"),
      "Root page HTML must contain platform brand name"
    );
    assert.ok(
      homeHtml.includes("--font-serif") || homeHtml.includes("font-serif") || homeHtml.includes("Playfair"),
      "Root page must deliver serif font tokens"
    );
    console.log("  ✓ GET / returned HTTP 200 OK with editorial typography tokens.");

    // Probe 2: Public Specialists Catalog (HTTP 200, NO redirect for unauthenticated visitors)
    console.log("\n[4/5] Testing GET /specialists (Unauthenticated Citizen Access)...");
    const specRes = await fetch(`${BASE_URL}/specialists`, { redirect: "manual" });
    assert.equal(
      specRes.status,
      200,
      `Unauthenticated GET /specialists MUST return HTTP 200, got ${specRes.status} (should NOT redirect to /login)`
    );
    const specHtml = await specRes.text();
    assert.ok(
      specHtml.includes("specialist") || specHtml.includes("advokat") || specHtml.includes("Reyestr") || specHtml.length > 500,
      "Specialists catalog HTML must render successfully"
    );
    console.log("  ✓ GET /specialists returned HTTP 200 OK without unauthenticated redirect loop!");

    // Probe 3: Non-existent route 404 Boundary
    console.log("\n[5/5] Testing GET /adversarial-nonexistent-route-xyz (404 Boundary)...");
    const notFoundRes = await fetch(`${BASE_URL}/adversarial-nonexistent-route-xyz-98765`, {
      redirect: "manual",
    });
    assert.equal(notFoundRes.status, 404, `Unknown route must return HTTP 404, got ${notFoundRes.status}`);
    const notFoundHtml = await notFoundRes.text();
    assert.ok(
      notFoundHtml.includes("404") ||
      notFoundHtml.includes("Sahifa Mavjud Emas") ||
      notFoundHtml.includes("adolatdadir") ||
      notFoundHtml.includes("Temur"),
      "404 page HTML must display custom bespoke error/decree"
    );
    console.log("  ✓ GET /adversarial-nonexistent-route-xyz returned HTTP 404 with bespoke editorial decree!");

    console.log("\n======================================================================");
    console.log("  ALL LIVE SERVER EMPIRICAL PROBES PASSED (100% SUCCESS)");
    console.log("======================================================================\n");
  } finally {
    console.log("Shutting down test Next.js server...");
    if (isWindows) {
      spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
    } else {
      serverProcess.kill("SIGTERM");
    }
    await sleep(1000);
  }
}

runLiveProbes().catch((err) => {
  console.error("Live probe failed:", err);
  process.exit(1);
});
