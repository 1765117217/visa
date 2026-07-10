export type SlotStatus = "available" | "few" | "closed";

export interface DaySlot {
  date: string;
  day: number;
  status: SlotStatus;
}

export interface YearMonth {
  year: number;
  month: number;
}

export const JAPAN_SLOTS_EVENT = 12;
export const JAPAN_SLOTS_PLAN = 22;
export const JAPAN_SLOTS_CACHE_TTL_MIN_MS = 15 * 60 * 1000;
export const JAPAN_SLOTS_CACHE_TTL_MAX_MS = 60 * 60 * 1000;
export const MAX_MONTH_LOOKAHEAD = 2;

export const ICON_STATUS: Record<string, SlotStatus> = {
  icon_circle: "available",
  icon_triangle: "few",
  icon_disabled: "closed",
  icon_cross: "closed"
};

const CELL_RE = /<td\b([^>]*)>(.*?)<\/td>/gs;
const DAY_RE = /class="sc_cal_date[^"]*"[^>]*>(?:<a[^>]*>)?\s*(\d{1,2})/;
const ICON_RE = /icon_(\w+)\.svg/;

export function parseMonth(html: string, year: number, month: number): DaySlot[] {
  const days: DaySlot[] = [];

  for (const [, attrs, body] of html.matchAll(CELL_RE)) {
    if (attrs.includes("#E3E3E3")) continue;

    const dayMatch = DAY_RE.exec(body);
    const iconMatch = ICON_RE.exec(body);
    if (!dayMatch || !iconMatch) continue;

    const day = Number(dayMatch[1]);
    days.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
      status: ICON_STATUS[`icon_${iconMatch[1]}`] ?? "closed"
    });
  }

  return days;
}

export function summarize(days: DaySlot[]) {
  const open = days.filter((day) => day.status === "available" || day.status === "few");

  return {
    nextAvailable: open[0]?.date ?? null,
    availableCount: open.length
  };
}

export function compareYearMonth(left: YearMonth, right: YearMonth): -1 | 0 | 1 {
  const leftValue = left.year * 12 + left.month;
  const rightValue = right.year * 12 + right.month;

  if (leftValue < rightValue) return -1;
  if (leftValue > rightValue) return 1;
  return 0;
}

export function isBeforeYearMonth(value: YearMonth, lowerBound: YearMonth): boolean {
  return compareYearMonth(value, lowerBound) === -1;
}

export function isAfterYearMonth(value: YearMonth, upperBound: YearMonth): boolean {
  return compareYearMonth(value, upperBound) === 1;
}

export function addMonthsToYearMonth(value: YearMonth, offset: number): YearMonth {
  const date = new Date(value.year, value.month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function getRandomCacheTtlMs(random = Math.random): number {
  const range = JAPAN_SLOTS_CACHE_TTL_MAX_MS - JAPAN_SLOTS_CACHE_TTL_MIN_MS;
  return JAPAN_SLOTS_CACHE_TTL_MIN_MS + Math.round(range * random());
}
