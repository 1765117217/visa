import test from "node:test";
import assert from "node:assert/strict";

import {
  JAPAN_SLOTS_CACHE_TTL_MAX_MS,
  JAPAN_SLOTS_CACHE_TTL_MIN_MS,
  JAPAN_SLOTS_EVENT,
  JAPAN_SLOTS_PLAN,
  MAX_MONTH_LOOKAHEAD,
  addMonthsToYearMonth,
  compareYearMonth,
  getRandomCacheTtlMs,
  isAfterYearMonth,
  isBeforeYearMonth,
  parseMonth,
  summarize
} from "./japanSlots";

const monthHtml = `
  <table>
    <tr>
      <td>
        <div class="sc_cal_month_itemlist">
          <div class="sc_cal_date">13</div>
          <a href="#" class="c_cal_time_cell js_change_date js_change" data-date="2026/07/13">
            <img src="/assets/images/user/icon_cross.svg?1604042662" alt="受付終了／ Not available" />
          </a>
        </div>
      </td>
      <td>
        <div class="sc_cal_month_itemlist">
          <div class="sc_cal_date">15</div>
          <a href="#" class="c_cal_time_cell js_change_date js_change" data-date="2026/07/15">
            <img src="/assets/images/user/icon_circle.svg?1604042662" alt="受付終了／ Not available" />
          </a>
        </div>
      </td>
      <td>
        <div class="sc_cal_month_itemlist">
          <div class="sc_cal_date">16</div>
          <a href="#" class="c_cal_time_cell js_change_date js_change" data-date="2026/07/16">
            <img src="/assets/images/user/icon_triangle.svg?1604042662" alt="受付終了／ Not available" />
          </a>
        </div>
      </td>
      <td style="background: #E3E3E3;">
        <div class="sc_cal_month_itemlist">
          <div class="sc_cal_date">28</div>
        </div>
      </td>
    </tr>
  </table>
`;

test("parseMonth maps icon filenames to slot statuses and skips grey cells", () => {
  assert.deepEqual(parseMonth(monthHtml, 2026, 7), [
    { date: "2026-07-13", day: 13, status: "closed" },
    { date: "2026-07-15", day: 15, status: "available" },
    { date: "2026-07-16", day: 16, status: "few" }
  ]);
});

test("summarize returns the first bookable date and total bookable days", () => {
  assert.deepEqual(summarize(parseMonth(monthHtml, 2026, 7)), {
    nextAvailable: "2026-07-15",
    availableCount: 2
  });
});

test("compareYearMonth and isBeforeYearMonth identify months before the current lower bound", () => {
  assert.equal(compareYearMonth({ year: 2026, month: 6 }, { year: 2026, month: 7 }), -1);
  assert.equal(compareYearMonth({ year: 2026, month: 7 }, { year: 2026, month: 7 }), 0);
  assert.equal(compareYearMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 }), 1);

  assert.equal(isBeforeYearMonth({ year: 2026, month: 6 }, { year: 2026, month: 7 }), true);
  assert.equal(isBeforeYearMonth({ year: 2026, month: 7 }, { year: 2026, month: 7 }), false);
});

test("lookup window allows only the current month plus two future months", () => {
  const current = { year: 2026, month: 7 };
  const max = addMonthsToYearMonth(current, MAX_MONTH_LOOKAHEAD);

  assert.deepEqual(max, { year: 2026, month: 9 });
  assert.equal(isAfterYearMonth({ year: 2026, month: 9 }, max), false);
  assert.equal(isAfterYearMonth({ year: 2026, month: 10 }, max), true);
  assert.deepEqual(addMonthsToYearMonth({ year: 2026, month: 12 }, 2), { year: 2027, month: 2 });
});

test("Japan slots business line and random cache TTL are fixed within the risk window", () => {
  assert.equal(JAPAN_SLOTS_EVENT, 12);
  assert.equal(JAPAN_SLOTS_PLAN, 22);
  assert.equal(JAPAN_SLOTS_CACHE_TTL_MIN_MS, 15 * 60 * 1000);
  assert.equal(JAPAN_SLOTS_CACHE_TTL_MAX_MS, 60 * 60 * 1000);

  assert.equal(getRandomCacheTtlMs(() => 0), JAPAN_SLOTS_CACHE_TTL_MIN_MS);
  assert.equal(getRandomCacheTtlMs(() => 1), JAPAN_SLOTS_CACHE_TTL_MAX_MS);
  assert.equal(
    getRandomCacheTtlMs(() => 0.5),
    JAPAN_SLOTS_CACHE_TTL_MIN_MS + Math.round((JAPAN_SLOTS_CACHE_TTL_MAX_MS - JAPAN_SLOTS_CACHE_TTL_MIN_MS) * 0.5)
  );
});
