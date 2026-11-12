import { runTriageSafetyTests } from "../src/lib/triage-safety";

const report = runTriageSafetyTests();
console.log(`Triage safety: ${report.passed}/${report.total} passed`);
for (const r of report.results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(
    `  [${mark}] ${r.id}: expect=${r.expect} actual=${r.actual} — ${r.title}`,
  );
}
if (!report.allPass) process.exit(1);
