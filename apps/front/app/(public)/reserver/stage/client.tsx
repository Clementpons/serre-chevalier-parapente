"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Gift,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { useStagePrices } from "@/hooks/useStagePrices";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageCategory {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationDays: number;
  description: string;
}

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

interface ParticipantFormData {
  participantType: "self" | "other";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}

interface AvailData {
  available: boolean;
  availablePlaces: number;
}

interface WeekEventSegment {
  stage: Stage;
  colStart: number; // 1–7 (Mon=1)
  colEnd: number;   // 1–7 inclusive
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

const STAGE_CATEGORIES: StageCategory[] = [
  {
    id: "INITIATION",
    name: "Stage Initiation",
    price: 0,
    duration: 5,
    durationDays: 7,
    description: "Découvrez le vol en parapente avec une équipe de professionnels.",
  },
  {
    id: "PROGRESSION",
    name: "Stage Progression",
    price: 0,
    duration: 5,
    durationDays: 7,
    description: "Vous avez déjà volé ? Devenez désormais autonome en vol durant ce stage.",
  },
  {
    id: "AUTONOMIE",
    name: "Stage Autonomie",
    price: 0,
    duration: 10,
    durationDays: 14,
    description: "Découvrez le parapente et devenez autonome durant un seul et même stage.",
  },
];

const ALL_STAGE_IDS = STAGE_CATEGORIES.map((c) => c.id);

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

const TYPE_CONFIG: Record<
  string,
  { bgBar: string; bgLight: string; bgBarHex: string; badgeClass: string; label: string; borderClass: string; textClass: string; dotClass: string }
> = {
  INITIATION: {
    bgBar: "bg-sky-400",
    bgBarHex: "#38bdf8",
    bgLight: "bg-sky-50",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
    label: "Initiation",
    borderClass: "border-sky-400",
    textClass: "text-sky-600",
    dotClass: "bg-sky-400",
  },
  PROGRESSION: {
    bgBar: "bg-blue-500",
    bgBarHex: "#3b82f6",
    bgLight: "bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Progression",
    borderClass: "border-blue-500",
    textClass: "text-blue-700",
    dotClass: "bg-blue-500",
  },
  AUTONOMIE: {
    bgBar: "bg-blue-800",
    bgBarHex: "#1e40af",
    bgLight: "bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    label: "Autonomie",
    borderClass: "border-blue-800",
    textClass: "text-blue-900",
    dotClass: "bg-blue-800",
  },
  DOUBLE: {
    bgBar: "bg-violet-500",
    bgBarHex: "#8b5cf6",
    bgLight: "bg-violet-50",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
    label: "Initiation + Progression",
    borderClass: "border-violet-400",
    textClass: "text-violet-700",
    dotClass: "bg-violet-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  const s = date.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Samedi 25 Avril 2026" — weekday + day + month + year, all words capitalized */
function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** 0 = Monday … 6 = Sunday */
function getDOWMon(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function stageMatchesTypes(stage: Stage, selectedTypes: string[]): boolean {
  return selectedTypes.some((type) => {
    if (stage.type === type) return true;
    if (stage.type === "DOUBLE" && (type === "INITIATION" || type === "PROGRESSION")) return true;
    return false;
  });
}

function initTypesFromParam(param: string | null): string[] {
  if (!param || param === "all") return ALL_STAGE_IDS;
  const types = param.split(",").filter((t) => ALL_STAGE_IDS.includes(t));
  return types.length > 0 ? types : ALL_STAGE_IDS;
}

// ─── Gift Voucher Banner ──────────────────────────────────────────────────────

function GiftVoucherBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-3 justify-between bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <Gift className="w-5 h-5 text-cyan-600 shrink-0" />
        <p className="text-sm text-cyan-800 font-medium">
          Vous avez un bon cadeau ? Utilisez-le dès maintenant.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/utiliser-bon-cadeau">
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 gap-1 text-xs hidden sm:flex">
            Utiliser mon bon cadeau <ArrowRight className="w-3 h-3" />
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs sm:hidden">
            Utiliser
          </Button>
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="p-1 text-cyan-500 hover:text-cyan-800 transition-colors rounded"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
          currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500",
        )}>
          {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span className={cn("text-sm font-medium", currentStep >= 1 ? "text-blue-700" : "text-slate-400")}>
          Choisir un créneau
        </span>
      </div>
      <div className={cn("h-0.5 w-8 mx-1 transition-colors", currentStep >= 2 ? "bg-blue-600" : "bg-slate-200")} />
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
          currentStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500",
        )}>
          2
        </div>
        <span className={cn("text-sm font-medium", currentStep >= 2 ? "text-blue-700" : "text-slate-400")}>
          Vos informations
        </span>
      </div>
    </div>
  );
}

