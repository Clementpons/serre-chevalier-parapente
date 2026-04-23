"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  acomptePrice?: number | null;
  type: string;
  promotionOriginalPrice?: number | null;
}

interface AvailData {
  available: boolean;
  availablePlaces: number;
}

interface WeekEventSegment {
  stage: Stage;
  colStart: number;
  colEnd: number;
  isContinuation: boolean;
  continuesNext: boolean;
  rowIndex: number;
}

interface CalDay {
  date: Date;
  key: string;
  isPast: boolean;
  isOutOfMonth: boolean;
}

interface WeekData {
  days: CalDay[];
  events: WeekEventSegment[];
  maxRowIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

const TYPE_CONFIG: Record<string, {
  bgBar: string;
  bgLight: string;
  bgBarHex: string;
  label: string;
  textClass: string;
  dotClass: string;
}> = {
  INITIATION: {
    bgBar: "bg-sky-400",
    bgBarHex: "#38bdf8",
    bgLight: "bg-sky-50",
    label: "Initiation",
    textClass: "text-sky-600",
    dotClass: "bg-sky-400",
  },
  PROGRESSION: {
    bgBar: "bg-blue-500",
    bgBarHex: "#3b82f6",
    bgLight: "bg-blue-50",
    label: "Progression",
    textClass: "text-blue-700",
    dotClass: "bg-blue-500",
  },
  AUTONOMIE: {
    bgBar: "bg-blue-800",
    bgBarHex: "#1e40af",
    bgLight: "bg-blue-50",
    label: "Autonomie",
    textClass: "text-blue-900",
    dotClass: "bg-blue-800",
  },
  DOUBLE: {
    bgBar: "bg-violet-500",
    bgBarHex: "#8b5cf6",
    bgLight: "bg-violet-50",
    label: "Initiation + Progression",
    textClass: "text-violet-700",
    dotClass: "bg-violet-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDOWSun(date: Date): number {
  return date.getDay();
}

// ─── StageCalendarWidget ──────────────────────────────────────────────────────

function StageCalendarWidget({ onSlotSelect }: { onSlotSelect: (stage: Stage) => void }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipStage, setTooltipStage] = useState<{
    stage: Stage;
    avail: AvailData | null | undefined;
  } | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);

  const stageCache = useRef<Map<string, Stage[]>>(new Map());
  const isAutoNavigating = useRef(true);
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  // Fetch stages for current month (with cache + auto-navigate to first available)
  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cacheKey = `${year}-${month}`;

    if (stageCache.current.has(cacheKey)) {
      setLocalStages(stageCache.current.get(cacheKey)!);
      return;
    }

