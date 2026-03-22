"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/lib/icons";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
  addDays,
} from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageCalendarProps {
  stages: any[];
  onStageClick: (stage: any) => void;
  onDayClick: (date: Date) => void;
  onAddStage: () => void;
  role?: string;
}

type CalendarView = "week" | "month";

// ─── Config couleurs (aligné frontend) ────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { hex: string; label: string; shortLabel: string }
> = {
  INITIATION: { hex: "#38bdf8", label: "Stage d'initiation", shortLabel: "Initiation" },
  PROGRESSION: { hex: "#3b82f6", label: "Stage de progression", shortLabel: "Progression" },
  AUTONOMIE: { hex: "#1e40af", label: "Stage d'autonomie", shortLabel: "Autonomie" },
  DOUBLE: { hex: "#8b5cf6", label: "Stage double", shortLabel: "Double" },
};

const DAY_NAMES = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStageEndDate(stage: any): Date {
  return addDays(new Date(stage.startDate), stage.duration - 1);
}

/** Stages démarrant ce jour OU continuant depuis la semaine précédente (affichés le lundi) */
function getStagesForDay(stages: any[], day: Date, dayIndex: number, weekStart: Date) {
  const starting = stages.filter((s) => {
    const start = new Date(s.startDate);
    return (
      start.getFullYear() === day.getFullYear() &&
      start.getMonth() === day.getMonth() &&
      start.getDate() === day.getDate()
    );
  });

  const continuing =
    dayIndex === 0
      ? stages.filter((s) => {
          const start = new Date(s.startDate);
          const end = getStageEndDate(s);
          return start < weekStart && end >= day;
        })
      : [];

  return [...continuing, ...starting];
}

