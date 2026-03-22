"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Gift,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Users,
  ShoppingCart,
} from "lucide-react";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoucherInfo {
  code: string;
  productType: "STAGE" | "BAPTEME";
  stageCategory: string | null;
  baptemeCategory: string | null;
  recipientName: string;
  expiryDate: string;
}

interface StageSlot {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  availablePlaces: number;
  price: number;
  type: string;
  promotionOriginalPrice: number | null;
}

interface BaptemeSlot {
  id: string;
  date: string;
  duration: number;
  places: number;
  availablePlaces: number;
  categories: string[];
}

interface ParticipantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  INITIATION: "Stage Initiation",
  PROGRESSION: "Stage Progression",
  AUTONOMIE: "Stage Autonomie",
  DOUBLE: "Stage Double",
};

const BAPTEME_LABELS: Record<string, string> = {
  AVENTURE: "Baptême Aventure",
  DUREE: "Baptême Durée",
  LONGUE_DUREE: "Baptême Longue Durée",
  ENFANT: "Baptême Enfant",
  HIVER: "Baptême Hiver",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Calendar constants ───────────────────────────────────────────────────────

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAY_NAMES = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

const STAGE_TYPE_CONFIG: Record<string, { bgBar: string; bgBarHex: string; label: string }> = {
  INITIATION: { bgBar: "bg-sky-400",   bgBarHex: "#38bdf8", label: "Initiation" },
  PROGRESSION: { bgBar: "bg-blue-500", bgBarHex: "#3b82f6", label: "Progression" },
  AUTONOMIE:   { bgBar: "bg-blue-800", bgBarHex: "#1e40af", label: "Autonomie" },
  DOUBLE:      { bgBar: "bg-violet-500", bgBarHex: "#8b5cf6", label: "Initiation + Progression" },
};

const BAPTEME_CAT_CONFIG: Record<string, { bgBar: string; bgBarHex: string; label: string; shortLabel: string; durationLabel: string }> = {
  AVENTURE:     { bgBar: "bg-orange-400", bgBarHex: "#fb923c", label: "Baptême Aventure",     shortLabel: "Aventure",   durationLabel: "15 min" },
  DUREE:        { bgBar: "bg-sky-500",    bgBarHex: "#0ea5e9", label: "Baptême Durée",         shortLabel: "Durée",      durationLabel: "30 min" },
  LONGUE_DUREE: { bgBar: "bg-blue-600",   bgBarHex: "#2563eb", label: "Longue Durée",          shortLabel: "L. Durée",   durationLabel: "45 min" },
  ENFANT:       { bgBar: "bg-emerald-500",bgBarHex: "#10b981", label: "Baptême Enfant",        shortLabel: "Enfant",     durationLabel: "10 min" },
  HIVER:        { bgBar: "bg-violet-600", bgBarHex: "#7c3aed", label: "Baptême Hiver",         shortLabel: "Hiver",      durationLabel: "~30-45 min" },
};

interface AvailData {
  available: boolean;
  availablePlaces: number;
}

interface WeekEventSegment {
  stage: StageSlot;
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

interface StageWeekData {
  days: CalDay[];
  events: WeekEventSegment[];
  maxRowIndex: number;
}

interface BaptemeCalSlot {
  bapteme: BaptemeSlot;
  col: number;
  rowIndex: number;
  primaryCategory: string;
}

interface BaptemeWeekData {
  days: CalDay[];
  slots: BaptemeCalSlot[];
  maxRowIndex: number;
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
}

function getDOWMon(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function buildCalendarDays(viewDate: Date, today: Date): CalDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const days: CalDay[] = [];
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    date.setHours(0,0,0,0);
    days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    date.setHours(0,0,0,0);
    days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: false });
  }
  let nextDay = 1;
  while (days.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextDay++);
    date.setHours(0,0,0,0);
    days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
  }
  return days;
}

// ─── VoucherStageCalendar ─────────────────────────────────────────────────────

