import { NextRequest, NextResponse } from "next/server";

import {
  JAPAN_SLOTS_CACHE_TTL_MAX_MS,
  JAPAN_SLOTS_CACHE_TTL_MIN_MS,
  JAPAN_SLOTS_EVENT,
  JAPAN_SLOTS_PLAN,
  MAX_MONTH_LOOKAHEAD,
  addMonthsToYearMonth,
  getRandomCacheTtlMs,
  isAfterYearMonth,
  isBeforeYearMonth,
  parseMonth,
  summarize,
  type YearMonth
} from "@/lib/japanSlots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://malaysia.rsvsys.jp";
const CALENDAR_URL = `${BASE}/reservations/calendar`;
const AJAX_CALENDAR_URL = `${BASE}/ajax/reservations/calendar`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const FAILURE_RETRY_COOLDOWN_MS = 5 * 60 * 1000;
const cache = new Map<string, JapanSlotsCacheEntry>();

interface JapanSlotsData {
  days: ReturnType<typeof parseMonth>;
  nextAvailable: string | null;
  availableCount: number;
}

interface JapanSlotsCacheEntry {
  data?: JapanSlotsData;
  fetchedAt?: number;
  expiresAt?: number;
  lastAttemptAt?: number;
  lastError?: string;
}

class BadRequestError extends Error {}

function splitSetCookieHeader(value: string | null): string[] {
  if (!value) return [];
  return value.split(/,(?=\s*[^;,]+=)/);
}

function getCookieHeader(headers: Headers): string {
  const headersWithCookieList = headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = headersWithCookieList.getSetCookie?.() ?? splitSetCookieHeader(headers.get("set-cookie"));
  return setCookies.map((cookie) => cookie.split(";")[0]).join("; ");
}

function readMonthParam(req: NextRequest) {
  const now = new Date();
  const fallback = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const [year, month] = (req.nextUrl.searchParams.get("month") ?? fallback).split("-").map(Number);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new BadRequestError("invalid month, expected YYYY-MM");
  }

  const requestedMonth: YearMonth = { year, month };
  const currentMonth: YearMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };

  if (isBeforeYearMonth(requestedMonth, currentMonth)) {
    throw new BadRequestError("past months are not available");
  }

  const maxLookupMonth = addMonthsToYearMonth(currentMonth, MAX_MONTH_LOOKAHEAD);
  if (isAfterYearMonth(requestedMonth, maxLookupMonth)) {
    throw new BadRequestError("future months beyond the lookup window are not available");
  }

  return requestedMonth;
}

async function scrape(year: number, month: number): Promise<JapanSlotsData> {
  const initial = await fetch(CALENDAR_URL, {
    headers: { "User-Agent": UA },
    cache: "no-store"
  });
  const cookies = getCookieHeader(initial.headers);
  const initialHtml = await initial.text();
  const csrf = initialHtml.match(/name="_csrfToken"[^>]*value="([a-f0-9]+)"/)?.[1];

  if (!csrf) {
    throw new Error("no _csrfToken");
  }

  const body = new URLSearchParams({
    search: "exec",
    _csrfToken: csrf,
    event: String(JAPAN_SLOTS_EVENT),
    plan: String(JAPAN_SLOTS_PLAN),
    disp_type: "month",
    date: `${year}/${String(month).padStart(2, "0")}/01`
  });

  const calendar = await fetch(AJAX_CALENDAR_URL, {
    method: "POST",
    body,
    cache: "no-store",
    headers: {
      "User-Agent": UA,
      Cookie: cookies,
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-Token": csrf,
      Referer: CALENDAR_URL,
      Origin: BASE,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  if (!calendar.ok) {
    throw new Error(`calendar request failed: ${calendar.status}`);
  }

  const payload = (await calendar.json()) as { html?: string };
  const days = parseMonth(payload.html ?? "", year, month);
  return { days, ...summarize(days) };
}

function buildPayload(
  year: number,
  month: number,
  data: JapanSlotsData,
  meta: {
    fetchedAt: number;
    cached: boolean;
    stale?: boolean;
    error?: string;
  }
) {
  return {
    month: `${year}-${String(month).padStart(2, "0")}`,
    event: JAPAN_SLOTS_EVENT,
    plan: JAPAN_SLOTS_PLAN,
    ...data,
    fetchedAt: meta.fetchedAt,
    cached: meta.cached,
    stale: Boolean(meta.stale),
    error: meta.error
  };
}

function getCacheExpiresAt(fetchedAt: number): number {
  const ttl = Math.min(
    JAPAN_SLOTS_CACHE_TTL_MAX_MS,
    Math.max(JAPAN_SLOTS_CACHE_TTL_MIN_MS, getRandomCacheTtlMs())
  );
  return fetchedAt + ttl;
}

export async function GET(req: NextRequest) {
  try {
    if (process.env.JAPAN_SLOTS_ENABLED === "false") {
      return NextResponse.json(
        {
          enabled: false,
          error: "Japan slots lookup is temporarily disabled"
        },
        { status: 503 }
      );
    }

    const { year, month } = readMonthParam(req);
    const key = `${JAPAN_SLOTS_EVENT}:${JAPAN_SLOTS_PLAN}:${year}-${month}`;
    const hit = cache.get(key);
    const now = Date.now();

    if (hit?.data && hit.fetchedAt && hit.expiresAt && now < hit.expiresAt) {
      return NextResponse.json(
        buildPayload(year, month, hit.data, {
          fetchedAt: hit.fetchedAt,
          cached: true
        })
      );
    }

    if (hit?.lastAttemptAt && now - hit.lastAttemptAt < FAILURE_RETRY_COOLDOWN_MS) {
      if (hit.data && hit.fetchedAt) {
        return NextResponse.json(
          buildPayload(year, month, hit.data, {
            fetchedAt: hit.fetchedAt,
            cached: true,
            stale: true,
            error: hit.lastError
          })
        );
      }

      return NextResponse.json(
        {
          error: hit.lastError || "Japan slots lookup is cooling down after a failed attempt"
        },
        { status: 503 }
      );
    }

    const attemptedAt = Date.now();

    try {
      const data = await scrape(year, month);
      const fetchedAt = Date.now();
      cache.set(key, {
        data,
        fetchedAt,
        expiresAt: getCacheExpiresAt(fetchedAt),
        lastAttemptAt: attemptedAt
      });

      return NextResponse.json(
        buildPayload(year, month, data, {
          fetchedAt,
          cached: false
        })
      );
    } catch (scrapeError) {
      const message = scrapeError instanceof Error ? scrapeError.message : String(scrapeError);
      cache.set(key, {
        ...hit,
        lastAttemptAt: attemptedAt,
        lastError: message
      });

      if (hit?.data && hit.fetchedAt) {
        return NextResponse.json(
          buildPayload(year, month, hit.data, {
            fetchedAt: hit.fetchedAt,
            cached: true,
            stale: true,
            error: message
          })
        );
      }

      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    const status = error instanceof BadRequestError ? 400 : 502;
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status });
  }
}