/** Nombre de jours que le stage occupe à partir de ce jour dans cette semaine */
function getSpanDays(stage: any, day: Date, dayIndex: number, weekStart: Date, totalCols: number) {
  const stageStart = new Date(stage.startDate);
  const stageEnd = getStageEndDate(stage);
  const isContinuing = stageStart < weekStart;

  if (isContinuing) {
    const daysToEnd = Math.floor((stageEnd.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(daysToEnd, totalCols);
  } else {
    const remaining = totalCols - dayIndex;
    return Math.min(stage.duration, remaining);
  }
}

// ─── Tooltip portal ───────────────────────────────────────────────────────────

interface TooltipData {
  stage: any;
  x: number;
  y: number;
}

function StageTooltip({ data }: { data: TooltipData }) {
  const { stage, x, y } = data;
  const cfg = TYPE_CONFIG[stage.type] ?? { hex: "#94a3b8", label: stage.type, shortLabel: stage.type };
  const placesRestantes = stage.placesRestantes ?? 0;
  const confirmedBookings = stage.confirmedBookings ?? stage.bookings?.length ?? 0;
  const hasPromo = !!(stage.promotionOriginalPrice);

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: x + 14,
        top: y - 10,
        transform: "translateY(-100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 space-y-2 max-w-[230px]">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.hex }}
          />
          <span className="text-sm font-semibold text-slate-800 leading-tight">
            {cfg.label}
          </span>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div>
            <span className="text-slate-400">Moniteur(s) : </span>
            {stage.moniteurs?.length > 0
              ? stage.moniteurs.length === 1
                ? stage.moniteurs[0].moniteur.name
                : `${stage.moniteurs[0].moniteur.name} +${stage.moniteurs.length - 1}`
              : "—"}
          </div>
          <div>
            <span className="text-slate-400">Places restantes : </span>
            <span
              className="font-semibold"
              style={{ color: placesRestantes <= 2 ? "#dc2626" : "#16a34a" }}
            >
              {placesRestantes}
            </span>
            <span className="text-slate-400"> / {stage.places}</span>
          </div>
          <div>
            <span className="text-slate-400">Réservations : </span>
            {confirmedBookings}
          </div>
          <div>
            <span className="text-slate-400">Durée : </span>
            {stage.duration} jour{stage.duration > 1 ? "s" : ""}
          </div>
          {hasPromo ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-red-600">{stage.price}€</span>
              <span className="line-through text-slate-400 text-[11px]">
                {stage.promotionOriginalPrice}€
              </span>
              <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-1 rounded">
                Promo
              </span>
            </div>
          ) : (
            <div>
              <span className="text-slate-400">Prix : </span>
              <span className="font-semibold">{stage.price}€</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Carte de stage ───────────────────────────────────────────────────────────

const TYPE_BG: Record<string, string> = {
  INITIATION:  "bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
  PROGRESSION: "bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
  AUTONOMIE:   "bg-purple-100 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100",
  DOUBLE:      "bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100",
};

const TYPE_RING: Record<string, string> = {
  INITIATION:  "ring-blue-400",
  PROGRESSION: "ring-green-400",
  AUTONOMIE:   "ring-purple-400",
  DOUBLE:      "ring-orange-400",
};

interface StageCardProps {
  stage: any;
  spanDays: number;
  dayIndex: number;
  isContinuation: boolean;
  isHovered: boolean;
  isWeekView: boolean;
  stageIndex: number;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

function StageCard({
  stage,
  spanDays,
  dayIndex,
  isContinuation,
  isHovered,
  isWeekView,
  stageIndex,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onClick,
}: StageCardProps) {
  const cfg = TYPE_CONFIG[stage.type] ?? { hex: "#94a3b8", label: stage.type, shortLabel: stage.type };
  const bgCls = TYPE_BG[stage.type] ?? "bg-gray-100 border-gray-200 text-gray-900";
  const ringCls = TYPE_RING[stage.type] ?? "ring-gray-400";

  const placesRestantes = stage.placesRestantes ?? 0;
  const confirmedBookings = stage.confirmedBookings ?? stage.bookings?.length ?? 0;
  const hasPromo = !!(stage.promotionOriginalPrice);
  const moniteurLabel =
    stage.moniteurs?.length > 0
      ? stage.moniteurs.length === 1
        ? stage.moniteurs[0].moniteur.name
        : `${stage.moniteurs[0].moniteur.name} +${stage.moniteurs.length - 1}`
      : null;

  return (
    <div
      className={`relative pointer-events-auto cursor-pointer border rounded-md px-2 py-1 text-xs transition-all ${bgCls} ${
        isHovered ? `ring-2 ${ringCls} shadow-lg z-50` : "border"
      }`}
      style={{
        width: `calc(${spanDays * 100}% + ${(spanDays - 1) * 0.5}px)`,
        zIndex: isHovered ? 50 : 10 + stageIndex,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      {/* Ligne 1 : type + promo */}
      <div className="font-semibold truncate leading-tight flex items-center gap-1">
        {isContinuation && <span className="opacity-60">↪</span>}
        <span className="truncate">{cfg.shortLabel}</span>
        {hasPromo && (
          <span className="flex-shrink-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded leading-tight">
            PROMO
          </span>
        )}
      </div>

      {/* Ligne 2 : moniteurs */}
      {moniteurLabel && (
        <div className="text-[10px] opacity-70 truncate leading-tight">
          {moniteurLabel}
        </div>
      )}

      {/* Ligne 3 : places + réservations + prix */}
      <div className="text-[10px] opacity-80 truncate leading-tight">
        <span className={`font-bold ${placesRestantes <= 2 ? "text-red-600 dark:text-red-400" : ""}`}>
          {placesRestantes} places restantes
        </span>
        {" · "}
        {confirmedBookings} rés.
        {" · "}
        {hasPromo ? (
          <span className="font-semibold text-red-600 dark:text-red-400">
            {stage.price}€{" "}
            <span className="line-through opacity-60">{stage.promotionOriginalPrice}€</span>
          </span>
        ) : (
          <span className="font-semibold">{stage.price}€</span>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function CalendarScheduleStages({
  stages,
  onStageClick,
  onDayClick,
  onAddStage,
  role,
}: StageCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigatePrevious = () => {
    setCurrentDate((d) => view === "week" ? subWeeks(d, 1) : subMonths(d, 1));
  };
  const navigateNext = () => {
    setCurrentDate((d) => view === "week" ? addWeeks(d, 1) : addMonths(d, 1));
  };
  const goToToday = () => setCurrentDate(new Date());

  const handleStageMouseEnter = useCallback(
    (e: React.MouseEvent, stage: any) => {
      setHoveredStageId(stage.id);
      setTooltipData({ stage, x: e.clientX, y: e.clientY });
    },
    []
  );
  const handleStageMouseMove = useCallback(
    (e: React.MouseEvent, stage: any) => {
      setTooltipData({ stage, x: e.clientX, y: e.clientY });
    },
    []
  );
  const handleStageMouseLeave = useCallback(() => {
    setHoveredStageId(null);
    setTooltipData(null);
  }, []);

  // ─── Vue semaine ──────────────────────────────────────────────────────────

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="flex flex-col h-full">
        {/* Entêtes jours */}
        <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-20">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 ${
                isToday(day) ? "bg-primary/10 font-semibold" : ""
              }`}
              onClick={() => role === "ADMIN" && onDayClick(day)}
            >
              <div className="text-sm font-medium">
                {DAY_NAMES[day.getDay() === 0 ? 6 : day.getDay() - 1]}
              </div>
              <div className={`text-lg ${isToday(day) ? "text-primary" : ""}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Corps */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, dayIndex) => {
            const dayStages = getStagesForDay(stages, day, dayIndex, weekStart);
            return (
              <div
                key={day.toISOString()}
                className="border-r last:border-r-0 border-b p-2 cursor-pointer hover:bg-muted/30 min-h-[400px] relative overflow-visible"
                onClick={() => role === "ADMIN" && onDayClick(day)}
              >
                <div className="space-y-1">
                  {dayStages.map((stage, stageIndex) => {
                    const isContinuation = new Date(stage.startDate) < weekStart;
                    const spanDays = getSpanDays(stage, day, dayIndex, weekStart, 7);
                    return (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        spanDays={spanDays}
                        dayIndex={dayIndex}
                        isContinuation={isContinuation}
                        isHovered={hoveredStageId === stage.id}
                        isWeekView
                        stageIndex={stageIndex}
                        onMouseEnter={(e) => handleStageMouseEnter(e, stage)}
                        onMouseLeave={handleStageMouseLeave}
                        onMouseMove={(e) => handleStageMouseMove(e, stage)}
                        onClick={(e) => { e.stopPropagation(); onStageClick(stage); }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Vue mois ─────────────────────────────────────────────────────────────

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < calDays.length; i += 7) {
      weeks.push(calDays.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col h-full">
        {/* Entêtes colonnes */}
        <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-20">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Semaines */}
        <div className="flex-1 flex flex-col">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex-1 grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const dayStages = getStagesForDay(stages, day, dayIndex, week[0]);
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-r last:border-r-0 border-b p-2 cursor-pointer hover:bg-muted/50 min-h-[100px] relative overflow-visible ${
                      !isCurrentMonth ? "text-muted-foreground bg-muted/20" : ""
                    } ${isToday(day) ? "bg-primary/10" : ""}`}
                    onClick={() => role === "ADMIN" && onDayClick(day)}
                  >
                    <div
                      className={`text-sm mb-1 font-medium ${
                        isToday(day) ? "font-bold text-primary" : ""
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayStages.map((stage, stageIndex) => {
                        const isContinuation = new Date(stage.startDate) < week[0];
                        const spanDays = getSpanDays(stage, day, dayIndex, week[0], 7);
                        return (
                          <StageCard
                            key={`${stage.id}-w${weekIndex}`}
                            stage={stage}
                            spanDays={spanDays}
                            dayIndex={dayIndex}
                            isContinuation={isContinuation}
                            isHovered={hoveredStageId === stage.id}
                            isWeekView={false}
                            stageIndex={stageIndex}
                            onMouseEnter={(e) => handleStageMouseEnter(e, stage)}
                            onMouseLeave={handleStageMouseLeave}
                            onMouseMove={(e) => handleStageMouseMove(e, stage)}
                            onClick={(e) => { e.stopPropagation(); onStageClick(stage); }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const headerLabel =
    view === "month"
      ? `${MONTH_NAMES[month]} ${year}`
      : weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${MONTH_NAMES[weekStart.getMonth()]} – ${MONTH_NAMES[weekEnd.getMonth()]} ${year}`;

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-slate-200 bg-white gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="ml-1">
              Aujourd&apos;hui
            </Button>
          </div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {headerLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={view}
            onValueChange={(v: CalendarView) => setView(v)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
            </SelectContent>
          </Select>

          {role === "ADMIN" && (
            <Button onClick={onAddStage} size="sm">
              <PlusIcon className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Nouveau stage</span>
              <span className="sm:hidden">Stage</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contenu calendrier */}
      <div className="flex-1 overflow-auto">
        <div
          className={`${view === "week" ? "min-w-[700px]" : "min-w-[600px]"} h-full`}
        >
          {view === "week" ? renderWeekView() : renderMonthView()}
        </div>
      </div>

      {/* Tooltip portal */}
      {mounted && tooltipData && <StageTooltip data={tooltipData} />}
    </div>
  );
}
