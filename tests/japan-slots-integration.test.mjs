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
  assert.match(routeSource, /JAPAN_SLOTS_EVENT/);
  assert.match(routeSource, /JAPAN_SLOTS_PLAN/);
  assert.match(routeSource, /JAPAN_SLOTS_CACHE_TTL_MIN_MS/);
  assert.match(routeSource, /JAPAN_SLOTS_CACHE_TTL_MAX_MS/);
  assert.doesNotMatch(routeSource, /searchParams\.get\("event"\)/);
  assert.doesNotMatch(routeSource, /searchParams\.get\("plan"\)/);
  assert.doesNotMatch(routeSource, /searchParams\.get\("force"\)/);
  assert.match(routeSource, /isBeforeYearMonth/);
  assert.match(routeSource, /past months are not available/);
  assert.match(routeSource, /MAX_MONTH_LOOKAHEAD/);
  assert.match(routeSource, /isAfterYearMonth/);
  assert.match(routeSource, /future months beyond the lookup window are not available/);
  assert.match(routeSource, /JAPAN_SLOTS_ENABLED/);
  assert.match(routeSource, /stale: true/);

  const slotsSource = fs.readFileSync(slotsComponent, "utf8");
  assert.match(slotsSource, /isCurrentMonth/);
  assert.match(slotsSource, /disabled=\{isCurrentMonth \|\| loading\}/);
  assert.match(slotsSource, /isLastAllowedMonth/);
  assert.match(slotsSource, /disabled=\{isLastAllowedMonth \|\| loading\}/);
  assert.doesNotMatch(slotsSource, /setInterval/);
  assert.doesNotMatch(slotsSource, /addEventListener\("focus"/);
  assert.doesNotMatch(slotsSource, /force/);
  assert.doesNotMatch(slotsSource, />\s*刷新\s*</);
  assert.match(slotsSource, /预约空位参考/);

  const checklistSource = fs.readFileSync(checklistPage, "utf8");
  assert.match(checklistSource, /import JapanSlots from "@\/components\/visa\/JapanSlots"/);
  assert.match(checklistSource, /page\.country === "日本" \? <JapanSlots \/> : null/);
});
