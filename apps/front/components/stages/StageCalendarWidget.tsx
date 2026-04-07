"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Loader2, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  type: string;
  promotionOriginalPrice?: number | null;
}

interface AvailData {
  available: boolean;
  availablePlaces: number;
}

interface CalDay {
  date: Date;
  key: string;
  isPast: boolean;
  isOutOfMonth: boolean;
}

interface WeekEventSegment {
  stage: Stage;
  colStart: number;
  colEnd: number;
  isContinuation: boolean;
  continuesNext: boolean;
  rowIndex: number;
}

interface WeekData {
  days: CalDay[];
  events: WeekEventSegment[];
  maxRowIndex: number;
}

// ─── Constants — identical to /reserver/stage ─────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { bgBar: string; bgBarHex: string; label: string; bgLight: string; borderClass: string }
> = {
  INITIATION: {
    bgBar: "bg-sky-400",
    bgBarHex: "#38bdf8",
    bgLight: "bg-sky-50",
    borderClass: "border-sky-400",
    label: "Initiation",
  },
  PROGRESSION: {
    bgBar: "bg-blue-500",
    bgBarHex: "#3b82f6",
    bgLight: "bg-blue-50",
    borderClass: "border-blue-500",
    label: "Progression",
  },
  AUTONOMIE: {
    bgBar: "bg-blue-800",
    bgBarHex: "#1e40af",
    bgLight: "bg-blue-50",
    borderClass: "border-blue-800",
    label: "Autonomie",
  },
  DOUBLE: {
    bgBar: "bg-violet-500",
    bgBarHex: "#8b5cf6",
    bgLight: "bg-violet-50",
    borderClass: "border-violet-400",
    label: "Initiation + Progression",
  },
};

