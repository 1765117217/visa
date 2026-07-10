import { NextRequest, NextResponse } from "next/server";

import { isBeforeYearMonth, parseMonth, summarize, type YearMonth } from "@/lib/japanSlots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://malaysia.rsvsys.jp";
const CALENDAR_URL = `${BASE}/reservations/calendar`;
const AJAX_CALENDAR_URL = `${BASE}/ajax/reservations/calendar`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const TTL = 10 * 60 * 1000;
const cache = new Map<string, { data: JapanSlotsData; fetchedAt: number }>();

interface JapanSlotsData {
  days: ReturnType<typeof parseMonth>;
  nextAvailable: string | null;
  availableCount: number;
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

  return requestedMonth;
}

async function scrape(event: number, plan: number, year: number, month: number): Promise<JapanSlotsData> {
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
    event: String(event),
    plan: String(plan),
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

export async function GET(req: NextRequest) {
  try {
    const { year, month } = readMonthParam(req);
    const event = Number(req.nextUrl.searchParams.get("event") ?? 12);
    const plan = Number(req.nextUrl.searchParams.get("plan") ?? 22);
    const force = req.nextUrl.searchParams.get("force") === "1";
    const key = `${event}:${plan}:${year}-${month}`;
    const hit = cache.get(key);

    if (!force && hit && Date.now() - hit.fetchedAt < TTL) {
      return NextResponse.json({
        month: `${year}-${String(month).padStart(2, "0")}`,
        event,
        plan,
        ...hit.data,
        fetchedAt: hit.fetchedAt,
        cached: true
      });
    }

    const data = await scrape(event, plan, year, month);
    const fetchedAt = Date.now();
    cache.set(key, { data, fetchedAt });

    return NextResponse.json({
      month: `${year}-${String(month).padStart(2, "0")}`,
      event,
      plan,
      ...data,
      fetchedAt,
      cached: false
    });
  } catch (error) {
    const status = error instanceof BadRequestError ? 400 : 502;
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status });
  }
}
