"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BaptemeCategory {
  id: string;
  name: string;
  durationLabel: string;
  description: string;
}

export interface Bapteme {
  id: string;
  date: string;
  duration: number;
  places: number;
  categories: string[];
  acomptePrice?: number | null;
  availablePlaces: number;
}

interface AvailData {
  available: boolean;
  availablePlaces: number;
}

interface BaptemeCalSlot {
  bapteme: Bapteme;
  col: number;
  rowIndex: number;
  primaryCategory: string;
}

interface CalDay {
  date: Date;
  key: string;
  isPast: boolean;
  isOutOfMonth: boolean;
}

interface BaptemeWeekData {
  days: CalDay[];
  slots: BaptemeCalSlot[];
  maxRowIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const BAPTEME_CATEGORIES: BaptemeCategory[] = [
  {
    id: "AVENTURE",
    name: "Baptême Aventure",
    durationLabel: "15 min",
    description: "Vivez votre baptême aérien : liberté, frissons et vue imprenable.",
  },
  {
    id: "DUREE",
    name: "Baptême Durée",
    durationLabel: "30 min",
    description: "Plus long, plus haut, plus fort. Adrénaline garantie.",
  },
  {
    id: "LONGUE_DUREE",
    name: "Longue Durée",
    durationLabel: "45 min",
    description: "Plus on reste dans le ciel, plus le plaisir grandit.",
  },
  {
    id: "ENFANT",
    name: "Baptême Enfant",
    durationLabel: "10 min",
    description: "Pour les p'tits loups dans l'aventure et la montagne.",
  },
  {
    id: "HIVER",
    name: "Baptême Hiver",
    durationLabel: "~30 - 45 min",
    description: "Les sommets enneigés à perte de vue, en toute liberté.",
  },
];

export const ALL_CATEGORY_IDS = BAPTEME_CATEGORIES.map((c) => c.id);

export const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

export const CATEGORY_CONFIG: Record<
  string,
  {
    bgBar: string; bgBarHex: string; bgLight: string;
    badgeClass: string; label: string; shortLabel: string;
    borderClass: string; textClass: string; dotClass: string;
  }
> = {
  AVENTURE: {
    bgBar: "bg-orange-400", bgBarHex: "#fb923c", bgLight: "bg-orange-50",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Baptême Aventure", shortLabel: "Aventure",
    borderClass: "border-orange-400", textClass: "text-orange-700", dotClass: "bg-orange-400",
  },
  DUREE: {
    bgBar: "bg-sky-500", bgBarHex: "#0ea5e9", bgLight: "bg-sky-50",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
    label: "Baptême Durée", shortLabel: "Durée",
    borderClass: "border-sky-500", textClass: "text-sky-700", dotClass: "bg-sky-500",
  },
  LONGUE_DUREE: {
    bgBar: "bg-blue-600", bgBarHex: "#2563eb", bgLight: "bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Longue Durée", shortLabel: "L. Durée",
    borderClass: "border-blue-600", textClass: "text-blue-700", dotClass: "bg-blue-600",
  },
  ENFANT: {
    bgBar: "bg-emerald-500", bgBarHex: "#10b981", bgLight: "bg-emerald-50",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    label: "Baptême Enfant", shortLabel: "Enfant",
    borderClass: "border-emerald-500", textClass: "text-emerald-700", dotClass: "bg-emerald-500",
  },
  HIVER: {
    bgBar: "bg-violet-600", bgBarHex: "#7c3aed", bgLight: "bg-violet-50",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
    label: "Baptême Hiver", shortLabel: "Hiver",
    borderClass: "border-violet-600", textClass: "text-violet-700", dotClass: "bg-violet-600",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function initCategoriesFromParam(param: string | null): string[] {
  if (!param || param === "all") return ALL_CATEGORY_IDS;
  const cats = param.split(",").filter((c) => ALL_CATEGORY_IDS.includes(c));
  return cats.length > 0 ? cats : ALL_CATEGORY_IDS;
}

// ─── Bapteme Dialog Content ───────────────────────────────────────────────────

// ─── Bapteme Calendar ─────────────────────────────────────────────────────────

export function BaptemeCalendar({
  selectedCategories,
  onSlotSelect,
  selectedSlot,
  onBaptemesAccumulated,
  getBaptemePrice,
  onViewDateChange,
}: {
  selectedCategories: string[];
  onSlotSelect: (slot: Bapteme, category: string) => void;
  selectedSlot: Bapteme | null;
  onBaptemesAccumulated: (baptemes: Bapteme[]) => void;
  getBaptemePrice: (cat: string) => number;
  onViewDateChange?: (date: Date) => void;
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
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    bapteme: Bapteme;
    avail: AvailData | null | undefined;
    primaryCategory: string;
  } | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Per-month bapteme cache
  const baptemeCache = useRef<Map<string, Bapteme[]>>(new Map());
  const isAutoNavigating = useRef(true);
  const [localBaptemes, setLocalBaptemes] = useState<Bapteme[]>([]);
  const [loadingBaptemes, setLoadingBaptemes] = useState(false);

  const categoriesKey = selectedCategories.join(",");

  // Fetch baptemes for the current month (with cache)
  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cacheKey = `${year}-${month}-${categoriesKey}`;

    if (baptemeCache.current.has(cacheKey)) {
      setLocalBaptemes(baptemeCache.current.get(cacheKey)!);
      return;
    }

    const ctrl = new AbortController();
    setLoadingBaptemes(true);

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to   = new Date(year, month + 1, 0).toISOString().split("T")[0];
    const params = new URLSearchParams({ from, to, categories: selectedCategories.join(",") });

    fetch(
      `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/baptemes?${params}`,
      {
        signal: ctrl.signal,
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
      },
    )
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const baptemes: Bapteme[] = data.data;
        baptemeCache.current.set(cacheKey, baptemes);
        setLocalBaptemes(baptemes);

        // Auto-navigate to the first month that has upcoming baptemes
        if (isAutoNavigating.current) {
          const hasUpcoming = baptemes.some((b) => {
            const d = new Date(b.date);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          });
          if (!hasUpcoming) {
            const nextMonth = new Date(year, month + 1, 1);
            const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);
            if (nextMonth < maxDate) {
              setViewDate(nextMonth);
              onViewDateChange?.(nextMonth);
            } else {
              isAutoNavigating.current = false;
            }
          } else {
            isAutoNavigating.current = false;
          }
        }

        // Bubble accumulated baptemes up for StatsSummary
        const deduped = new Map<string, Bapteme>();
        baptemeCache.current.forEach((monthBaptemes) =>
          monthBaptemes.forEach((b) => deduped.set(b.id, b)),
        );
        onBaptemesAccumulated(Array.from(deduped.values()));
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Erreur chargement baptêmes:", err);
      })
      .finally(() => setLoadingBaptemes(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${viewDate.getFullYear()}-${viewDate.getMonth()}`, categoriesKey]);

  // Filter to future baptemes matching selected categories
  const filteredBaptemes = useMemo(() => {
    return localBaptemes.filter((b) => {
      const d = new Date(b.date);
      d.setHours(0, 0, 0, 0);
      return d >= today && b.categories.some((c) => selectedCategories.includes(c));
    });
  }, [localBaptemes, selectedCategories, today]);

  // Batch availability check for all visible baptemes (1 request)
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

  // Build flat calendar days (including out-of-month days for grid padding)
  const calendarDays = useMemo((): CalDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();

    const days: CalDay[] = [];

    // Preceding month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: false });
    }

    // Following month days
    let nextDay = 1;
    while (days.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay++);
      date.setHours(0, 0, 0, 0);
      days.push({ date, key: getDateKey(date), isPast: date < today, isOutOfMonth: true });
    }

    return days;
  }, [viewDate, today]);

  // Group into weeks with bapteme slots
  const weeksData = useMemo((): BaptemeWeekData[] => {
    const chunks: CalDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      // Build a map: dateKey -> col (1-7)
      const colMap = new Map<string, number>();
      weekDays.forEach((d, i) => colMap.set(d.key, i + 1));

      // Find baptemes on any day of this week
      const weekBaptemes = filteredBaptemes.filter((b) => {
        const bDate = new Date(b.date);
        bDate.setHours(0, 0, 0, 0);
        return colMap.has(getDateKey(bDate));
      });

      // Sort by date+time
      weekBaptemes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // One slot per matching category per bapteme (multi-type baptemes → multiple bars)
      const colRowUsage = new Map<number, number>();
      const slots: BaptemeCalSlot[] = [];
      for (const b of weekBaptemes) {
        const bDate = new Date(b.date);
        bDate.setHours(0, 0, 0, 0);
        const col = colMap.get(getDateKey(bDate)) ?? 1;
        const matchingCats = b.categories.filter((c) => selectedCategories.includes(c));
        for (const cat of matchingCats) {
          const currentRow = colRowUsage.get(col) ?? 0;
          colRowUsage.set(col, currentRow + 1);
          slots.push({ bapteme: b, col, rowIndex: currentRow, primaryCategory: cat });
        }
      }

      const maxRowIndex = slots.reduce((m, s) => Math.max(m, s.rowIndex), -1);
      return { days: weekDays, slots, maxRowIndex };
    });
  }, [calendarDays, filteredBaptemes, selectedCategories]);

  const hasAnyBaptemes = filteredBaptemes.length > 0;
  const currentMonthHasBaptemes = weeksData.some((w) => w.slots.length > 0);

  return (
    <>
      <div className="relative space-y-3">

        {/* Loading overlay */}
        {loadingBaptemes && (
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
            onClick={() => {
              isAutoNavigating.current = false;
              const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
              setViewDate(d);
              onViewDateChange?.(d);
            }}
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
            onClick={() => {
              isAutoNavigating.current = false;
              const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
              setViewDate(d);
              onViewDateChange?.(d);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">

          {/* Day-name header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {DAY_NAMES.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "text-center text-xs font-semibold py-2 border-r border-slate-200 last:border-r-0",
                  i === 0
                    ? "text-blue-800 bg-blue-100 font-bold"
                    : "text-blue-600",
                )}
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
                  const cfg = CATEGORY_CONFIG[slot.primaryCategory];
                  const hex = cfg?.bgBarHex ?? "#94a3b8";
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
                      onClick={() => { if (isAvail) onSlotSelect(slot.bapteme, slot.primaryCategory); }}
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
                        {cfg?.shortLabel ?? slot.primaryCategory}
                        {" "}
                        <span className="font-normal opacity-70">{formatTime(slot.bapteme.date)}</span>
                        <span className="font-normal opacity-80">
                          {" — "}{getBaptemePrice(slot.primaryCategory)}€
                        </span>
                        {avail !== undefined && (
                          <span className="font-normal opacity-70">
                            {isAvail ? ` · ${places}p` : " · Complet"}
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
        {hasAnyBaptemes && (() => {
          const usedCategories = [
            ...new Set(
              filteredBaptemes.flatMap((b) =>
                b.categories.filter((c) => selectedCategories.includes(c)),
              ),
            ),
          ];
          return (
            <div className="flex flex-wrap gap-4 pt-1">
              {usedCategories.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                return cfg ? (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className={cn("inline-block w-4 h-2.5 rounded-sm shrink-0", cfg.bgBar)} />
                    <span className="text-xs text-slate-500">{cfg.shortLabel}</span>
                  </div>
                ) : null;
              })}
            </div>
          );
        })()}

        {/* Empty states */}
        {!hasAnyBaptemes && (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">
              Aucun créneau disponible pour les formules sélectionnées.
            </p>
          </div>
        )}
        {hasAnyBaptemes && !currentMonthHasBaptemes && (
          <p className="text-center text-sm text-slate-400 py-2">
            Aucun créneau ce mois — naviguez avec les flèches.
          </p>
        )}
      </div>

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
              const tcfg = CATEGORY_CONFIG[cat];
              const thex = tcfg?.bgBarHex ?? "#94a3b8";
              const ta = tooltipData.avail;
              const tPlaces = ta?.availablePlaces ?? b.availablePlaces;
              const tAvail = ta?.available ?? (b.availablePlaces > 0);
              const ci = BAPTEME_CATEGORIES.find((x) => x.id === cat);
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
                  <p className="text-xs font-bold" style={{ color: thex }}>
                    {ci?.durationLabel} — {getBaptemePrice(cat)}€
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