const DAY_NAMES = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const CTA_LABEL: Record<string, string> = {
  INITIATION:  "Réserver un stage Initiation",
  PROGRESSION: "Réserver un stage Progression",
  AUTONOMIE:   "Réserver un stage Autonomie",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDOWSun(d: Date) { return d.getDay(); }

// ─── Component ────────────────────────────────────────────────────────────────

export type StageType = "INITIATION" | "PROGRESSION" | "AUTONOMIE";

export default function StageCalendarWidget({ stageType }: { stageType: StageType }) {
  const router = useRouter();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [localStages, setLocalStages]     = useState<Stage[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingAvail, setLoadingAvail]   = useState(false);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipStage, setTooltipStage] = useState<{ stage: Stage; avail: AvailData | null | undefined } | null>(null);
  const [dialogStage, setDialogStage] = useState<Stage | null>(null);

  const stageCache = useRef<Map<string, Stage[]>>(new Map());
  const isAutoNavigating = useRef(true);

  const apiTypes = useMemo(() => {
    const t = [stageType];
    if (stageType === "INITIATION" || stageType === "PROGRESSION") t.push("DOUBLE");
    return t;
  }, [stageType]);

  // ── Fetch stages for current month ──────────────────────────────────────────
  useEffect(() => {
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const key   = `${year}-${month}-${stageType}`;

    if (stageCache.current.has(key)) { setLocalStages(stageCache.current.get(key)!); return; }

    const ctrl = new AbortController();
    setLoadingStages(true);

    const from   = new Date(year, month, 1).toISOString().split("T")[0];
    const to     = new Date(year, month + 1, 0).toISOString().split("T")[0];
    const params = new URLSearchParams({ from, to, types: apiTypes.join(",") });

    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/stages?${params}`, {
      signal: ctrl.signal,
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const stages: Stage[] = data.data;
        stageCache.current.set(key, stages);
        setLocalStages(stages);

        if (isAutoNavigating.current) {
          const hasUpcoming = stages.some((s) => { const d = new Date(s.startDate); d.setHours(0,0,0,0); return d >= today; });
          if (!hasUpcoming) {
            const next = new Date(year, month + 1, 1);
            if (next < new Date(today.getFullYear(), today.getMonth() + 12, 1)) setViewDate(next);
            else isAutoNavigating.current = false;
          } else {
            isAutoNavigating.current = false;
          }
        }
      })
      .catch((e) => { if (e.name !== "AbortError") console.error(e); })
      .finally(() => setLoadingStages(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${viewDate.getFullYear()}-${viewDate.getMonth()}`, stageType]);

  const filteredStages = useMemo(() =>
    localStages.filter((s) => { const d = new Date(s.startDate); d.setHours(0,0,0,0); return d >= today; })
               .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [localStages, today],
  );

  // ── Fetch availability batch ─────────────────────────────────────────────────
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

  // ── Calendar grid ────────────────────────────────────────────────────────────
  const calendarDays = useMemo((): CalDay[] => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const days: CalDay[] = [];
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i); d.setHours(0,0,0,0);
      days.push({ date: d, key: getDateKey(d), isPast: d < today, isOutOfMonth: true });
    }
    for (let n = 1; n <= lastDay.getDate(); n++) {
      const d = new Date(year, month, n); d.setHours(0,0,0,0);
      days.push({ date: d, key: getDateKey(d), isPast: d < today, isOutOfMonth: false });
    }
    let nx = 1;
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, nx++); d.setHours(0,0,0,0);
      days.push({ date: d, key: getDateKey(d), isPast: d < today, isOutOfMonth: true });
    }
    return days;
  }, [viewDate, today]);

  const weeksData = useMemo((): WeekData[] => {
    const chunks: CalDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const weekSunday = new Date(weekDays[0].date);
      weekSunday.setDate(weekSunday.getDate() - getDOWSun(weekSunday));
      weekSunday.setHours(0,0,0,0);
      const weekSaturday = new Date(weekSunday);
      weekSaturday.setDate(weekSaturday.getDate() + 6);
      weekSaturday.setHours(0,0,0,0);

      const overlapping = filteredStages.filter((s) => {
        const st = new Date(s.startDate); st.setHours(0,0,0,0);
        const en = new Date(s.startDate); en.setDate(en.getDate() + s.duration - 1); en.setHours(0,0,0,0);
        return en >= weekSunday && st <= weekSaturday;
      });

      let rowIdx = 0;
      const segments: WeekEventSegment[] = overlapping.map((stage) => {
        const st = new Date(stage.startDate); st.setHours(0,0,0,0);
        const en = new Date(stage.startDate); en.setDate(en.getDate() + stage.duration - 1); en.setHours(0,0,0,0);
        const segStart = st < weekSunday   ? weekSunday   : st;
        const segEnd   = en > weekSaturday ? weekSaturday : en;
        return {
          stage,
          colStart: getDOWSun(segStart) + 1,
          colEnd:   getDOWSun(segEnd)   + 1,
          isContinuation: st < weekSunday,
          continuesNext:  en > weekSaturday,
          rowIndex: rowIdx++,
        };
      });

      segments.sort((a, b) => a.colStart - b.colStart || (b.colEnd - b.colStart) - (a.colEnd - a.colStart));

      return { days: weekDays, events: segments, maxRowIndex: segments.length - 1 };
    });
  }, [calendarDays, filteredStages]);

  const hasAnyStages = filteredStages.length > 0;
  const currentMonthHasStages = weeksData.some((w) => w.events.length > 0);

  function navigate(delta: number) {
    isAutoNavigating.current = false;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[80vh]">

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base text-slate-800 capitalize">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h3>
          {(loadingStages || loadingAvail) && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-semibold py-2 border-r border-slate-200 last:border-r-0",
              i === 0 ? "text-blue-800 bg-blue-100 font-bold" : "text-blue-600",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="flex-1 flex flex-col overflow-hidden">
      {weeksData.map((week, weekIdx) => (
        <div key={weekIdx} className="relative flex-1 border-b border-slate-200 last:border-b-0">

          {/* Out-of-month overlay */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0">
            {week.days.map((day, di) => (
              <div key={di} className={day.isOutOfMonth ? "bg-slate-200/70" : ""} />
            ))}
          </div>

          {/* Date numbers */}
          <div className="grid grid-cols-7 divide-x divide-slate-100">
            {week.days.map((day, di) => (
              <div
                key={di}
                className={cn(
                  "text-right px-1.5 pt-3 pb-3 text-xs leading-none",
                  day.isOutOfMonth ? "text-slate-300" : day.isPast ? "text-slate-400" : "text-slate-600",
                  day.key === todayKey ? "bg-blue-100 font-bold text-blue-700" : "",
                )}
              >
                {day.date.getDate()}
              </div>
            ))}
          </div>

          {/* Event bars */}
          <div
            className="relative z-[1] grid grid-cols-7 px-0 pb-1.5 pt-0.5"
            style={{
              gridTemplateRows: `repeat(${Math.max(week.maxRowIndex + 1, 1)}, 24px)`,
              rowGap: "3px",
              minHeight: "40px",
            }}
          >
            {week.events.map((ev, ei) => {
              const cfg   = TYPE_CONFIG[ev.stage.type];
              const hex   = cfg?.bgBarHex ?? "#94a3b8";
              const avail = availabilityMap[ev.stage.id];
              const places  = avail?.availablePlaces ?? ev.stage.places;
              const isAvail = avail?.available ?? true;
              const isHovered = hoveredStageId === ev.stage.id;
              const isPromo = !!(ev.stage.promotionOriginalPrice && ev.stage.price < ev.stage.promotionOriginalPrice);

              const borderL  = ev.isContinuation ? "none" : `1.5px solid ${hex}`;
              const borderR  = ev.continuesNext  ? "none" : `1.5px solid ${hex}`;
              const borderTB = `1.5px solid ${hex}`;
              const radiusL  = ev.isContinuation ? "0" : "4px";
              const radiusR  = ev.continuesNext  ? "0" : "4px";

              return (
                <button
                  key={`${ev.stage.id}-${ei}`}
                  type="button"
                  onClick={() => setDialogStage(ev.stage)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                  onMouseEnter={() => {
                    setHoveredStageId(ev.stage.id);
                    setTooltipStage({ stage: ev.stage, avail: availabilityMap[ev.stage.id] });
                  }}
                  onMouseLeave={() => {
                    setHoveredStageId(null);
                    setTooltipStage(null);
                    setMousePos(null);
                  }}
                  style={{
                    gridColumn: `${ev.colStart} / ${ev.colEnd + 1}`,
                    gridRow: ev.rowIndex + 1,
                    backgroundColor: isHovered ? hex : `${hex}18`,
                    borderTop: borderTB,
                    borderBottom: borderTB,
                    borderLeft: borderL,
                    borderRight: borderR,
                    borderRadius: `${radiusL} ${radiusR} ${radiusR} ${radiusL}`,
                    color: isHovered ? "#ffffff" : hex,
                    outline: isHovered ? `2px solid ${hex}` : "none",
                    outlineOffset: "-1px",
                    marginLeft:  ev.isContinuation ? "0" : "2px",
                    marginRight: ev.continuesNext  ? "0" : "2px",
                    opacity: !isAvail ? 0.55 : 1,
                  }}
                  className="flex items-center overflow-hidden text-xs font-semibold transition-all duration-100 select-none cursor-pointer focus-visible:outline-none"
                >
                  {!ev.isContinuation && (
                    <span className="truncate px-1.5 leading-none whitespace-nowrap">
                      {cfg?.label}
                      {avail !== undefined && (
                        <span className="font-normal opacity-80">
                          {isAvail ? ` — ${places} place${places > 1 ? "s" : ""}` : " — Complet"}
                        </span>
                      )}
                      {isPromo && (
                        <span
                          className="ml-1 inline-flex items-center font-bold text-white rounded shrink-0"
                          style={{ backgroundColor: "#ef4444", fontSize: "8px", padding: "1px 3px" }}
                        >
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
      </div>{/* end weeks flex wrapper */}

      {/* Legend */}
      {hasAnyStages && (() => {
        const usedTypes = [...new Set(filteredStages.map((s) => s.type))];
        return (
          <div className="flex flex-wrap gap-4 px-4 pt-2 pb-1">
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

      {/* Empty states */}
      {!hasAnyStages && (
        <div className="text-center py-10">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">Aucun créneau disponible.</p>
        </div>
      )}
      {hasAnyStages && !currentMonthHasStages && (
        <p className="text-center text-sm text-slate-400 py-2 px-4">
          Aucun créneau ce mois — naviguez avec les flèches.
        </p>
      )}

      {/* Mouse-following tooltip portal */}
      {tooltipStage && mousePos && createPortal(
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 14,
            top: mousePos.y - 10,
            transform: "translateY(-100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
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
                    {tPromo && (
                      <span className="text-xs text-slate-400 line-through">{s.promotionOriginalPrice}€</span>
                    )}
                    <span className="font-bold text-sm" style={{ color: thex }}>{s.price}€</span>
                    {tPromo && (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-1 rounded">PROMO</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {ta === undefined
                      ? "Chargement…"
                      : tAvail
                      ? `${tPlaces} place${tPlaces > 1 ? "s" : ""} disponible${tPlaces > 1 ? "s" : ""}`
                      : "Complet"}
                  </p>
                </>
              );
            })()}
          </div>
        </div>,
        document.body,
      )}

      {/* Stage detail dialog */}
      <Dialog open={!!dialogStage} onOpenChange={(open) => { if (!open) setDialogStage(null); }}>
        <DialogContent className="sm:max-w-sm">
          {dialogStage && (() => {
            const cfg      = TYPE_CONFIG[dialogStage.type];
            const hex      = cfg?.bgBarHex ?? "#94a3b8";
            const avail    = availabilityMap[dialogStage.id];
            const places   = avail?.availablePlaces ?? dialogStage.places;
            const isAvail  = avail?.available ?? true;
            const isOnSale = !!(dialogStage.promotionOriginalPrice && dialogStage.price < dialogStage.promotionOriginalPrice);
            const endDate  = new Date(dialogStage.startDate);
            endDate.setDate(endDate.getDate() + dialogStage.duration - 1);
            const availLoading = avail === undefined;

            const effectiveType = dialogStage.type === "DOUBLE" ? stageType : dialogStage.type;
            const params = new URLSearchParams({
              stageId:   dialogStage.id,
              stageDate: dialogStage.startDate.split("T")[0],
              stageType: effectiveType,
            });

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {cfg && <span className={cn("inline-block w-3 h-3 rounded-sm shrink-0", cfg.bgBar)} />}
                    {cfg?.label ?? dialogStage.type}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    {new Date(dialogStage.startDate).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Fin du stage</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                      </p>
                      <p className="text-xs text-slate-400">{dialogStage.duration} jours</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-right">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Prix</p>
                      {isOnSale && (
                        <p className="text-xs text-slate-400 line-through">{dialogStage.promotionOriginalPrice}€</p>
                      )}
                      <p className="font-bold text-2xl text-blue-600">{dialogStage.price}€</p>
                      {isOnSale && <Badge variant="destructive" className="text-xs">PROMO</Badge>}
                    </div>
                  </div>

                  {/* Places */}
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    {availLoading ? (
                      <span className="text-sm text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Vérification des disponibilités…
                      </span>
                    ) : (
                      <Badge variant={isAvail ? "default" : "destructive"}>
                        {isAvail
                          ? `${places} place${places > 1 ? "s" : ""} disponible${places > 1 ? "s" : ""}`
                          : "Complet — aucune place disponible"}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDialogStage(null)} className="flex-1">
                      Retour
                    </Button>
                    <Button
                      disabled={!isAvail || availLoading}
                      className="flex-1 gap-2"
                      onClick={() => router.push(`/reserver/stage?${params.toString()}`)}
                    >
                      Choisir ce créneau
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