    const ctrl = new AbortController();
    setLoadingStages(true);

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];

    fetch(
      `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/stages?from=${from}&to=${to}&types=INITIATION,PROGRESSION,AUTONOMIE,DOUBLE`,
      { signal: ctrl.signal, headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" } },
    )
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const stages: Stage[] = data.data;
        stageCache.current.set(cacheKey, stages);
        setLocalStages(stages);

        if (isAutoNavigating.current) {
          const hasUpcoming = stages.some((s) => {
            const d = new Date(s.startDate);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          });
          if (!hasUpcoming) {
            const nextMonth = new Date(year, month + 1, 1);
            const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);
            if (nextMonth < maxDate) {
              setViewDate(nextMonth);
            } else {
              isAutoNavigating.current = false;
            }
          } else {
            isAutoNavigating.current = false;
          }
        }
      })
      .catch((err) => { if (err.name !== "AbortError") console.error(err); })
      .finally(() => setLoadingStages(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${viewDate.getFullYear()}-${viewDate.getMonth()}`]);

  const filteredStages = useMemo(() =>
    localStages
      .filter((s) => { const d = new Date(s.startDate); d.setHours(0, 0, 0, 0); return d >= today; })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
  [localStages, today]);

  // Batch-fetch availability
  const stagesKey = filteredStages.map((s) => s.id).join(",");
  useEffect(() => {
    if (filteredStages.length === 0) { setAvailabilityMap({}); return; }
    setLoadingAvail(true);
    const ctrl = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/check-batch`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
      body: JSON.stringify({ items: filteredStages.map((s) => ({ type: "stage", itemId: s.id })) }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setAvailabilityMap(data.data); })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagesKey]);

  // Build calendar days grid
  const calendarDays = useMemo((): CalDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const days: CalDay[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: false });
    }
    let nextDay = 1;
    while (days.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay++);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
    }
    return days;
  }, [viewDate, today]);

  // Group into weeks with event segments
  const weeksData = useMemo((): WeekData[] => {
    const chunks: (typeof calendarDays)[number][][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const weekSunday = new Date(weekDays[0].date);
      weekSunday.setDate(weekSunday.getDate() - getDOWSun(weekSunday));
      weekSunday.setHours(0, 0, 0, 0);
      const weekSaturday = new Date(weekSunday);
      weekSaturday.setDate(weekSaturday.getDate() + 6);
      weekSaturday.setHours(0, 0, 0, 0);

      const overlapping = filteredStages.filter((stage) => {
        const s = new Date(stage.startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(stage.startDate); e.setDate(e.getDate() + stage.duration - 1); e.setHours(0, 0, 0, 0);
        return e >= weekSunday && s <= weekSaturday;
      });

      const segments = overlapping.map((stage) => {
        const stageStart = new Date(stage.startDate); stageStart.setHours(0, 0, 0, 0);
        const stageEnd = new Date(stage.startDate); stageEnd.setDate(stageEnd.getDate() + stage.duration - 1); stageEnd.setHours(0, 0, 0, 0);
        const segStart = stageStart < weekSunday ? weekSunday : stageStart;
        const segEnd = stageEnd > weekSaturday ? weekSaturday : stageEnd;
        return {
          stage,
          colStart: getDOWSun(segStart) + 1,
          colEnd: getDOWSun(segEnd) + 1,
          isContinuation: stageStart < weekSunday,
          continuesNext: stageEnd > weekSaturday,
        };
      });

      segments.sort((a, b) => a.colStart - b.colStart || b.colEnd - b.colStart - (a.colEnd - a.colStart));

      const rows: number[] = [];
      for (let i = 0; i < segments.length; i++) {
        let row = 0;
        let conflict = true;
        while (conflict) {
          conflict = false;
          for (let j = 0; j < i; j++) {
            if (rows[j] === row && segments[j].colStart <= segments[i].colEnd && segments[j].colEnd >= segments[i].colStart) {
              conflict = true; break;
            }
          }
          if (conflict) row++;
        }
        rows.push(row);
      }

      const events: WeekEventSegment[] = segments.map((s, i) => ({ ...s, rowIndex: rows[i] }));
      const maxRowIndex = events.reduce((m, e) => Math.max(m, e.rowIndex), -1);
      return { days: weekDays, events, maxRowIndex };
    });
  }, [calendarDays, filteredStages]);

  const hasAnyStages = filteredStages.length > 0;
  const currentMonthHasStages = weeksData.some((w) => w.events.length > 0);

  return (
    <>
      <div className="relative space-y-3">
        {loadingStages && (
          <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-auto">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-slate-600 font-medium">Chargement…</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline" size="sm"
            onClick={() => { isAutoNavigating.current = false; setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-slate-800 capitalize">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
            {loadingAvail && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
          <Button
            variant="outline" size="sm"
            onClick={() => { isAutoNavigating.current = false; setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {DAY_NAMES.map((day, i) => (
              <div key={day} className={cn(
                "text-center text-xs font-semibold py-2 border-r border-slate-200 last:border-r-0",
                i === 0 ? "text-blue-800 bg-blue-100 font-bold" : "text-blue-600",
              )}>
                {day}
              </div>
            ))}
          </div>

          {weeksData.map((week, weekIdx) => (
            <div key={weekIdx} className="relative border-b border-slate-200 last:border-b-0">
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0">
                {week.days.map((day, di) => (
                  <div key={di} className={day.isOutOfMonth ? "bg-slate-200/70" : ""} />
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-slate-100">
                {week.days.map((day, di) => {
                  const isToday = day.key === todayKey;
                  return (
                    <div key={di} className={cn(
                      "text-right px-1.5 pt-1 pb-0.5 text-xs leading-none",
                      day.isOutOfMonth ? "text-slate-300" : day.isPast ? "text-slate-400" : "text-slate-600",
                      isToday ? "bg-blue-100 font-bold text-blue-700" : "",
                    )}>
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              <div
                className="relative z-[1] grid grid-cols-7 px-0 pb-1.5 pt-0.5"
                style={{
                  gridTemplateRows: `repeat(${Math.max(week.maxRowIndex + 1, 1)}, 24px)`,
                  rowGap: "3px",
                  minHeight: "40px",
                }}
              >
                {week.events.map((ev, ei) => {
                  const cfg = TYPE_CONFIG[ev.stage.type];
                  const hex = cfg?.bgBarHex ?? "#94a3b8";
                  const avail = availabilityMap[ev.stage.id];
                  const places = avail?.availablePlaces ?? ev.stage.places;
                  const isAvail = avail?.available ?? true;
                  const isHovered = hoveredStageId === ev.stage.id;
                  const isPromo = !!(ev.stage.promotionOriginalPrice && ev.stage.price < ev.stage.promotionOriginalPrice);

                  return (
                    <button
                      key={`${ev.stage.id}-${ei}`}
                      type="button"
                      onClick={() => { if (isAvail) onSlotSelect(ev.stage); }}
                      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                      onMouseEnter={() => { setHoveredStageId(ev.stage.id); setTooltipStage({ stage: ev.stage, avail: availabilityMap[ev.stage.id] }); }}
                      onMouseLeave={() => { setHoveredStageId(null); setTooltipStage(null); setMousePos(null); }}
                      style={{
                        gridColumn: `${ev.colStart} / ${ev.colEnd + 1}`,
                        gridRow: ev.rowIndex + 1,
                        backgroundColor: isHovered ? hex : `${hex}18`,
                        borderTop: `1.5px solid ${hex}`,
                        borderBottom: `1.5px solid ${hex}`,
                        borderLeft: ev.isContinuation ? "none" : `1.5px solid ${hex}`,
                        borderRight: ev.continuesNext ? "none" : `1.5px solid ${hex}`,
                        borderRadius: `${ev.isContinuation ? "0" : "4px"} ${ev.continuesNext ? "0" : "4px"} ${ev.continuesNext ? "0" : "4px"} ${ev.isContinuation ? "0" : "4px"}`,
                        color: isHovered ? "#ffffff" : hex,
                        outline: isHovered ? `2px solid ${hex}` : "none",
                        outlineOffset: "-1px",
                        marginLeft: ev.isContinuation ? "0" : "2px",
                        marginRight: ev.continuesNext ? "0" : "2px",
                        opacity: !isAvail ? 0.55 : 1,
                      }}
                      className="flex items-center overflow-hidden text-xs font-semibold transition-all duration-100 cursor-pointer select-none focus-visible:outline-none"
                    >
                      {!ev.isContinuation && (
                        <span className="truncate px-1.5 leading-none whitespace-nowrap">
                          {cfg?.label}
                          <span className="font-normal opacity-80">
                            {" - "}
                            {avail !== undefined && (
                              <span className="font-normal opacity-70">
                                {isAvail ? `${places} places` : "Complet"}
                              </span>
                            )}
                            {" · "}
                            {isPromo ? (
                              <>
                                <span style={{ textDecoration: "line-through", opacity: 0.6 }}>{ev.stage.promotionOriginalPrice}€</span>{" "}
                                {ev.stage.price}€
                              </>
                            ) : <>{ev.stage.price}€</>}
                          </span>
                          {isPromo && (
                            <span className="ml-1 inline-flex items-center font-bold text-white rounded shrink-0" style={{ backgroundColor: "#ef4444", fontSize: "8px", padding: "1px 3px" }}>
                              PROMO
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        {hasAnyStages && (() => {
          const usedTypes = [...new Set(filteredStages.map((s) => s.type))];
          return (
            <div className="flex flex-wrap gap-4 pt-1">
              {usedTypes.map((type) => {
                const cfg = TYPE_CONFIG[type];
                return cfg ? (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className={cn("inline-block w-4 h-2.5 rounded-sm shrink-0", cfg.bgBar)} />
                    <span className="text-xs text-slate-500">{cfg.label}</span>
                  </div>
                ) : null;
              })}
            </div>
          );
        })()}

        {!hasAnyStages && (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">Aucun créneau disponible pour le moment.</p>
          </div>
        )}
        {hasAnyStages && !currentMonthHasStages && (
          <p className="text-center text-sm text-slate-400 py-2">Aucun créneau ce mois — naviguez avec les flèches.</p>
        )}
      </div>

      {/* Tooltip portal */}
      {tooltipStage && mousePos && createPortal(
        <div
          style={{ position: "fixed", left: mousePos.x + 14, top: mousePos.y - 10, transform: "translateY(-100%)", zIndex: 9999, pointerEvents: "none" }}
          className="hidden sm:block bg-white border border-slate-200 shadow-xl rounded-xl max-w-[230px]"
        >
          <div className="p-3 space-y-2">
            {(() => {
              const s = tooltipStage.stage;
              const tcfg = TYPE_CONFIG[s.type];
              const thex = tcfg?.bgBarHex ?? "#94a3b8";
              const ta = tooltipStage.avail;
              const tPlaces = ta?.availablePlaces ?? s.places;
              const tAvail = ta?.available ?? true;
              const tPromo = s.promotionOriginalPrice && s.price < s.promotionOriginalPrice;
              const tStart = new Date(s.startDate);
              const tEnd = new Date(s.startDate);
              tEnd.setDate(tEnd.getDate() + s.duration - 1);
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: thex }} />
                    <span className="font-semibold text-sm text-slate-800">{tcfg?.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    {" → "}
                    {tEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-2">
                    {tPromo && <span className="text-xs text-slate-400 line-through">{s.promotionOriginalPrice}€</span>}
                    <span className="font-bold text-sm" style={{ color: thex }}>{s.price}€</span>
                    {tPromo && <span className="text-xs font-semibold text-red-500 bg-red-50 px-1 rounded">PROMO</span>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {ta === undefined ? "Chargement…" : tAvail ? `${tPlaces} place${tPlaces > 1 ? "s" : ""} disponible${tPlaces > 1 ? "s" : ""}` : "Complet"}
                  </p>
                </>
              );
            })()}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ─── Section Export ───────────────────────────────────────────────────────────

export function StageCalendarSection() {
  const router = useRouter();

  const handleSlotSelect = (stage: Stage) => {
    router.push(
      `/reserver/stage?stageId=${stage.id}&stageDate=${new Date(stage.startDate).toISOString().split("T")[0]}`,
    );
  };

  return (
    <section className="mx-4 my-16 lg:mx-36 xl:mx-64 2xl:mx-96">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          <h2 className="font-bold text-3xl text-slate-800">
            Créneaux disponibles
          </h2>
        </div>
        <p className="text-slate-500 max-w-xl mx-auto">
          Consultez les prochains stages disponibles et cliquez sur un créneau
          pour réserver directement.
        </p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-5">
          <StageCalendarWidget onSlotSelect={handleSlotSelect} />
        </CardContent>
      </Card>
    </section>
  );
}