// ─── Stage Dialog Content ─────────────────────────────────────────────────────

function StageDialogContent({
  stage,
  availability,
  onSelect,
  onClose,
}: {
  stage: Stage;
  availability: AvailData | null | undefined;
  onSelect: () => void;
  onClose: () => void;
}) {
  const cfg = TYPE_CONFIG[stage.type];
  const isAvailable = availability?.available ?? true;
  const availablePlaces = availability?.availablePlaces ?? stage.places;
  const isOnSale = stage.promotionOriginalPrice && stage.price < stage.promotionOriginalPrice;
  const endDate = new Date(stage.startDate);
  endDate.setDate(endDate.getDate() + stage.duration - 1);
  const availLoading = availability === undefined;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          {cfg && <span className={cn("inline-block w-3 h-3 rounded-sm shrink-0", cfg.bgBar)} />}
          {cfg?.label ?? stage.type}
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-500">
          {formatDateLong(stage.startDate)}
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
            <p className="text-xs text-slate-400">{stage.duration} jours</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-right">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">Prix</p>
            {isOnSale && (
              <p className="text-xs text-slate-400 line-through">{stage.promotionOriginalPrice}€</p>
            )}
            <p className="font-bold text-2xl text-blue-600">{stage.price}€</p>
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
            <Badge variant={isAvailable ? "default" : "destructive"}>
              {isAvailable
                ? `${availablePlaces} place${availablePlaces > 1 ? "s" : ""} disponible${availablePlaces > 1 ? "s" : ""}`
                : "Complet — aucune place disponible"}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Retour
          </Button>
          <Button onClick={onSelect} disabled={!isAvailable || availLoading} className="flex-1 gap-2">
            Choisir ce créneau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Stage Calendar ───────────────────────────────────────────────────────────

function StageCalendar({
  selectedTypes,
  onSlotSelect,
  selectedSlot,
  onStagesAccumulated,
  onViewDateChange,
}: {
  selectedTypes: string[];
  onSlotSelect: (slot: Stage) => void;
  selectedSlot: Stage | null;
  onStagesAccumulated: (stages: Stage[]) => void;
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
  const [dialogStage, setDialogStage] = useState<Stage | null>(null);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipStage, setTooltipStage] = useState<{
    stage: Stage;
    avail: AvailData | null | undefined;
  } | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailData | null>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Per-month stage cache: key = "YYYY-M-types"
  const stageCache = useRef<Map<string, Stage[]>>(new Map());
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  const typesKey = selectedTypes.join(",");

  // Fetch stages for the currently visible month (with cache)
  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cacheKey = `${year}-${month}-${typesKey}`;

    if (stageCache.current.has(cacheKey)) {
      setLocalStages(stageCache.current.get(cacheKey)!);
      return;
    }

    const ctrl = new AbortController();
    setLoadingStages(true);

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to   = new Date(year, month + 1, 0).toISOString().split("T")[0];

    // Include DOUBLE when INITIATION or PROGRESSION are selected
    const apiTypes = [...selectedTypes];
    if (
      selectedTypes.includes("INITIATION") ||
      selectedTypes.includes("PROGRESSION")
    ) {
      if (!apiTypes.includes("DOUBLE")) apiTypes.push("DOUBLE");
    }

    const params = new URLSearchParams({ from, to, types: apiTypes.join(",") });

    fetch(
      `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/stages?${params}`,
      {
        signal: ctrl.signal,
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
      },
    )
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const stages: Stage[] = data.data;
        stageCache.current.set(cacheKey, stages);
        setLocalStages(stages);

        // Bubble all cached stages up to parent for StatsSummary
        const deduped = new Map<string, Stage>();
        stageCache.current.forEach((monthStages) =>
          monthStages.forEach((s) => deduped.set(s.id, s)),
        );
        onStagesAccumulated(Array.from(deduped.values()));
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          console.error("Erreur chargement stages:", err);
      })
      .finally(() => setLoadingStages(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${viewDate.getFullYear()}-${viewDate.getMonth()}`, typesKey]);

  // Filter to stages that overlap with the current view and match selected types
  const filteredStages = useMemo(() => {
    return localStages
      .filter((s) => {
        const d = new Date(s.startDate);
        d.setHours(0, 0, 0, 0);
        return d >= today && stageMatchesTypes(s, selectedTypes);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [localStages, selectedTypes, today]);

  // Batch-fetch availability for all visible stages (1 request)
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

  // Build flat calendar days (including out-of-month days for grid padding)
  const calendarDays = useMemo((): CalDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

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

  // Group into weeks with event segments
  const weeksData = useMemo((): WeekData[] => {
    const chunks: (typeof calendarDays[number])[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) chunks.push(calendarDays.slice(i, i + 7));

    return chunks.map((weekDays) => {
      const firstActual = weekDays[0];

      // Compute Monday of this week
      const weekMonday = new Date(firstActual.date);
      weekMonday.setDate(weekMonday.getDate() - getDOWMon(weekMonday));
      weekMonday.setHours(0, 0, 0, 0);
      const weekSunday = new Date(weekMonday);
      weekSunday.setDate(weekSunday.getDate() + 6);
      weekSunday.setHours(0, 0, 0, 0);

      // Find overlapping stages
      const overlapping = filteredStages.filter((stage) => {
        const s = new Date(stage.startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(stage.startDate); e.setDate(e.getDate() + stage.duration - 1); e.setHours(0, 0, 0, 0);
        return e >= weekMonday && s <= weekSunday;
      });

      // Build segments
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

      // Sort: longer spans first for stable stacking
      segments.sort((a, b) =>
        a.colStart - b.colStart || (b.colEnd - b.colStart) - (a.colEnd - a.colStart),
      );

      // Greedy row assignment
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

        {/* Loading overlay (disables calendar without hiding it) */}
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
            variant="outline"
            size="sm"
            onClick={() => {
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
            variant="outline"
            size="sm"
            onClick={() => {
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

              {/* Out-of-month dim overlay (pointer-events-none so bars stay clickable) */}
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
                  const cfg = TYPE_CONFIG[ev.stage.type];
                  const hex = cfg?.bgBarHex ?? "#94a3b8";
                  const avail = availabilityMap[ev.stage.id];
                  const places = avail?.availablePlaces ?? ev.stage.places;
                  const isAvail = avail?.available ?? true;
                  const isSelected = selectedSlot?.id === ev.stage.id;
                  const isHovered = hoveredStageId === ev.stage.id;
                  const isPromo = !!(ev.stage.promotionOriginalPrice && ev.stage.price < ev.stage.promotionOriginalPrice);
                  const discountPct = isPromo
                    ? Math.round((1 - ev.stage.price / (ev.stage.promotionOriginalPrice as number)) * 100)
                    : 0;

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
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">↓</span>
                <span className="text-xs text-slate-400">Promotion</span>
              </div>
            </div>
          );
        })()}

        {/* Empty states */}
        {!hasAnyStages && (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">Aucun créneau disponible pour les types sélectionnés.</p>
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
          {dialogStage && (
            <StageDialogContent
              stage={dialogStage}
              availability={availabilityMap[dialogStage.id]}
              onSelect={() => { onSlotSelect(dialogStage); setDialogStage(null); }}
              onClose={() => setDialogStage(null)}
            />
          )}
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
    </>
  );
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

function StatsSummary({ allStages, selectedTypes, viewDate }: { allStages: Stage[]; selectedTypes: string[]; viewDate: Date }) {
  const startOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1), [viewDate]);
  const endOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0), [viewDate]);

  const stats = useMemo(() =>
    selectedTypes.map((typeId) => {
      const matching = allStages.filter((s) => {
        const d = new Date(s.startDate); d.setHours(0, 0, 0, 0);
        if (d < startOfMonth || d > endOfMonth) return false;
        if (s.type === typeId) return true;
        if (s.type === "DOUBLE" && (typeId === "INITIATION" || typeId === "PROGRESSION")) return true;
        return false;
      });
      return { typeId, count: matching.length, totalPlaces: matching.reduce((sum, s) => sum + s.places, 0) };
    }),
  [allStages, selectedTypes, startOfMonth, endOfMonth]);

  if (allStages.length === 0 || selectedTypes.length === 0) return null;

  return (
    <div className="text-sm space-y-1.5">
      <p className="text-slate-500">
        En <strong className="text-slate-700">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</strong> :
      </p>
      <div className="space-y-1">
        {stats.map(({ typeId, count, totalPlaces }) => {
          const cfg = TYPE_CONFIG[typeId];
          return (
            <div key={typeId} className="flex items-center gap-2">
              <span className={cn("inline-block w-3 h-2.5 rounded-sm shrink-0", cfg?.bgBar)} />
              <span className="text-slate-600">
                <strong className="text-slate-800">{count}</strong> créneau{count > 1 ? "x" : ""}{" "}
                <strong className={cfg?.textClass}>{cfg?.label}</strong>
                {totalPlaces > 0 && (
                  <span className="text-slate-400"> — {totalPlaces} place{totalPlaces > 1 ? "s" : ""} au total</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function StageReservationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isScrolled, setIsScrolled] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ParticipantFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(() =>
    initTypesFromParam(searchParams.get("stageType")),
  );
  const [accumulatedStages, setAccumulatedStages] = useState<Stage[]>([]);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedSlot, setSelectedSlot] = useState<Stage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { getPrice: getStagePrice, loading: pricesLoading } = useStagePrices();
  const participantType = watch("participantType");

  const resolveEffectiveCategory = (slot: Stage): string => {
    if (slot.type !== "DOUBLE") return slot.type;
    if (selectedTypes.includes("INITIATION")) return "INITIATION";
    if (selectedTypes.includes("PROGRESSION")) return "PROGRESSION";
    return "INITIATION";
  };

  useEffect(() => {
    const handleScroll = () =>
      setIsScrolled((window.pageYOffset || document.documentElement.scrollTop) > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setValue("firstName", d.firstName || "");
        setValue("lastName", d.lastName || "");
        setValue("email", d.email || "");
        setValue("phone", d.phone || "");
        setValue("weight", d.weight || "");
        setValue("height", d.height || "");
        setValue("birthDate", d.birthDate || "");
      } catch { /* ignore */ }
    }
  }, [setValue]);

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId) && prev.length === 1) return prev;
      const next = prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId];
      const param = next.length === ALL_STAGE_IDS.length ? "all" : next.join(",");
      router.replace(`?stageType=${param}`, { scroll: false });
      return next;
    });
    setSelectedSlot(null);
    setShowForm(false);
  };

  const handleSlotSelect = (slot: Stage) => {
    setSelectedSlot(slot);
    setShowForm(true);
    setValue("participantType", "self");
    setTimeout(() => {
      document
        .getElementById("participant-form-separator")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const saveUserInfo = (data: ParticipantFormData) => {
    if (data.participantType === "self") {
      localStorage.setItem("userInfo", JSON.stringify({
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, phone: data.phone,
        weight: data.weight, height: data.height, birthDate: data.birthDate,
      }));
    }
  };

  const onSubmit = async (data: ParticipantFormData) => {
    if (!selectedSlot) return;
    setIsLoading(true);
    try {
      saveUserInfo(data);
      const sessionId = SessionManager.getOrCreateSessionId();
      const effectiveCategory = resolveEffectiveCategory(selectedSlot);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          type: "STAGE",
          itemId: selectedSlot.id,
          participantData: {
            ...data,
            weight: Number(data.weight), height: Number(data.height),
            selectedStageType: effectiveCategory,
          },
          quantity: 1,
        }),
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast({ title: "Place réservée temporairement", description: "Cette place est bloquée pendant 1h00.", duration: 5000 });
        setShowSuccessDialog(true);
      } else {
        toast({ title: "Erreur", description: result.message || "Erreur lors de l'ajout au panier", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'ajout au panier", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const getCategoryLabel = (cat: string) =>
    ({ INITIATION: "Stage Initiation", PROGRESSION: "Stage Progression", AUTONOMIE: "Stage Autonomie" }[cat] ?? cat);

  const effectiveCategory = selectedSlot ? resolveEffectiveCategory(selectedSlot) : "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className={cn(
        "bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm transition-all ease-in-out duration-300",
        isScrolled ? "pt-0 pb-0" : "pt-12 pb-4",
      )}>
        <div className="max-w-4xl mx-auto pl-16 pr-20 sm:px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/reserver">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
              Réserver un stage
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 space-y-6">
        <GiftVoucherBanner />
        <StepIndicator currentStep={showForm ? 2 : 1} />

        {/* ── ÉTAPE 1 : calendrier (masqué en étape 2) ── */}
        {!showForm ? (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Choisissez votre créneau</h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Filtrez par type et cliquez sur un stage dans le calendrier
              </p>
            </div>

            {/* Type checkboxes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-800">Filtrer par type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STAGE_CATEGORIES.map((cat) => {
                  const isChecked = selectedTypes.includes(cat.id);
                  const cfg = TYPE_CONFIG[cat.id];
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleType(cat.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                        isChecked ? `${cfg.borderClass} ${cfg.bgLight}` : "border-slate-200 bg-white hover:border-slate-300",
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                        isChecked ? `${cfg.dotClass} border-transparent` : "border-slate-300 bg-white",
                      )}>
                        {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn("font-semibold text-sm", isChecked ? cfg.textClass : "text-slate-700")}>
                            {cat.name}
                          </p>
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                            isChecked ? `${cfg.badgeClass}` : "bg-slate-100 text-slate-500 border-slate-200",
                          )}>
                            {cat.durationDays} jours
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">
                          {cat.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {pricesLoading ? "..." : `À partir de ${getStagePrice(cat.id)}€`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar */}
            <Card>
              <CardContent className="p-3 sm:p-5">
                <StageCalendar
                  selectedTypes={selectedTypes}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  onStagesAccumulated={setAccumulatedStages}
                  onViewDateChange={setCalendarViewDate}
                />
              </CardContent>
            </Card>

            {/* Stats below calendar */}
            {accumulatedStages.length > 0 && (
              <StatsSummary allStages={accumulatedStages} selectedTypes={selectedTypes} viewDate={calendarViewDate} />
            )}
          </div>
        ) : selectedSlot && (
          /* Résumé compact du créneau en étape 2 */
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Créneau sélectionné
                  </p>
                  {(() => {
                    const cfg = TYPE_CONFIG[resolveEffectiveCategory(selectedSlot)];
                    const end = new Date(selectedSlot.startDate);
                    end.setDate(end.getDate() + selectedSlot.duration - 1);
                    return (
                      <>
                        <p className="font-bold text-sm" style={{ color: cfg?.bgBarHex }}>
                          {cfg?.label}
                        </p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5">
                          Stage du {formatDateFull(selectedSlot.startDate)} au {formatDateFull(end.toISOString())} ({selectedSlot.duration} jours)
                        </p>
                      </>
                    );
                  })()}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-3">
                    {selectedSlot.promotionOriginalPrice && selectedSlot.price < selectedSlot.promotionOriginalPrice && (
                      <p className="text-sm text-slate-400 line-through">{selectedSlot.promotionOriginalPrice}€</p>
                    )}
                    <p className="font-bold text-2xl text-blue-600">{selectedSlot.price}€</p>
                  </div>
                  {selectedSlot.acomptePrice && (
                    <p className="text-xs text-slate-500">
                      Acompte aujourd&apos;hui : <span className="font-semibold text-slate-700">{selectedSlot.acomptePrice}€</span>
                      {" · "}solde sur place : <span className="font-semibold text-slate-700">{selectedSlot.price - selectedSlot.acomptePrice}€</span>
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    onClick={() => { setSelectedSlot(null); setShowForm(false); }}
                  >
                    Changer de créneau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── ÉTAPE 2 ── */}
        {showForm && selectedSlot && (
          <>
            <Separator id="participant-form-separator" />
            <div id="participant-form" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Vos informations</h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  Renseignez les informations du participant pour finaliser la réservation
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Pour qui */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-slate-800">Pour qui réservez-vous ?</Label>
                  <RadioGroup
                    defaultValue="self"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    onValueChange={(v) => setValue("participantType", v as "self" | "other")}
                  >
                    {(["self", "other"] as const).map((val) => (
                      <div key={val} className="relative">
                        <RadioGroupItem value={val} id={val} className="peer sr-only" />
                        <Label
                          htmlFor={val}
                          className={cn(
                            "flex items-center justify-center p-5 bg-slate-50 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-100",
                            participantType === val ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200",
                          )}
                        >
                          <div className="text-center">
                            <div className={cn("font-semibold text-base", participantType === val ? "text-blue-700" : "text-slate-800")}>
                              {val === "self" ? "Pour moi" : "Pour quelqu'un d'autre"}
                            </div>
                            <div className={cn("text-xs mt-1", participantType === val ? "text-blue-600" : "text-slate-500")}>
                              {val === "self" ? "Mes informations seront sauvegardées" : "Cadeau ou réservation tierce"}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Informations participant */}
                <div className="space-y-6">
                  <h3 className="text-base font-semibold text-slate-800">
                    Informations {participantType === "self" ? "personnelles" : "du participant"}
                  </h3>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Identité</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input id="firstName" {...register("firstName", { required: "Prénom requis" })}
                          placeholder={participantType === "self" ? "Votre prénom" : "Prénom du participant"} className="mt-1" />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input id="lastName" {...register("lastName", { required: "Nom requis" })}
                          placeholder={participantType === "self" ? "Votre nom" : "Nom du participant"} className="mt-1" />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Date de naissance *</Label>
                      <Input id="birthDate" type="date" {...register("birthDate", { required: "Requise" })} className="mt-1" />
                      {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" {...register("email", { required: "Email requis" })}
                          placeholder="email@exemple.com" className="mt-1" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input id="phone" {...register("phone", { required: "Requis" })}
                          placeholder="06 12 34 56 78" className="mt-1" />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Informations physiques</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Poids (kg) *</Label>
                        <Input id="weight" type="number"
                          {...register("weight", { required: "Requis", min: { value: 20, message: "Min 20kg" }, max: { value: 120, message: "Max 120kg" } })}
                          placeholder="70" className="mt-1" />
                        {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="height">Taille (cm) *</Label>
                        <Input id="height" type="number"
                          {...register("height", { required: "Requise", min: { value: 120, message: "Min 120cm" }, max: { value: 220, message: "Max 220cm" } })}
                          placeholder="175" className="mt-1" />
                        {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Récapitulatif</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">{getCategoryLabel(effectiveCategory)}</span>
                      <div className="text-right">
                        {selectedSlot.promotionOriginalPrice && selectedSlot.price < selectedSlot.promotionOriginalPrice && (
                          <span className="text-sm text-slate-400 line-through block">{selectedSlot.promotionOriginalPrice}€</span>
                        )}
                        <span className="font-semibold text-slate-800">{selectedSlot.price}€</span>
                      </div>
                    </div>
                    <hr className="border-slate-300" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-slate-800">Total</span>
                      <span className="font-bold text-2xl text-blue-600">{selectedSlot.price}€</span>
                    </div>
                    {selectedSlot.acomptePrice && (
                      <>
                        <hr className="border-dashed border-slate-200" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Acompte à régler aujourd&apos;hui</span>
                          <span className="font-semibold text-slate-800">{selectedSlot.acomptePrice}€</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Solde à régler sur place</span>
                          <span className="text-slate-600">{selectedSlot.price - selectedSlot.acomptePrice}€</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="button" variant="outline"
                    onClick={() => { setSelectedSlot(null); setShowForm(false); }}
                    className="flex-1 h-12" size="lg">
                    Modifier le créneau
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 h-12" size="lg">
                    {isLoading ? (
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Ajout en cours…</div>
                    ) : (
                      <div className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Ajouter au panier</div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Dialog: place bloquée */}
      <Dialog open={showSuccessDialog} onOpenChange={(open) => { setShowSuccessDialog(open); if (!open) router.push("/reserver"); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Place temporairement bloquée.</DialogTitle>
            <DialogDescription className="text-center text-base space-y-2">
              <p className="font-semibold text-slate-800">Votre place est bloquée pendant 1h00</p>
              <p className="text-sm">Finalisez votre paiement dans l&apos;heure pour confirmer votre réservation.</p>
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mt-3">
                <Clock className="w-4 h-4" />
                {(() => {
                  function Countdown({ initialSeconds, start }: { initialSeconds: number; start: boolean }) {
                    const [s, setS] = useState(initialSeconds);
                    useEffect(() => {
                      if (!start) return;
                      setS(initialSeconds);
                      const id = setInterval(() => setS((p) => (p <= 1 ? (clearInterval(id), 0) : p - 1)), 1000);
                      return () => clearInterval(id);
                    }, [start, initialSeconds]);
                    return (
                      <span className="text-sm font-medium">
                        Temps restant : {Math.floor(s / 60).toString().padStart(2, "0")}:{(s % 60).toString().padStart(2, "0")}
                      </span>
                    );
                  }
                  return <Countdown initialSeconds={3600} start={showSuccessDialog} />;
                })()}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={() => { setShowSuccessDialog(false); router.push("/reserver"); }} className="w-full gap-2" size="lg">
              <ArrowLeft className="w-4 h-4" /> Je continue mes achats
            </Button>
            <Button onClick={() => { setShowSuccessDialog(false); router.push("/checkout"); }} variant="outline" className="w-full gap-2" size="lg">
              <ShoppingCart className="w-4 h-4" /> Voir mon panier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function StageReservationClientPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <StageReservationPageContent />
    </Suspense>
  );
}
