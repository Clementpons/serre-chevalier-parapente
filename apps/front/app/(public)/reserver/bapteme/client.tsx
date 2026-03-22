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
  Video,
} from "lucide-react";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";
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

interface BaptemeCategory {
  id: string;
  name: string;
  durationLabel: string;
  description: string;
}

interface Bapteme {
  id: string;
  date: string;
  duration: number;
  places: number;
  categories: string[];
  acomptePrice?: number | null;
  availablePlaces: number;
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

const BAPTEME_CATEGORIES: BaptemeCategory[] = [
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

const ALL_CATEGORY_IDS = BAPTEME_CATEGORIES.map((c) => c.id);

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

const CATEGORY_CONFIG: Record<
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

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function initCategoriesFromParam(param: string | null): string[] {
  if (!param || param === "all") return ALL_CATEGORY_IDS;
  const cats = param.split(",").filter((c) => ALL_CATEGORY_IDS.includes(c));
  return cats.length > 0 ? cats : ALL_CATEGORY_IDS;
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

// ─── Bapteme Dialog Content ───────────────────────────────────────────────────

function BaptemeDialogContent({
  bapteme,
  matchingCategories,
  availability,
  getBaptemePrice,
  onSelect,
  onClose,
}: {
  bapteme: Bapteme;
  matchingCategories: string[];
  availability: AvailData | null | undefined;
  getBaptemePrice: (cat: string) => number;
  onSelect: (category: string) => void;
  onClose: () => void;
}) {
  const [dialogCategory, setDialogCategory] = useState<string>(matchingCategories[0] ?? "");
  const cfg = CATEGORY_CONFIG[dialogCategory];
  const catInfo = BAPTEME_CATEGORIES.find((c) => c.id === dialogCategory);
  const isAvailable = availability?.available ?? (bapteme.availablePlaces > 0);
  const availablePlaces = availability?.availablePlaces ?? bapteme.availablePlaces;
  const availLoading = availability === undefined;
  const price = getBaptemePrice(dialogCategory);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          {cfg && <span className={cn("inline-block w-3 h-3 rounded-sm shrink-0", cfg.bgBar)} />}
          Baptême de parapente
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-500">
          {formatDateFull(bapteme.date)} à {formatTime(bapteme.date)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-3">
        {/* Category selector (if multiple categories match) */}
        {matchingCategories.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase">Formule</p>
            <div className="space-y-2">
              {matchingCategories.map((catId) => {
                const c = CATEGORY_CONFIG[catId];
                const ci = BAPTEME_CATEGORIES.find((x) => x.id === catId);
                const isSelected = dialogCategory === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => setDialogCategory(catId)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                      isSelected ? `${c?.borderClass} ${c?.bgLight}` : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      isSelected ? `${c?.dotClass} border-transparent` : "border-slate-300",
                    )}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-semibold text-sm", isSelected ? c?.textClass : "text-slate-700")}>
                        {ci?.name}
                      </p>
                      <p className="text-xs text-slate-500">{ci?.durationLabel} de vol</p>
                    </div>
                    <span className={cn("font-bold text-sm shrink-0", isSelected ? c?.textClass : "text-slate-700")}>
                      {getBaptemePrice(catId)}€
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">Durée de vol</p>
            <p className="text-sm font-semibold text-slate-800">
              {catInfo?.durationLabel ?? `${bapteme.duration} min`}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-right">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">Prix</p>
            <p className="font-bold text-2xl text-blue-600">{price}€</p>
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
          <Button
            onClick={() => onSelect(dialogCategory)}
            disabled={!isAvailable || availLoading || !dialogCategory}
            className="flex-1 gap-2"
          >
            Choisir ce créneau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Bapteme Calendar ─────────────────────────────────────────────────────────

function BaptemeCalendar({
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
  const [dialogBapteme, setDialogBapteme] = useState<Bapteme | null>(null);
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
                        {cfg?.shortLabel ?? slot.primaryCategory}
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

      {/* Bapteme detail dialog */}
      <Dialog
        open={!!dialogBapteme}
        onOpenChange={(open) => { if (!open) setDialogBapteme(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          {dialogBapteme && (
            <BaptemeDialogContent
              bapteme={dialogBapteme}
              matchingCategories={
                selectedCategories.filter((c) => dialogBapteme.categories.includes(c))
              }
              availability={availabilityMap[dialogBapteme.id]}
              getBaptemePrice={getBaptemePrice}
              onSelect={(category) => {
                onSlotSelect(dialogBapteme, category);
                setDialogBapteme(null);
              }}
              onClose={() => setDialogBapteme(null)}
            />
          )}
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

// ─── Stats Summary ────────────────────────────────────────────────────────────

function StatsSummary({
  allBaptemes,
  selectedCategories,
  viewDate,
}: {
  allBaptemes: Bapteme[];
  selectedCategories: string[];
  viewDate: Date;
}) {
  const startOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1), [viewDate]);
  const endOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0), [viewDate]);

  const stats = useMemo(() =>
    selectedCategories.map((catId) => {
      const matching = allBaptemes.filter((b) => {
        const d = new Date(b.date); d.setHours(0, 0, 0, 0);
        if (d < startOfMonth || d > endOfMonth) return false;
        return b.categories.includes(catId);
      });
      return {
        catId,
        count: matching.length,
        totalPlaces: matching.reduce((sum, b) => sum + b.places, 0),
      };
    }),
  [allBaptemes, selectedCategories, startOfMonth, endOfMonth]);

  if (allBaptemes.length === 0 || selectedCategories.length === 0) return null;

  return (
    <div className="text-sm space-y-1.5">
      <p className="text-slate-500">
        En <strong className="text-slate-700">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</strong> :
      </p>
      <div className="space-y-1">
        {stats.map(({ catId, count, totalPlaces }) => {
          const cfg = CATEGORY_CONFIG[catId];
          return (
            <div key={catId} className="flex items-center gap-2">
              <span className={cn("inline-block w-3 h-2.5 rounded-sm shrink-0", cfg?.bgBar)} />
              <span className="text-slate-600">
                <strong className="text-slate-800">{count}</strong> créneau{count > 1 ? "x" : ""}{" "}
                <strong className={cfg?.textClass}>{cfg?.shortLabel}</strong>
                {totalPlaces > 0 && (
                  <span className="text-slate-400">
                    {" "}— {totalPlaces} place{totalPlaces > 1 ? "s" : ""} au total
                  </span>
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

function BaptemeReservationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isScrolled, setIsScrolled] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ParticipantFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    initCategoriesFromParam(searchParams.get("category")),
  );
  const [accumulatedBaptemes, setAccumulatedBaptemes] = useState<Bapteme[]>([]);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedSlot, setSelectedSlot] = useState<Bapteme | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hasVideo, setHasVideo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { getPrice: getBaptemePrice, videoOptionPrice, loading: pricesLoading } =
    useBaptemePrices();

  const participantType = watch("participantType");

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

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId) && prev.length === 1) return prev;
      const next = prev.includes(catId)
        ? prev.filter((c) => c !== catId)
        : [...prev, catId];
      const param = next.length === ALL_CATEGORY_IDS.length ? "all" : next.join(",");
      router.replace(`?category=${param}`, { scroll: false });
      return next;
    });
    setSelectedSlot(null);
    setShowForm(false);
  };

  const handleSlotSelect = (slot: Bapteme, category: string) => {
    setSelectedSlot(slot);
    setSelectedCategory(category);
    setHasVideo(false);
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

  const catCfg = CATEGORY_CONFIG[selectedCategory];
  const catInfo = BAPTEME_CATEGORIES.find((c) => c.id === selectedCategory);
  const basePrice = selectedSlot && selectedCategory ? getBaptemePrice(selectedCategory) : 0;
  const totalPrice = basePrice + (hasVideo ? videoOptionPrice : 0);

  const onSubmit = async (data: ParticipantFormData) => {
    if (!selectedSlot || !selectedCategory) return;
    setIsLoading(true);
    try {
      saveUserInfo(data);
      const sessionId = SessionManager.getOrCreateSessionId();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          type: "BAPTEME",
          itemId: selectedSlot.id,
          participantData: {
            ...data,
            weight: Number(data.weight),
            height: Number(data.height),
            selectedCategory,
            hasVideo,
          },
          quantity: 1,
        }),
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast({
          title: "Place réservée temporairement",
          description: "Cette place est bloquée pendant 1h00. Finalisez votre paiement pour confirmer.",
          duration: 5000,
        });
        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de l'ajout au panier",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'ajout au panier", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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
              Réserver un baptême
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
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Choisissez votre créneau
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Filtrez par formule et cliquez sur un créneau dans le calendrier
              </p>
            </div>

            {/* Category checkboxes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-800">Filtrer par formule</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BAPTEME_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  const cfg = CATEGORY_CONFIG[cat.id];
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                        isChecked
                          ? `${cfg.borderClass} ${cfg.bgLight}`
                          : "border-slate-200 bg-white hover:border-slate-300",
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
                            isChecked ? cfg.badgeClass : "bg-slate-100 text-slate-500 border-slate-200",
                          )}>
                            {cat.durationLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">
                          {cat.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {pricesLoading ? "..." : `${getBaptemePrice(cat.id)}€`}
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
                <BaptemeCalendar
                  selectedCategories={selectedCategories}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  onBaptemesAccumulated={setAccumulatedBaptemes}
                  getBaptemePrice={getBaptemePrice}
                  onViewDateChange={setCalendarViewDate}
                />
              </CardContent>
            </Card>

            {/* Stats below calendar */}
            {accumulatedBaptemes.length > 0 && (
              <StatsSummary
                allBaptemes={accumulatedBaptemes}
                selectedCategories={selectedCategories}
                viewDate={calendarViewDate}
              />
            )}
          </div>
        ) : selectedSlot && selectedCategory && (
          /* Résumé compact du créneau en étape 2 */
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Créneau sélectionné
                  </p>
                  <p className="font-bold text-sm" style={{ color: catCfg?.bgBarHex }}>
                    {catCfg?.label}
                  </p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">
                    {formatDateFull(selectedSlot.date)} à {formatTime(selectedSlot.date)}
                    {catInfo && (
                      <span className="text-slate-500 font-normal">
                        {" "}({catInfo.durationLabel} de vol)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="font-bold text-2xl text-blue-600">{basePrice}€</p>
                  {selectedSlot.acomptePrice && (
                    <p className="text-xs text-slate-500">
                      Acompte aujourd&apos;hui :{" "}
                      <span className="font-semibold text-slate-700">{selectedSlot.acomptePrice}€</span>
                      {" · "}solde sur place :{" "}
                      <span className="font-semibold text-slate-700">
                        {basePrice - selectedSlot.acomptePrice}€
                      </span>
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    onClick={() => {
                      setSelectedSlot(null);
                      setSelectedCategory("");
                      setShowForm(false);
                    }}
                  >
                    Changer de créneau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── ÉTAPE 2 ── */}
        {showForm && selectedSlot && selectedCategory && (
          <>
            <Separator id="participant-form-separator" />
            <div
              id="participant-form"
              className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500"
            >
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  Vos informations
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  Renseignez les informations du participant pour finaliser la réservation
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Pour qui */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-slate-800">
                    Pour qui réservez-vous ?
                  </Label>
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
                            participantType === val
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "border-slate-200",
                          )}
                        >
                          <div className="text-center">
                            <div className={cn(
                              "font-semibold text-base",
                              participantType === val ? "text-blue-700" : "text-slate-800",
                            )}>
                              {val === "self" ? "Pour moi" : "Pour quelqu'un d'autre"}
                            </div>
                            <div className={cn(
                              "text-xs mt-1",
                              participantType === val ? "text-blue-600" : "text-slate-500",
                            )}>
                              {val === "self"
                                ? "Mes informations seront sauvegardées"
                                : "Cadeau ou réservation tierce"}
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
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
                      Identité
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName", { required: "Prénom requis" })}
                          placeholder={participantType === "self" ? "Votre prénom" : "Prénom du participant"}
                          className="mt-1"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName", { required: "Nom requis" })}
                          placeholder={participantType === "self" ? "Votre nom" : "Nom du participant"}
                          className="mt-1"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Date de naissance *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        {...register("birthDate", { required: "Requise" })}
                        className="mt-1"
                      />
                      {errors.birthDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
                      Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email", { required: "Email requis" })}
                          placeholder="email@exemple.com"
                          className="mt-1"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          {...register("phone", { required: "Requis" })}
                          placeholder="06 12 34 56 78"
                          className="mt-1"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
                      Informations physiques
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Poids (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          {...register("weight", {
                            required: "Requis",
                            min: { value: 20, message: "Min 20kg" },
                            max: { value: 120, message: "Max 120kg" },
                          })}
                          placeholder="70"
                          className="mt-1"
                        />
                        {errors.weight && (
                          <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="height">Taille (cm) *</Label>
                        <Input
                          id="height"
                          type="number"
                          {...register("height", {
                            required: "Requise",
                            min: { value: 120, message: "Min 120cm" },
                            max: { value: 220, message: "Max 220cm" },
                          })}
                          placeholder="175"
                          className="mt-1"
                        />
                        {errors.height && (
                          <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option vidéo */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-800">Options</Label>
                  <button
                    type="button"
                    onClick={() => setHasVideo(!hasVideo)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                      hasVideo
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                      hasVideo ? "bg-blue-600 border-transparent" : "border-slate-300 bg-white",
                    )}>
                      {hasVideo && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <Video className={cn("w-5 h-5 shrink-0", hasVideo ? "text-blue-600" : "text-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-semibold text-sm", hasVideo ? "text-blue-700" : "text-slate-700")}>
                        Option vidéo
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Recevez une vidéo souvenir de votre vol
                      </p>
                    </div>
                    <span className={cn("font-bold text-sm shrink-0", hasVideo ? "text-blue-700" : "text-slate-600")}>
                      +{pricesLoading ? "..." : `${videoOptionPrice}€`}
                    </span>
                  </button>
                </div>

                {/* Récapitulatif */}
                <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Récapitulatif</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">{catCfg?.label}</span>
                      <span className="font-semibold text-slate-800">{basePrice}€</span>
                    </div>
                    {hasVideo && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Video className="w-3 h-3" /> Option vidéo
                        </span>
                        <span className="text-slate-800">+{videoOptionPrice}€</span>
                      </div>
                    )}
                    <hr className="border-slate-300" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-slate-800">Total</span>
                      <span className="font-bold text-2xl text-blue-600">{totalPrice}€</span>
                    </div>
                    {selectedSlot.acomptePrice && (
                      <>
                        <hr className="border-dashed border-slate-200" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Acompte à régler aujourd&apos;hui</span>
                          <span className="font-semibold text-slate-800">
                            {selectedSlot.acomptePrice}€
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Solde à régler sur place</span>
                          <span className="text-slate-600">
                            {totalPrice - selectedSlot.acomptePrice}€
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedSlot(null);
                      setSelectedCategory("");
                      setShowForm(false);
                    }}
                    className="flex-1 h-12"
                    size="lg"
                  >
                    Modifier le créneau
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 h-12" size="lg">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" /> Ajout en cours…
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Dialog: place bloquée */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) router.push("/reserver");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Place temporairement bloquée.
            </DialogTitle>
            <DialogDescription className="text-center text-base space-y-2">
              <p className="font-semibold text-slate-800">
                Votre place est bloquée pendant 1h00
              </p>
              <p className="text-sm">
                Finalisez votre paiement dans l&apos;heure pour confirmer votre réservation.
              </p>
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mt-3">
                <Clock className="w-4 h-4" />
                {(() => {
                  function Countdown({
                    initialSeconds,
                    start,
                  }: {
                    initialSeconds: number;
                    start: boolean;
                  }) {
                    const [s, setS] = useState(initialSeconds);
                    useEffect(() => {
                      if (!start) return;
                      setS(initialSeconds);
                      const id = setInterval(
                        () => setS((p) => (p <= 1 ? (clearInterval(id), 0) : p - 1)),
                        1000,
                      );
                      return () => clearInterval(id);
                    }, [start, initialSeconds]);
                    return (
                      <span className="text-sm font-medium">
                        Temps restant :{" "}
                        {Math.floor(s / 60).toString().padStart(2, "0")}:
                        {(s % 60).toString().padStart(2, "0")}
                      </span>
                    );
                  }
                  return <Countdown initialSeconds={3600} start={showSuccessDialog} />;
                })()}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => { setShowSuccessDialog(false); router.push("/reserver"); }}
              className="w-full gap-2"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4" /> Je continue mes achats
            </Button>
            <Button
              onClick={() => { setShowSuccessDialog(false); router.push("/checkout"); }}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4" /> Voir mon panier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function BaptemeReservationClientPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <BaptemeReservationPageContent />
    </Suspense>
  );
}
