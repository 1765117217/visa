import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

test("Japan slots API route and client component are wired into the Japan checklist page only", () => {
  const apiRoute = path.join(projectRoot, "app", "api", "japan-slots", "route.ts");
  const slotsComponent = path.join(projectRoot, "components", "visa", "JapanSlots.tsx");
  const checklistPage = path.join(projectRoot, "components", "visa", "VisaChecklistPage.tsx");

  assert.equal(fs.existsSync(apiRoute), true);
  assert.equal(fs.existsSync(slotsComponent), true);

  const routeSource = fs.readFileSync(apiRoute, "utf8");
  assert.match(routeSource, /event.*12/s);
  assert.match(routeSource, /plan.*22/s);
  assert.match(routeSource, /TTL\s*=\s*10\s*\*\s*60\s*\*\s*1000/);
  assert.match(routeSource, /isBeforeYearMonth/);
  assert.match(routeSource, /past months are not available/);
  assert.match(routeSource, /MAX_MONTH_LOOKAHEAD/);
  assert.match(routeSource, /isAfterYearMonth/);
  assert.match(routeSource, /future months beyond the lookup window are not available/);

  const slotsSource = fs.readFileSync(slotsComponent, "utf8");
  assert.match(slotsSource, /isCurrentMonth/);
  assert.match(slotsSource, /disabled=\{isCurrentMonth \|\| loading\}/);
  assert.match(slotsSource, /isLastAllowedMonth/);
  assert.match(slotsSource, /disabled=\{isLastAllowedMonth \|\| loading\}/);

  const checklistSource = fs.readFileSync(checklistPage, "utf8");
  assert.match(checklistSource, /import JapanSlots from "@\/components\/visa\/JapanSlots"/);
  assert.match(checklistSource, /page\.country === "日本" \? <JapanSlots \/> : null/);
});
