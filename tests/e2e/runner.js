/**
 * Master E2E Test Suite Runner
 * Platform: Themis (Huquqiy Yordam) — Uzbekistan Legal Consultation Platform
 * 
 * Usage:
 *   node tests/e2e/runner.js
 *   node tests/e2e/runner.js --tier=1
 *   node tests/e2e/runner.js --tier=2
 *   node tests/e2e/runner.js --tier=3
 *   node tests/e2e/runner.js --tier=4
 *   node tests/e2e/runner.js --filter="labor"
 */

import { performance } from "node:perf_hooks";

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// Parse CLI flags
const args = process.argv.slice(2);
let tierFilter = null;
let nameFilter = null;
let verbose = false;

for (const arg of args) {
  if (arg.startsWith("--tier=")) {
    tierFilter = parseInt(arg.split("=")[1], 10);
  } else if (arg.startsWith("--filter=")) {
    nameFilter = arg.split("=")[1].toLowerCase();
  } else if (arg === "--verbose" || arg === "-v") {
    verbose = true;
  }
}

// Test Registry
const suites = [];

export function describe(suiteName, tierNumber, fn) {
  suites.push({
    name: suiteName,
    tier: tierNumber,
    fn,
  });
}

// Global test execution context
let currentSuite = null;
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: [],
  tierStats: {
    1: { total: 0, passed: 0, failed: 0 },
    2: { total: 0, passed: 0, failed: 0 },
    3: { total: 0, passed: 0, failed: 0 },
    4: { total: 0, passed: 0, failed: 0 },
    5: { total: 0, passed: 0, failed: 0 },
  },
};

export async function it(testName, testFn) {
  if (nameFilter && !testName.toLowerCase().includes(nameFilter) && !currentSuite.name.toLowerCase().includes(nameFilter)) {
    return;
  }

  results.total++;
  const tier = currentSuite.tier || 1;
  results.tierStats[tier].total++;

  const start = performance.now();
  try {
    await testFn();
    const duration = Math.round(performance.now() - start);
    results.passed++;
    results.tierStats[tier].passed++;
    console.log(`    ${GREEN}✓${RESET} ${testName} ${CYAN}(${duration}ms)${RESET}`);
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    results.failed++;
    results.tierStats[tier].failed++;
    results.failures.push({
      suite: currentSuite.name,
      test: testName,
      tier,
      error: err,
    });
    console.log(`    ${RED}✗ ${testName} (${duration}ms)${RESET}`);
    console.log(`      ${RED}Error: ${err.message}${RESET}`);
    if (verbose && err.stack) {
      console.log(`      ${RED}${err.stack}${RESET}`);
    }
  }
}

async function run() {
  console.log(`\n${BOLD}${BLUE}======================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}  THEMIS (HUQUQIY YORDAM) — END-TO-END AUTOMATED TEST RUNNER${RESET}`);
  console.log(`${BOLD}${BLUE}  Uzbekistan Legal Consultation Platform • Lex.uz Triage Engine${RESET}`);
  console.log(`${BOLD}${BLUE}======================================================================${RESET}\n`);

  if (tierFilter) {
    console.log(`${YELLOW}Filtering by Tier: ${tierFilter}${RESET}`);
  }
  if (nameFilter) {
    console.log(`${YELLOW}Filtering by pattern: "${nameFilter}"${RESET}`);
  }

  // Dynamically import test suite files
  await import("./tier1-feature-coverage.test.js");
  await import("./tier2-boundary-corner.test.js");
  await import("./tier3-cross-feature.test.js");
  await import("./tier4-real-world-scenarios.test.js");
  try {
    await import("./tier5-adversarial-hardening.test.js");
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") {
      throw err;
    }
  }

  const startTime = performance.now();

  for (const suite of suites) {
    if (tierFilter && suite.tier !== tierFilter) {
      continue;
    }

    console.log(`\n${BOLD}[TIER ${suite.tier}] ${suite.name}${RESET}`);
    currentSuite = suite;
    await suite.fn();
  }

  const totalTime = Math.round(performance.now() - startTime);

  console.log(`\n${BOLD}${BLUE}======================================================================${RESET}`);
  console.log(`${BOLD}  TEST EXECUTION SUMMARY${RESET}`);
  console.log(`${BOLD}${BLUE}======================================================================${RESET}`);
  console.log(`  Duration:         ${totalTime} ms`);
  console.log(`  Total Tests:      ${results.total}`);
  console.log(`  ${GREEN}Passed Tests:     ${results.passed}${RESET}`);
  console.log(`  ${results.failed > 0 ? RED : GREEN}Failed Tests:     ${results.failed}${RESET}`);

  console.log(`\n${BOLD}  Tier Breakdown:${RESET}`);
  for (let t = 1; t <= 5; t++) {
    const s = results.tierStats[t];
    if (s && s.total > 0) {
      const color = s.failed === 0 ? GREEN : RED;
      console.log(`    Tier ${t}: ${color}${s.passed}/${s.total} passed${RESET}`);
    }
  }

  if (results.failures.length > 0) {
    console.log(`\n${BOLD}${RED}  FAILURES (${results.failures.length}):${RESET}`);
    results.failures.forEach((f, idx) => {
      console.log(`\n  ${idx + 1}) [Tier ${f.tier}] ${f.suite} > ${f.test}`);
      console.log(`     ${RED}${f.error.message}${RESET}`);
      if (f.error.stack) {
        console.log(`     ${f.error.stack.split("\n").slice(1, 4).join("\n     ")}`);
      }
    });
    console.log(`\n${BOLD}${RED}TEST SUITE FAILED${RESET}\n`);
    process.exitCode = 1;
  } else {
    console.log(`\n${BOLD}${GREEN}✔ ALL E2E TEST SUITES PASSED CLEANLY (100% Pass Rate)${RESET}\n`);
    process.exitCode = 0;
  }
}

// Execute runner if executed directly
if (process.argv[1].endsWith("runner.js")) {
  run().catch((err) => {
    console.error("Fatal runner error:", err);
    process.exitCode = 1;
  });
}