function VoucherStageCalendar({
  stages,
  selectedSlot,
  onSlotSelect,
}: {
  stages: StageSlot[];
  selectedSlot: StageSlot | null;
  onSlotSelect: (s: StageSlot) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [dialogStage, setDialogStage] = useState<StageSlot | null>(null);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipStage, setTooltipStage] = useState<{
    stage: StageSlot;
    avail: AvailData | null | undefined;
  } | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Filter to stages that overlap the current view month and are in the future
  const filteredStages = useMemo(() => {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const lastOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return stages
      .filter((s) => {
        const start = new Date(s.startDate);
        start.setHours(0, 0, 0, 0);
        // Stage end = start + duration - 1 days
        const end = new Date(start);
        end.setDate(end.getDate() + (s.duration ?? 1) - 1);
        end.setHours(23, 59, 59, 999);
        return start >= today && start <= lastOfMonth && end >= firstOfMonth;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [stages, today, viewDate]);

  // Batch-fetch availability
  const stagesKey = filteredStages.map((s) => s.id).join(",");
  useEffect(() => {
    if (filteredStages.length === 0) {
      setAvailabilityMap({});
      return;
    }
    setLoadingAvail(true);
    const ctrl = new AbortController();

    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/check-batch`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({ items: filteredStages.map((s) => ({ type: "stage", itemId: s.id })) }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setAvailabilityMap(data.data); })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagesKey]);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate, today), [viewDate, today]);

  const weeksData = useMemo((): StageWeekData[] => {
    const chunks: CalDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const weekMonday = new Date(weekDays[0].date);
      weekMonday.setDate(weekMonday.getDate() - getDOWMon(weekMonday));
      weekMonday.setHours(0, 0, 0, 0);
      const weekSunday = new Date(weekMonday);
      weekSunday.setDate(weekSunday.getDate() + 6);
      weekSunday.setHours(0, 0, 0, 0);

      const overlapping = filteredStages.filter((stage) => {
        const s = new Date(stage.startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(stage.startDate); e.setDate(e.getDate() + stage.duration - 1); e.setHours(0, 0, 0, 0);
        return e >= weekMonday && s <= weekSunday;
      });

      const segments = overlapping.map((stage) => {
        const stageStart = new Date(stage.startDate); stageStart.setHours(0, 0, 0, 0);
        const stageEnd = new Date(stage.startDate); stageEnd.setDate(stageEnd.getDate() + stage.duration - 1); stageEnd.setHours(0, 0, 0, 0);

        const segStart = stageStart < weekMonday ? weekMonday : stageStart;
        const segEnd   = stageEnd   > weekSunday ? weekSunday : stageEnd;

        return {
          stage,
          colStart: getDOWMon(segStart) + 1,
          colEnd:   getDOWMon(segEnd)   + 1,
          isContinuation: stageStart < weekMonday,
          continuesNext:  stageEnd   > weekSunday,
        };
      });

      segments.sort((a, b) =>
        a.colStart - b.colStart || (b.colEnd - b.colStart) - (a.colEnd - a.colStart),
      );

      const rows: number[] = [];
      for (let i = 0; i < segments.length; i++) {
        let row = 0;
        let conflict = true;
        while (conflict) {
          conflict = false;
          for (let j = 0; j < i; j++) {
            if (
              rows[j] === row &&
              segments[j].colStart <= segments[i].colEnd &&
              segments[j].colEnd   >= segments[i].colStart
            ) { conflict = true; break; }
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
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
            variant="outline"
            size="sm"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">

          {/* Day-name header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-blue-600 py-2 border-r border-slate-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeksData.map((week, weekIdx) => (
            <div key={weekIdx} className="relative border-b border-slate-200 last:border-b-0">

              {/* Out-of-month dim overlay */}
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-[5]">
                {week.days.map((day, di) => (
                  <div key={di} className={day.isOutOfMonth ? "bg-slate-200/70" : ""} />
                ))}
              </div>

              {/* Date numbers */}
              <div className="grid grid-cols-7 divide-x divide-slate-100">
                {week.days.map((day, di) => {
                  const isToday = day.key === todayKey;
                  const isSelected = selectedSlot && getDateKey(new Date(selectedSlot.startDate)) === day.key;
                  return (
                    <div
                      key={di}
                      className={cn(
                        "text-right px-1.5 pt-1 pb-0.5 text-xs leading-none",
                        day.isOutOfMonth
                          ? "text-slate-300"
                          : day.isPast
                          ? "text-slate-400"
                          : "text-slate-600",
                        isToday ? "bg-blue-100 font-bold text-blue-700" : "",
                        isSelected && !day.isOutOfMonth ? "bg-green-50" : "",
                      )}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              {/* Event bars */}
              <div
                className="grid grid-cols-7 px-0 pb-1.5 pt-0.5"
                style={{
                  gridTemplateRows: `repeat(${Math.max(week.maxRowIndex + 1, 1)}, 24px)`,
                  rowGap: "3px",
                  minHeight: "40px",
                }}
              >
                {week.events.map((ev, ei) => {
                  const cfg = STAGE_TYPE_CONFIG[ev.stage.type];
                  const hex = cfg?.bgBarHex ?? "#94a3b8";
                  const avail = availabilityMap[ev.stage.id];
                  const places = avail?.availablePlaces ?? ev.stage.places;
                  const isAvail = avail?.available ?? true;
                  const isSelected = selectedSlot?.id === ev.stage.id;
                  const isHovered = hoveredStageId === ev.stage.id;

                  const borderL = ev.isContinuation ? "none" : `1.5px solid ${hex}`;
                  const borderR = ev.continuesNext  ? "none" : `1.5px solid ${hex}`;
                  const borderTB = `1.5px solid ${hex}`;
                  const radiusL = ev.isContinuation ? "0" : "4px";
                  const radiusR = ev.continuesNext  ? "0" : "4px";

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
                        backgroundColor: isHovered || isSelected ? hex : `${hex}18`,
                        borderTop: borderTB,
                        borderBottom: borderTB,
                        borderLeft: borderL,
                        borderRight: borderR,
                        borderRadius: `${radiusL} ${radiusR} ${radiusR} ${radiusL}`,
                        color: isHovered || isSelected ? "#ffffff" : hex,
                        outline: isHovered || isSelected ? `2px solid ${hex}` : "none",
                        outlineOffset: "-1px",
                        marginLeft: ev.isContinuation ? "0" : "2px",
                        marginRight: ev.continuesNext  ? "0" : "2px",
                        opacity: !isAvail ? 0.55 : 1,
                      }}
                      className={cn(
                        "flex items-center overflow-hidden text-xs font-semibold",
                        "transition-all duration-100 cursor-pointer select-none",
                        "focus-visible:outline-none",
                      )}
                    >
                      {!ev.isContinuation && (
                        <span className="truncate px-1.5 leading-none whitespace-nowrap">
                          {cfg?.label}
                          {avail !== undefined && (
                            <span className="font-normal opacity-80">
                              {isAvail
                                ? ` — ${places} place${places > 1 ? "s" : ""}`
                                : " — Complet"}
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
                const cfg = STAGE_TYPE_CONFIG[type];
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
            <p className="text-slate-500 text-sm">Aucun créneau disponible pour le moment.</p>
          </div>
        )}
        {hasAnyStages && !currentMonthHasStages && (
          <p className="text-center text-sm text-slate-400 py-2">
            Aucun créneau ce mois — naviguez avec les flèches.
          </p>
        )}
      </div>

      {/* Stage detail dialog */}
      <Dialog open={!!dialogStage} onOpenChange={(open) => { if (!open) setDialogStage(null); }}>
        <DialogContent className="sm:max-w-sm">
          {dialogStage && (() => {
            const cfg = STAGE_TYPE_CONFIG[dialogStage.type];
            const avail = availabilityMap[dialogStage.id];
            const isAvailable = avail?.available ?? true;
            const availablePlaces = avail?.availablePlaces ?? dialogStage.places;
            const availLoading = avail === undefined;
            const endDate = new Date(dialogStage.startDate);
            endDate.setDate(endDate.getDate() + dialogStage.duration - 1);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {cfg && <span className={cn("inline-block w-3 h-3 rounded-sm shrink-0", cfg.bgBar)} />}
                    {cfg?.label ?? dialogStage.type}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    {formatDateFull(dialogStage.startDate)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Fin du stage</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                      </p>
                      <p className="text-xs text-slate-400">{dialogStage.duration} jours</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Durée</p>
                      <p className="text-sm font-semibold text-slate-800">{dialogStage.duration} jours</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    {availLoading ? (
                      <span className="text-sm text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Vérification des disponibilités…
                      </span>
                    ) : (
                      <Badge variant={isAvailable ? "default" : "destructive"}>
                        {isAvailable
                          ? `${availablePlaces} place${availablePlaces > 1 ? "s" : ""} disponible${availablePlaces > 1 ? "s" : ""}`
                          : "Complet — aucune place disponible"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDialogStage(null)} className="flex-1">
                      Retour
                    </Button>
                    <Button
                      onClick={() => { onSlotSelect(dialogStage); setDialogStage(null); }}
                      disabled={!isAvailable || availLoading}
                      className="flex-1 gap-2"
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
          className="bg-white border border-slate-200 shadow-xl rounded-xl max-w-[230px]"
        >
          <div className="p-3 space-y-2">
            {(() => {
              const s = tooltipStage.stage;
              const tcfg = STAGE_TYPE_CONFIG[s.type];
              const thex = tcfg?.bgBarHex ?? "#94a3b8";
              const ta = tooltipStage.avail;
              const tPlaces = ta?.availablePlaces ?? s.places;
              const tAvail = ta?.available ?? true;
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
    </>
  );
}

// ─── VoucherBaptemeCalendar ───────────────────────────────────────────────────

function VoucherBaptemeCalendar({
  baptemes,
  fixedCategory,
  selectedSlot,
  onSlotSelect,
}: {
  baptemes: BaptemeSlot[];
  fixedCategory: string;
  selectedSlot: BaptemeSlot | null;
  onSlotSelect: (b: BaptemeSlot) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [dialogBapteme, setDialogBapteme] = useState<BaptemeSlot | null>(null);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    bapteme: BaptemeSlot;
    avail: AvailData | null | undefined;
    primaryCategory: string;
  } | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Filter to baptemes in the current view month matching the fixed category
  const filteredBaptemes = useMemo(() => {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const lastOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return baptemes.filter((b) => {
      const d = new Date(b.date);
      d.setHours(0, 0, 0, 0);
      return d >= today && d >= firstOfMonth && d <= lastOfMonth && b.categories.includes(fixedCategory);
    });
  }, [baptemes, fixedCategory, today, viewDate]);

  // Batch availability check
  const baptemesKey = filteredBaptemes.map((b) => b.id).join(",");
  useEffect(() => {
    if (filteredBaptemes.length === 0) {
      setAvailabilityMap({});
      return;
    }
    setLoadingAvail(true);
    const ctrl = new AbortController();

    fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/check-batch`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({ items: filteredBaptemes.map((b) => ({ type: "bapteme", itemId: b.id })) }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setAvailabilityMap(data.data); })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baptemesKey]);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate, today), [viewDate, today]);

  const weeksData = useMemo((): BaptemeWeekData[] => {
    const chunks: CalDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const colMap = new Map<string, number>();
      weekDays.forEach((d, i) => colMap.set(d.key, i + 1));

      const weekBaptemes = filteredBaptemes.filter((b) => {
        const bDate = new Date(b.date);
        bDate.setHours(0, 0, 0, 0);
        return colMap.has(getDateKey(bDate));
      });

      weekBaptemes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const colRowUsage = new Map<number, number>();
      const slots: BaptemeCalSlot[] = [];
      for (const b of weekBaptemes) {
        const bDate = new Date(b.date);
        bDate.setHours(0, 0, 0, 0);
        const col = colMap.get(getDateKey(bDate)) ?? 1;
        const currentRow = colRowUsage.get(col) ?? 0;
        colRowUsage.set(col, currentRow + 1);
        slots.push({ bapteme: b, col, rowIndex: currentRow, primaryCategory: fixedCategory });
      }

      const maxRowIndex = slots.reduce((m, s) => Math.max(m, s.rowIndex), -1);
      return { days: weekDays, slots, maxRowIndex };
    });
  }, [calendarDays, filteredBaptemes, fixedCategory]);

  const hasAnyBaptemes = filteredBaptemes.length > 0;
  const currentMonthHasBaptemes = weeksData.some((w) => w.slots.length > 0);
  const cfg = BAPTEME_CAT_CONFIG[fixedCategory];

  return (
    <>
      <div className="relative space-y-3">

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
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
            variant="outline"
            size="sm"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">

          {/* Day-name header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-blue-600 py-2 border-r border-slate-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeksData.map((week, weekIdx) => (
            <div key={weekIdx} className="relative border-b border-slate-200 last:border-b-0">

              {/* Out-of-month dim overlay */}
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-[5]">
                {week.days.map((day, di) => (
                  <div key={di} className={day.isOutOfMonth ? "bg-slate-200/70" : ""} />
                ))}
              </div>

              {/* Date numbers */}
              <div className="grid grid-cols-7 divide-x divide-slate-100">
                {week.days.map((day, di) => {
                  const isToday = day.key === todayKey;
                  const isSelected = selectedSlot && getDateKey(new Date(selectedSlot.date)) === day.key;
                  return (
                    <div
                      key={di}
                      className={cn(
                        "text-right px-1.5 pt-1 pb-0.5 text-xs leading-none",
                        day.isOutOfMonth
                          ? "text-slate-300"
                          : day.isPast
                          ? "text-slate-400"
                          : "text-slate-600",
                        isToday ? "bg-blue-100 font-bold text-blue-700" : "",
                        isSelected && !day.isOutOfMonth ? "bg-green-50" : "",
                      )}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              {/* Event bars */}
              <div
                className="grid grid-cols-7 px-0 pb-1.5 pt-0.5"
                style={{
                  gridTemplateRows: `repeat(${Math.max(week.maxRowIndex + 1, 1)}, 24px)`,
                  rowGap: "3px",
                  minHeight: "40px",
                }}
              >
                {week.slots.map((slot, si) => {
                  const slotCfg = BAPTEME_CAT_CONFIG[slot.primaryCategory];
                  const hex = slotCfg?.bgBarHex ?? "#94a3b8";
                  const avail = availabilityMap[slot.bapteme.id];
                  const places = avail?.availablePlaces ?? slot.bapteme.availablePlaces;
                  const isAvail = avail?.available ?? (slot.bapteme.availablePlaces > 0);
                  const isSelected = selectedSlot?.id === slot.bapteme.id;
                  const slotKey = `${slot.bapteme.id}-${slot.primaryCategory}`;
                  const isHovered = hoveredSlotKey === slotKey;

                  return (
                    <button
                      key={`${slot.bapteme.id}-${si}`}
                      type="button"
                      onClick={() => setDialogBapteme(slot.bapteme)}
                      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                      onMouseEnter={() => {
                        setHoveredSlotKey(slotKey);
                        setTooltipData({
                          bapteme: slot.bapteme,
                          avail: availabilityMap[slot.bapteme.id],
                          primaryCategory: slot.primaryCategory,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredSlotKey(null);
                        setTooltipData(null);
                        setMousePos(null);
                      }}
                      style={{
                        gridColumn: `${slot.col} / ${slot.col + 1}`,
                        gridRow: slot.rowIndex + 1,
                        backgroundColor: isHovered || isSelected ? hex : `${hex}18`,
                        border: `1.5px solid ${hex}`,
                        borderRadius: "4px",
                        color: isHovered || isSelected ? "#ffffff" : hex,
                        outline: isHovered || isSelected ? `2px solid ${hex}` : "none",
                        outlineOffset: "-1px",
                        marginLeft: "2px",
                        marginRight: "2px",
                        opacity: !isAvail ? 0.55 : 1,
                      }}
                      className={cn(
                        "flex items-center overflow-hidden text-xs font-semibold",
                        "transition-all duration-100 cursor-pointer select-none",
                        "focus-visible:outline-none",
                      )}
                    >
                      <span className="truncate px-1.5 leading-none whitespace-nowrap">
                        {slotCfg?.shortLabel ?? slot.primaryCategory}
                        {" "}
                        <span className="font-normal opacity-70">{formatTime(slot.bapteme.date)}</span>
                        {avail !== undefined && (
                          <span className="font-normal opacity-80">
                            {isAvail ? ` — ${places}p` : " — Complet"}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        {hasAnyBaptemes && cfg && (
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <span className={cn("inline-block w-4 h-2.5 rounded-sm shrink-0", cfg.bgBar)} />
              <span className="text-xs text-slate-500">{cfg.shortLabel}</span>
            </div>
          </div>
        )}

        {/* Empty states */}
        {!hasAnyBaptemes && (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">Aucun créneau disponible pour le moment.</p>
          </div>
        )}
        {hasAnyBaptemes && !currentMonthHasBaptemes && (
          <p className="text-center text-sm text-slate-400 py-2">
            Aucun créneau ce mois — naviguez avec les flèches.
          </p>
        )}
      </div>

      {/* Bapteme detail dialog */}
      <Dialog open={!!dialogBapteme} onOpenChange={(open) => { if (!open) setDialogBapteme(null); }}>
        <DialogContent className="sm:max-w-sm">
          {dialogBapteme && (() => {
            const bCfg = BAPTEME_CAT_CONFIG[fixedCategory];
            const avail = availabilityMap[dialogBapteme.id];
            const isAvailable = avail?.available ?? (dialogBapteme.availablePlaces > 0);
            const availablePlaces = avail?.availablePlaces ?? dialogBapteme.availablePlaces;
            const availLoading = avail === undefined;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {bCfg && <span className={cn("inline-block w-3 h-3 rounded-sm shrink-0", bCfg.bgBar)} />}
                    {bCfg?.label ?? fixedCategory}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    {formatDateFull(dialogBapteme.date)} à {formatTime(dialogBapteme.date)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Durée de vol</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {bCfg?.durationLabel ?? `${dialogBapteme.duration} min`}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Formule</p>
                      <p className="text-sm font-semibold text-slate-800">{bCfg?.shortLabel ?? fixedCategory}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    {availLoading ? (
                      <span className="text-sm text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Vérification des disponibilités…
                      </span>
                    ) : (
                      <Badge variant={isAvailable ? "default" : "destructive"}>
                        {isAvailable
                          ? `${availablePlaces} place${availablePlaces > 1 ? "s" : ""} disponible${availablePlaces > 1 ? "s" : ""}`
                          : "Complet — aucune place disponible"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDialogBapteme(null)} className="flex-1">
                      Retour
                    </Button>
                    <Button
                      onClick={() => { onSlotSelect(dialogBapteme); setDialogBapteme(null); }}
                      disabled={!isAvailable || availLoading}
                      className="flex-1 gap-2"
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

      {/* Mouse-following tooltip portal */}
      {tooltipData && mousePos && createPortal(
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 14,
            top: mousePos.y - 10,
            transform: "translateY(-100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="bg-white border border-slate-200 shadow-xl rounded-xl max-w-[240px]"
        >
          <div className="p-3 space-y-2">
            {(() => {
              const b = tooltipData.bapteme;
              const cat = tooltipData.primaryCategory;
              const tcfg = BAPTEME_CAT_CONFIG[cat];
              const thex = tcfg?.bgBarHex ?? "#94a3b8";
              const ta = tooltipData.avail;
              const tPlaces = ta?.availablePlaces ?? b.availablePlaces;
              const tAvail = ta?.available ?? (b.availablePlaces > 0);
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: thex }}
                    />
                    <span className="font-semibold text-sm text-slate-800">
                      {tcfg?.label ?? cat}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(b.date).toLocaleDateString("fr-FR", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                    {" à "}{formatTime(b.date)}
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    {tcfg?.durationLabel}
                  </p>
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
    </>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: "Mon code", icon: Gift },
  { label: "Mon créneau", icon: Calendar },
  { label: "Mes infos", icon: Users },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500",
              )}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:inline",
                active ? "text-blue-700" : done ? "text-green-700" : "text-slate-400",
              )}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-8 mx-1 transition-colors", done ? "bg-green-400" : "bg-slate-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UtiliserBonCadeauClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null);
  const [slots, setSlots] = useState<(StageSlot | BaptemeSlot)[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<StageSlot | BaptemeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ParticipantFormData>();

  // ── Step 0: Validate voucher code ──────────────────────────────────────────

  const handleLookupCode = async () => {
    if (!codeInput.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir un code", variant: "destructive" });
      return;
    }
    setIsValidating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/giftvouchers/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
        body: JSON.stringify({ code: codeInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!data.success) {
        toast({ title: "Code invalide", description: data.message, variant: "destructive" });
        return;
      }
      setVoucher(data.data);
      await loadSlots(data.data);
      setStep(1);
    } catch {
      toast({ title: "Erreur", description: "Impossible de vérifier le code", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  // ── Step 1: Load slots ─────────────────────────────────────────────────────

  const loadSlots = async (v: VoucherInfo) => {
    setLoadingSlots(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKOFFICE_URL;
      const headers = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" };

      if (v.productType === "STAGE") {
        const res = await fetch(`${apiBase}/api/stages`, { headers });
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          const filtered = (data.data as StageSlot[]).filter(
            (s) =>
              (s.type === v.stageCategory ||
                (v.stageCategory === "INITIATION" && s.type === "DOUBLE") ||
                (v.stageCategory === "PROGRESSION" && s.type === "DOUBLE")) &&
              new Date(s.startDate) > now &&
              s.availablePlaces > 0
          );
          setSlots(filtered);
        }
      } else {
        const res = await fetch(`${apiBase}/api/baptemes`, { headers });
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          const filtered = (data.data as BaptemeSlot[]).filter(
            (b) =>
              b.categories.includes(v.baptemeCategory!) &&
              new Date(b.date) > now &&
              b.availablePlaces > 0
          );
          setSlots(filtered);
        }
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les créneaux", variant: "destructive" });
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── Step 2 → Cart ──────────────────────────────────────────────────────────

  const onSubmitParticipant = async (formData: ParticipantFormData) => {
    if (!voucher || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      const sessionId = SessionManager.getOrCreateSessionId();
      const body: Record<string, unknown> = {
        type: voucher.productType,
        itemId: selectedSlot.id,
        participantData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          weight: formData.weight,
          height: formData.height,
          birthDate: formData.birthDate,
          usedGiftVoucherCode: voucher.code,
          ...(voucher.productType === "STAGE" && { selectedStageType: voucher.stageCategory }),
          ...(voucher.productType === "BAPTEME" && { selectedCategory: voucher.baptemeCategory }),
        },
        quantity: 1,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setStep(3);
      } else {
        toast({ title: "Erreur", description: result.message || "Erreur lors de l'ajout au panier", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'ajout au panier", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 pt-12">
        <div className="max-w-4xl mx-auto pl-16 pr-20 sm:px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/reserver">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
              Utiliser mon bon cadeau
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 space-y-8">

        {step < 3 && <StepBar current={step} />}

        {/* ── Step 0 : Saisie du code ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Entrez votre code bon cadeau
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Votre code a été fourni lors de l&apos;achat. Il commence par <strong>GVSCP-</strong>.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
              <div>
                <Label htmlFor="code" className="text-base font-semibold text-slate-800">Code bon cadeau</Label>
                <Input
                  id="code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="GVSCP-XXXXXXXX-XXXX"
                  className="mt-2 font-mono text-lg tracking-wider"
                  onKeyDown={(e) => e.key === "Enter" && handleLookupCode()}
                />
              </div>
              <Button onClick={handleLookupCode} disabled={isValidating} className="w-full h-12" size="lg">
                {isValidating ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Vérification…</div>
                ) : (
                  <div className="flex items-center gap-2">Valider mon code <ArrowRight className="w-4 h-4" /></div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 1 : Calendrier créneaux ────────────────────────────────── */}
        {step === 1 && voucher && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Choisissez votre créneau</h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Cliquez sur un créneau dans le calendrier pour le sélectionner
              </p>
            </div>

            {/* Voucher recap */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Gift className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">
                  Bon cadeau pour {voucher.productType === "STAGE" ? STAGE_LABELS[voucher.stageCategory!] ?? voucher.stageCategory : BAPTEME_LABELS[voucher.baptemeCategory!] ?? voucher.baptemeCategory}
                </p>
                <p className="text-sm text-blue-700 mt-0.5">
                  Bénéficiaire : <strong>{voucher.recipientName}</strong> · Valable jusqu&apos;au {new Date(voucher.expiryDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {loadingSlots ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : slots.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-slate-700">Aucun créneau disponible pour le moment</p>
                <p className="text-sm mt-1">Revenez plus tard ou contactez-nous directement.</p>
              </div>
            ) : voucher.productType === "STAGE" ? (
              <VoucherStageCalendar
                stages={slots as StageSlot[]}
                selectedSlot={selectedSlot as StageSlot | null}
                onSlotSelect={(s) => setSelectedSlot(s)}
              />
            ) : (
              <VoucherBaptemeCalendar
                baptemes={slots as BaptemeSlot[]}
                fixedCategory={voucher.baptemeCategory ?? ""}
                selectedSlot={selectedSlot as BaptemeSlot | null}
                onSlotSelect={(b) => setSelectedSlot(b)}
              />
            )}

            {/* Selected slot mini-recap */}
            {selectedSlot && (
              <div className="flex items-center justify-between gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-sm font-semibold text-blue-800">
                    {voucher.productType === "STAGE"
                      ? formatDate((selectedSlot as StageSlot).startDate)
                      : formatDate((selectedSlot as BaptemeSlot).date)}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedSlot(null)} className="text-xs text-blue-500 hover:text-blue-800 underline shrink-0">
                  Changer
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep(0); setSelectedSlot(null); }} className="h-12">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
              <Button className="flex-1 h-12" disabled={!selectedSlot} onClick={() => setStep(2)}>
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2 : Infos participant ───────────────────────────────────── */}
        {step === 2 && voucher && selectedSlot && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Vos informations</h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Renseignez les informations du participant pour finaliser la réservation
              </p>
            </div>

            {/* Recap créneau sélectionné */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1.5 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Créneau sélectionné
                </p>
                <p className="font-bold text-sm text-blue-700">
                  {voucher.productType === "STAGE"
                    ? STAGE_LABELS[(selectedSlot as StageSlot).type] ?? (selectedSlot as StageSlot).type
                    : BAPTEME_LABELS[voucher.baptemeCategory!] ?? voucher.baptemeCategory}
                </p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {voucher.productType === "STAGE"
                    ? formatDate((selectedSlot as StageSlot).startDate)
                    : formatDate((selectedSlot as BaptemeSlot).date)}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setStep(1)}>
                Changer de créneau
              </Button>
            </div>

            <Separator />

            <form id="participant-form" onSubmit={handleSubmit(onSubmitParticipant)} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Identité</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" {...register("firstName", { required: "Prénom requis" })}
                      placeholder="Jean" className="mt-1" />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" {...register("lastName", { required: "Nom requis" })}
                      placeholder="Dupont" className="mt-1" />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input id="birthDate" type="date" {...register("birthDate")} className="mt-1" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email", { required: "Email requis" })}
                      placeholder="jean.dupont@email.com" className="mt-1" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input id="phone" {...register("phone", { required: "Téléphone requis" })}
                      placeholder="06 12 34 56 78" className="mt-1" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Informations physiques</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Poids (kg) *</Label>
                    <Input id="weight" type="number"
                      {...register("weight", { required: "Poids requis", valueAsNumber: true, min: { value: 20, message: "Min 20 kg" }, max: { value: 120, message: "Max 120 kg" } })}
                      placeholder="70" className="mt-1" />
                    {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="height">Taille (cm) *</Label>
                    <Input id="height" type="number"
                      {...register("height", { required: "Taille requise", valueAsNumber: true, min: { value: 100, message: "Min 100 cm" }, max: { value: 220, message: "Max 220 cm" } })}
                      placeholder="175" className="mt-1" />
                    {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
                  </div>
                </div>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
              <Button type="submit" form="participant-form" className="flex-1 h-12" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours…</div>
                ) : (
                  <div className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Valider la réservation</div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3 : Confirmation ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Créneau réservé !</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-sm mx-auto">
                Votre bon cadeau a été appliqué. Finalisez votre commande pour confirmer la réservation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push("/checkout")} size="lg" className="gap-2">
                <ShoppingCart className="w-4 h-4" /> Finaliser la commande
              </Button>
              <Button variant="outline" onClick={() => router.push("/reserver")} size="lg">
                Retour aux activités
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
