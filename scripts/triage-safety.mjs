/**
 * Run without a test runner: node scripts/triage-safety.mjs
 * Uses dynamic import of compiled path via next/tsx if available.
 */
import { createRequire } from "module";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const result = spawnSync(
  "npx",
  ["--yes", "tsx", join(root, "scripts/run-triage-safety.ts")],
  { cwd: root, encoding: "utf8", stdio: "inherit" },
);

process.exit(result.status ?? 1);
