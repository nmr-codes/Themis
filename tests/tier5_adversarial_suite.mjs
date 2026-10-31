/**
 * Standalone Tier 5 Adversarial Hardening Suite Executable
 * Usage:
 *   node tests/tier5_adversarial_suite.mjs
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runnerPath = path.resolve(__dirname, "e2e/runner.js");
const child = spawn(process.execPath, [runnerPath, "--tier=5"], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
