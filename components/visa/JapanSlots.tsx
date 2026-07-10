"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  MAX_MONTH_LOOKAHEAD,
  addMonthsToYearMonth,
  compareYearMonth,
  type DaySlot,
  type SlotStatus,
  type YearMonth
} from "@/lib/japanSlots";

interface SlotsResponse {
  month: string;
  event: number;
  plan: number;
  days: DaySlot[];
  nextAvailable: string | null;
  availableCount: number;
  fetchedAt?: number;
  cached?: boolean;
  stale?: boolean;
  error?: string;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const STATUS_META: Record<SlotStatus, { mark: string; label: string; className: string }> = {
  available: { mark: "○", label: "可约", className: "slots-day--open" },
  few: { mark: "△", label: "仅剩", className: "slots-day--few" },
  closed: { mark: "×", label: "已满", className: "slots-day--closed" }
};

function getCurrentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function shiftMonth(current: YearMonth, offset: number): YearMonth {
  return addMonthsToYearMonth(current, offset);
}

function formatMonth({ year, month }: YearMonth) {
  return `${year}年 ${month}月`;
}

function formatQueryMonth({ year, month }: YearMonth) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatUpdatedAt(timestamp: number | null | undefined) {
  if (!timestamp) return "尚未更新";
  return new Intl.DateTimeFormat("zh-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

function formatShortDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const weekday = WEEKDAYS[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()}（周${weekday}）`;
}

export default function JapanSlots() {
  const minYm = useMemo(() => getCurrentYearMonth(), []);
  const maxYm = useMemo(() => addMonthsToYearMonth(minYm, MAX_MONTH_LOOKAHEAD), [minYm]);
  const [ym, setYm] = useState<YearMonth>(() => getCurrentYearMonth());
  const [data, setData] = useState<SlotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isCurrentMonth = compareYearMonth(ym, minYm) === 0;
  const isLastAllowedMonth = compareYearMonth(ym, maxYm) === 0;

  const loadSlots = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ month: formatQueryMonth(ym) });
        const response = await fetch(`/api/japan-slots?${params.toString()}`, {
          cache: "no-store",
          signal
        });
        const payload = (await response.json()) as SlotsResponse;

        if (!response.ok) {
          throw new Error(payload.error || "无法读取预约空位");
        }

        setData(payload);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [ym]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadSlots(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadSlots]);

  const slotMap = useMemo(() => new Map((data?.days ?? []).map((day) => [day.day, day])), [data]);
  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(ym.year, ym.month - 1, 1).getDay();
    const daysInMonth = new Date(ym.year, ym.month, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, (_, index) => ({ type: "blank" as const, key: `blank-${index}` })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({
        type: "day" as const,
        key: `day-${index + 1}`,
        day: index + 1,
        slot: slotMap.get(index + 1)
      }))
    ];
  }, [slotMap, ym]);

  const fewDays = useMemo(() => (data?.days ?? []).filter((day) => day.status === "few"), [data]);
  const conclusion = data?.nextAvailable
    ? `最近可预约：${formatShortDate(data.nextAvailable)} · 本月 ${data.availableCount} 天可约`
    : "本月暂无开放的预约（大使馆尚未放号）";

  return (
    <section className="panel slots-panel" aria-labelledby="japan-slots-title">
      <div className="slots-head">
        <div>
          <p className="eyebrow">预约空位参考</p>
          <h2 id="japan-slots-title">日本签证代理代递交预约空位参考</h2>
        </div>
        <div className="slots-toolbar" aria-label="切换月份">
          <button className="mini-btn" type="button" onClick={() => setYm((current) => shiftMonth(current, -1))} aria-label="上一个月" disabled={isCurrentMonth || loading}>
            ‹
          </button>
          <strong>{formatMonth(ym)}</strong>
          <button className="mini-btn" type="button" onClick={() => setYm((current) => shiftMonth(current, 1))} aria-label="下一个月" disabled={isLastAllowedMonth || loading}>
            ›
          </button>
        </div>
      </div>

      <div className="slots-summary">
        <strong>{loading ? "正在读取预约空位..." : conclusion}</strong>
        {fewDays.length ? <span>仅剩少量名额：{fewDays.map((day) => formatShortDate(day.date)).join("、")}</span> : null}
        {data?.stale ? <span>当前显示的是上次缓存结果，请以官方预约系统为准。</span> : null}
      </div>

      <div className="slots-meta">
        <div className="slots-legend" aria-label="预约状态图例">
          <span><b>○</b>可约</span>
          <span><b>△</b>仅剩</span>
          <span><b>×</b>已满</span>
        </div>
        <div className="slots-refresh">
          <span>最后更新 {formatUpdatedAt(data?.fetchedAt)}</span>
        </div>
      </div>

      {error ? <div className="slots-empty">暂时无法读取官方预约系统，请稍后再试或前往官方预约页确认。</div> : null}

      <div className="slots-cal" aria-label={`${formatMonth(ym)}预约空位月历`}>
        {WEEKDAYS.map((weekday) => (
          <div className="slots-weekday" key={weekday}>
            {weekday}
          </div>
        ))}
        {calendarDays.map((item) => {
          if (item.type === "blank") {
            return <div className="slots-day slots-day--blank" aria-hidden="true" key={item.key} />;
          }

          const meta = item.slot ? STATUS_META[item.slot.status] : null;
          return (
            <div className={`slots-day ${meta?.className ?? "slots-day--muted"}`} key={item.key}>
              <span className="slots-date">{item.day}</span>
              <span className="slots-mark">{meta?.mark ?? "·"}</span>
              <span className="slots-label">{meta?.label ?? "—"}</span>
            </div>
          );
        })}
      </div>

      <p className="slots-note">空位仅供参考，最终以官方预约系统为准。签证预约通常需在预约日前 3 个工作日下午 3 点前完成。</p>
    </section>
  );
}
