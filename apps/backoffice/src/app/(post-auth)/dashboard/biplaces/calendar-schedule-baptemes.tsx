"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CalendarIcon } from "@/lib/icons";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
  addMinutes,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Bapteme, User, BaptemeBooking } from "@prisma/client";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BaptemeWithDetails extends Bapteme {
  moniteurs: Array<{
    moniteur: User;
  }>;
  bookings: BaptemeBooking[];
  placesRestantes: number;
}

interface BaptemeCalendarProps {
  baptemes: any[];
  onBaptemeClick: (bapteme: any) => void;
  onHourClick: (date: Date, hour?: number) => void;
  onAddBapteme: () => void;
  role?: string;
  userId?: string;
}

type CalendarView = "week" | "month" | "day";

export function CalendarScheduleBaptemes({
  baptemes,
  onBaptemeClick,
  onHourClick,
  onAddBapteme,
  role,
  userId,
}: BaptemeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(new Date());

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigatePrevious = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "day") {
      const newDate = new Date(selectedDayDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDayDate(newDate);
    }
  };

  const navigateNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "day") {
      const newDate = new Date(selectedDayDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDayDate(newDate);
    }
  };

  const handleDayClickInternal = (date: Date, hour?: number) => {
    setSelectedDayDate(date);
    setView("day");
  };

  const getDateRange = () => {
    if (view === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    }
  };

  const { start, end } = getDateRange();
  const days = eachDayOfInterval({ start, end });

  const getBaptemesForDay = (date: Date) => {
    return baptemes.filter((bapteme) =>
      isSameDay(new Date(bapteme.date), date)
    );
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  const getEndTime = (bapteme: Bapteme) => {
    const startTime = new Date(bapteme.date);
    const endTime = addMinutes(startTime, bapteme.duration);
    return endTime;
  };

  // Get color for a single category (light mode)
  const getCategoryColorLight = (category: string) => {
    switch (category) {
      case "AVENTURE":
        return "rgb(16, 185, 129)"; // emerald-500
      case "DUREE":
        return "rgb(249, 115, 22)"; // orange-500
      case "ENFANT":
        return "rgb(99, 102, 241)"; // indigo-500
      case "HIVER":
        return "rgb(100, 116, 139)"; // slate-500
      case "LONGUE_DUREE":
        return "rgb(234, 179, 8)"; // yellow-500
      default:
        return "rgb(59, 130, 246)"; // blue-500 (fallback)
    }
  };

  // Get color for a single category (dark mode - more vibrant)
  const getCategoryColorDark = (category: string) => {
    switch (category) {
      case "AVENTURE":
        return "rgb(52, 211, 153)"; // emerald-400
      case "DUREE":
        return "rgb(251, 146, 60)"; // orange-400
      case "ENFANT":
        return "rgb(129, 140, 248)"; // indigo-400
      case "HIVER":
        return "rgb(148, 163, 184)"; // slate-400
      case "LONGUE_DUREE":
        return "rgb(250, 204, 21)"; // yellow-400
      default:
        return "rgb(96, 165, 250)"; // blue-400 (fallback)
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    switch (category) {
      case "AVENTURE":
        return "Aventure";
      case "DUREE":
        return "Durée";
      case "ENFANT":
        return "Enfant";
      case "HIVER":
        return "Hiver";
      case "LONGUE_DUREE":
        return "Longue Durée";
      default:
        return category;
    }
  };

  // Get background style based on bapteme categories
  // If multiple categories: neutral background with colored border at bottom
  // If single category: solid color background
  const getBaptemeBackgroundStyle = (bapteme: Bapteme) => {
    const categories = bapteme.categories || [];
    const isDark = document.documentElement.classList.contains("dark");

    if (categories.length === 0) {
      return {
        backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
      };
    }

    if (categories.length === 1) {
      return {
        backgroundColor: isDark
          ? getCategoryColorDark(categories[0])
          : getCategoryColorLight(categories[0]),
      };
    }

    // Multiple categories: neutral background (darker in dark mode)
    return {
      backgroundColor: isDark ? "rgb(71, 85, 105)" : "rgb(212, 212, 216)", // slate-600 : neutral-300
    };
  };

  // Generate the colored border for multiple categories
  const getCategoryBorder = (bapteme: Bapteme) => {
    const categories = bapteme.categories || [];
    const isDark = document.documentElement.classList.contains("dark");

    if (categories.length <= 1) {
      return null;
    }

    // Create sections for each category
    const sectionWidth = 100 / categories.length;

    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 flex">
        {categories.map((cat, index) => (
          <div
            key={`${cat}-${index}`}
            style={{
              backgroundColor: isDark
                ? getCategoryColorDark(cat)
                : getCategoryColorLight(cat),
              width: `${sectionWidth}%`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = eachDayOfInterval({ start, end });
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const HOUR_HEIGHT = 60; // Height of each hour slot in pixels

    // Function to check if two baptemes overlap
    const baptemesOverlap = (bapteme1: Bapteme, bapteme2: Bapteme) => {
      const start1 = new Date(bapteme1.date);
      const end1 = addMinutes(start1, bapteme1.duration);
      const start2 = new Date(bapteme2.date);
      const end2 = addMinutes(start2, bapteme2.duration);

      return start1 < end2 && start2 < end1;
    };

    // Calculate position, height, z-index and horizontal offset for each bapteme
    const getBaptemeStyle = (
      bapteme: Bapteme,
      dayBaptemes: Bapteme[],
      baptemeIndex: number
    ) => {
      const baptemeStart = new Date(bapteme.date);
      const baptemeEnd = addMinutes(baptemeStart, bapteme.duration);

      const startHour = baptemeStart.getHours();
      const startMinutes = baptemeStart.getMinutes();
      const durationInHours = bapteme.duration / 60;

      const topOffset =
        startHour * HOUR_HEIGHT + (startMinutes * HOUR_HEIGHT) / 60;
      const height = durationInHours * HOUR_HEIGHT;

      // Calculate z-index: use lower values to avoid dialog issues
      // Earlier baptemes have lower z-index (appear behind)
      const timeValue =
        baptemeStart.getHours() * 60 + baptemeStart.getMinutes();
      const zIndex = 1 + Math.floor(timeValue / 60); // 1-24 range

      // Calculate horizontal offset and width for overlapping baptemes
      let leftOffset = 4; // Default left margin
      let widthPercentage = 85; // Base width (85% to leave space for clicking)

      // Find overlapping baptemes (including those with same start time)
      const overlappingBaptemes = dayBaptemes.filter(
        (other) => other.id !== bapteme.id && baptemesOverlap(bapteme, other)
      );

      // Sort overlapping baptemes by start time, then by ID for consistency
      const sortedOverlapping = overlappingBaptemes.sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (timeA === timeB) {
          return a.id.localeCompare(b.id); // Consistent ordering for same time
        }
        return timeA - timeB;
      });

      // Find how many baptemes start before or at the same time as this one
      const baptemesBeforeOrSame = sortedOverlapping.filter((other) => {
        const otherTime = new Date(other.date).getTime();
        const currentTime = baptemeStart.getTime();
        return (
          otherTime < currentTime ||
          (otherTime === currentTime && other.id < bapteme.id)
        );
      });

      // Calculate offset and width based on position in the stack (up to 5 levels)
      const stackPosition = baptemesBeforeOrSame.length;
      const maxLevels = 5;

      if (stackPosition > 0) {
        // Each level: 12% offset to the right, 8% reduction in width
        const offsetPerLevel = 12; // 12% offset per level
        const widthReductionPerLevel = 8; // 8% width reduction per level

        const actualLevel = Math.min(stackPosition, maxLevels);
        const totalOffset = actualLevel * offsetPerLevel;
        const totalWidthReduction = actualLevel * widthReductionPerLevel;

        // Calculate left offset (convert percentage to approximate pixels)
        leftOffset = 4 + totalOffset * 0.01 * 100;

        // Calculate width: base width minus reduction, ensuring it stays within 85% boundary
        widthPercentage = Math.max(25, 85 - totalWidthReduction); // Minimum 25% width

        // Ensure the right edge doesn't exceed 85% of the container
        const rightEdgePercentage = totalOffset + widthPercentage;
        if (rightEdgePercentage > 85) {
          widthPercentage = 85 - totalOffset;
          widthPercentage = Math.max(15, widthPercentage); // Minimum 15% width
        }
      }

      return {
        position: "absolute" as const,
        top: `${topOffset}px`,
        height: `${height}px`,
        left: `${leftOffset}px`,
        width: `${widthPercentage}%`,
        zIndex: zIndex,
        ...getBaptemeBackgroundStyle(bapteme),
      };
    };

    return (
      <div className="flex flex-col h-full">
        {/* Week header */}
        <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-30">
          <div className="p-2 text-sm font-medium text-muted-foreground bg-background sticky left-0 z-40 border-r">
            Heure
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 ${
                isToday(day) ? "bg-primary/10 font-semibold" : ""
              }`}
              onClick={() => {
                if (role === "ADMIN" || role === "MONITEUR") {
                  onHourClick(day);
                }
              }}
            >
              <div className="text-sm font-medium">
                {format(day, "EEE", { locale: fr })}
              </div>
              <div className={`text-lg ${isToday(day) ? "text-primary" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="flex-1 overflow-auto">
          <TooltipProvider>
            <div className="grid grid-cols-8 relative">
              {/* Hour labels and empty cells */}
              {hours.map((hour) => (
                <React.Fragment key={hour}>
                  <div
                    className="p-2 text-xs text-muted-foreground border-b border-r bg-background sticky left-0 z-20"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dayName = format(day, "EEEE", { locale: fr });
                    const tooltipText = `Ajouter un baptême ${dayName} à ${hour
                      .toString()
                      .padStart(2, "0")}h`;

                    // Determine if this hour is in the grayed-out periods
                    const isNightEarly = hour >= 0 && hour < 6; // 00h-6h
                    const isNightLate = hour >= 20 && hour < 24; // 20h-00h
                    const isGrayedOut = isNightEarly || isNightLate;
                    const isWorkHour = !isGrayedOut;

                    // Add thicker border at 6h and 20h boundaries
                    const isTopBoundary = hour === 6;
                    const isBottomBoundary = hour === 19;

                    return (
                      <Tooltip key={`${day.toISOString()}-${hour}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`relative border-b border-r cursor-pointer transition-colors group/hour ${
                              isWorkHour
                                ? "bg-background hover:bg-muted/30"
                                : "bg-muted/10"
                            }`}
                            style={{ height: `${HOUR_HEIGHT}px` }}
                            onClick={() => {
                              if (role === "ADMIN" || role === "MONITEUR") {
                                onHourClick(day, hour);
                              }
                            }}
                          >
                            {/* Only render baptemes on the first hour they appear */}
                            {hour === 0 &&
                              (() => {
                                const dayBaptemes = getBaptemesForDay(day);
                                return dayBaptemes.map((bapteme, index) => (
                                  <div
                                    key={bapteme.id}
                                    style={getBaptemeStyle(
                                      bapteme,
                                      dayBaptemes,
                                      index
                                    )}
                                    className={`rounded-md p-1.5 text-xs cursor-pointer hover:opacity-90 shadow-md border transition-all overflow-hidden relative ${
                                      bapteme.categories &&
                                      bapteme.categories.length > 1
                                        ? "text-gray-900 dark:text-gray-100 border-gray-400 dark:border-slate-500"
                                        : "text-white border-white/20 dark:border-white/30"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onBaptemeClick(bapteme);
                                    }}
                                  >
                                    {/* Affichage adaptatif selon la durée */}
                                    {bapteme.duration <= 60 ? (
                                      // Créneau court (1h ou moins) - affichage compact horizontal
                                      <>
                                        <div
                                          className={`font-medium text-xs mb-0.5 truncate ${
                                            bapteme.categories &&
                                            bapteme.categories.length > 1
                                              ? "text-gray-900 dark:text-gray-100"
                                              : "text-white"
                                          }`}
                                        >
                                          {formatTime(new Date(bapteme.date))} -{" "}
                                          {formatTime(getEndTime(bapteme))}
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                          <div
                                            className={`text-xs font-medium truncate flex-1 ${
                                              bapteme.categories &&
                                              bapteme.categories.length > 1
                                                ? "text-gray-700 dark:text-gray-300"
                                                : "text-white/90"
                                            }`}
                                          >
                                            {bapteme.categories &&
                                            bapteme.categories.length > 0 ? (
                                              <>
                                                {formatCategoryName(
                                                  bapteme.categories[0]
                                                )}
                                                {bapteme.categories.length >
                                                  1 && (
                                                  <span
                                                    className={`ml-0.5 ${
                                                      bapteme.categories
                                                        .length > 1
                                                        ? "text-gray-600 dark:text-gray-400"
                                                        : "text-white/70"
                                                    }`}
                                                  >
                                                    +
                                                    {bapteme.categories.length -
                                                      1}
                                                  </span>
                                                )}
                                              </>
                                            ) : (
                                              "Sans cat."
                                            )}
                                          </div>
                                          <div
                                            className={`font-bold text-xs rounded px-1.5 py-0.5 whitespace-nowrap ${
                                              bapteme.categories &&
                                              bapteme.categories.length > 1
                                                ? "bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900"
                                                : "bg-white/20 dark:bg-white/30 text-white"
                                            }`}
                                          >
                                            {bapteme.placesRestantes}/
                                            {bapteme.places}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      // Créneau long (plus de 1h) - affichage vertical complet
                                      <>
                                        <div
                                          className={`font-medium text-xs mb-1 ${
                                            bapteme.categories &&
                                            bapteme.categories.length > 1
                                              ? "text-gray-900 dark:text-gray-100"
                                              : "text-white"
                                          }`}
                                        >
                                          {formatTime(new Date(bapteme.date))} -{" "}
                                          {formatTime(getEndTime(bapteme))}
                                        </div>

                                        {/* Categories */}
                                        <div
                                          className={`text-xs font-medium mb-1 ${
                                            bapteme.categories &&
                                            bapteme.categories.length > 1
                                              ? "text-gray-700 dark:text-gray-300"
                                              : "text-white/90"
                                          }`}
                                        >
                                          {bapteme.categories &&
                                          bapteme.categories.length > 0 ? (
                                            <>
                                              {formatCategoryName(
                                                bapteme.categories[0]
                                              )}
                                              {bapteme.categories.length >
                                                1 && (
                                                <span
                                                  className={`ml-1 ${
                                                    bapteme.categories.length >
                                                    1
                                                      ? "text-gray-600 dark:text-gray-400"
                                                      : "text-white/70"
                                                  }`}
                                                >
                                                  +
                                                  {bapteme.categories.length -
                                                    1}
                                                </span>
                                              )}
                                            </>
                                          ) : (
                                            "Sans catégorie"
                                          )}
                                        </div>

                                        {/* Moniteurs */}
                                        <div
                                          className={`text-xs mb-1 truncate ${
                                            bapteme.categories &&
                                            bapteme.categories.length > 1
                                              ? "text-gray-600 dark:text-gray-400"
                                              : "text-white/80"
                                          }`}
                                        >
                                          {bapteme.moniteurs?.length > 0
                                            ? bapteme.moniteurs.length === 1
                                              ? bapteme.moniteurs[0].moniteur
                                                  .name
                                              : `${
                                                  bapteme.moniteurs[0].moniteur
                                                    .name
                                                } +${
                                                  bapteme.moniteurs.length - 1
                                                }`
                                            : "Aucun moniteur"}
                                        </div>

                                        {/* Places - mise en valeur */}
                                        <div
                                          className={`font-bold text-sm rounded px-2 py-0.5 inline-block ${
                                            bapteme.categories &&
                                            bapteme.categories.length > 1
                                              ? "bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900"
                                              : "bg-white/20 dark:bg-white/30 text-white"
                                          }`}
                                        >
                                          {bapteme.placesRestantes}/
                                          {bapteme.places} places
                                        </div>
                                      </>
                                    )}

                                    {/* Liseré coloré pour les créneaux multi-catégories */}
                                    {getCategoryBorder(bapteme)}
                                  </div>
                                ));
                              })()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const HOUR_HEIGHT = 50; // Hauteur réduite pour tenir dans l'écran (24h * 50px = 1200px)
    const dayBaptemes = getBaptemesForDay(selectedDayDate);

    // Extraire tous les moniteurs uniques de la journée avec leurs horaires et avatars
    const monitorsSchedule = new Map<
      string,
      {
        id: string;
        name: string;
        avatarUrl: string;
        minHour: number;
        maxHour: number;
        baptemes: any[];
      }
    >();

    dayBaptemes.forEach((bapteme) => {
      bapteme.moniteurs?.forEach((m: any) => {
        const monitorId = m.moniteur.id;
        const startHour = new Date(bapteme.date).getHours();
        const endHour = startHour + Math.ceil(bapteme.duration / 60);

        if (monitorsSchedule.has(monitorId)) {
          const existing = monitorsSchedule.get(monitorId)!;
          existing.minHour = Math.min(existing.minHour, startHour);
          existing.maxHour = Math.max(existing.maxHour, endHour);
          existing.baptemes.push(bapteme);
        } else {
          monitorsSchedule.set(monitorId, {
            id: monitorId,
            name: m.moniteur.name,
            avatarUrl: m.moniteur.avatarUrl,
            minHour: startHour,
            maxHour: endHour,
            baptemes: [bapteme],
          });
        }
      });
    });

    return (
      <div className="flex flex-col md:flex-row h-full gap-4">
        {/* Left side: Day schedule */}
        <div className="flex-1 flex flex-col border-r">
          <div className="border-b bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Planning de la journée</h2>
              <div className="text-sm text-muted-foreground">
                {dayBaptemes.length} baptême{dayBaptemes.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <TooltipProvider>
              <div className="grid grid-cols-[80px_1fr] relative">
                {/* Hour labels and schedule */}
                {hours.map((hour) => (
                  <React.Fragment key={hour}>
                    <div
                      className="p-2 text-xs font-medium text-muted-foreground border-b border-r bg-muted/20 flex items-center justify-center"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    >
                      {hour.toString().padStart(2, "0")}h
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`border-b cursor-pointer hover:bg-accent/50 relative transition-colors ${
                            (hour >= 0 && hour < 6) || (hour >= 20 && hour < 24)
                              ? "bg-muted/30 dark:bg-muted/20"
                              : "bg-card dark:bg-card"
                          } ${
                            hour === 6
                              ? "border-t-[2px] border-t-primary/40"
                              : ""
                          } ${
                            hour === 19
                              ? "border-b-[2px] border-b-primary/40"
                              : ""
                          }`}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          onClick={() => onHourClick(selectedDayDate, hour)}
                        >
                          {/* Render baptemes at hour 0 */}
                          {hour === 0 &&
                            dayBaptemes.map((bapteme, index) => {
                              const baptemeStart = new Date(bapteme.date);
                              const startHour = baptemeStart.getHours();
                              const startMinutes = baptemeStart.getMinutes();
                              const durationInHours = bapteme.duration / 60;

                              const topOffset =
                                startHour * HOUR_HEIGHT +
                                (startMinutes * HOUR_HEIGHT) / 60;
                              const height = durationInHours * HOUR_HEIGHT;

                              return (
                                <div
                                  key={bapteme.id}
                                  style={{
                                    position: "absolute",
                                    top: `${topOffset}px`,
                                    height: `${height}px`,
                                    left: "4px",
                                    right: "4px",
                                    zIndex: 1 + startHour,
                                    ...getBaptemeBackgroundStyle(bapteme),
                                  }}
                                  className={`rounded-md p-1.5 text-xs cursor-pointer hover:opacity-90 shadow-md border transition-all overflow-hidden relative ${
                                    bapteme.categories &&
                                    bapteme.categories.length > 1
                                      ? "text-gray-900 dark:text-gray-100 border-gray-400 dark:border-slate-500"
                                      : "text-white border-white/20 dark:border-white/30"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onBaptemeClick(bapteme);
                                  }}
                                >
                                  {/* Affichage compact pour tous les créneaux */}
                                  <div
                                    className={`font-bold text-xs mb-0.5 truncate ${
                                      bapteme.categories &&
                                      bapteme.categories.length > 1
                                        ? "text-gray-900 dark:text-gray-100"
                                        : "text-white"
                                    }`}
                                  >
                                    {formatTime(new Date(bapteme.date))} -{" "}
                                    {formatTime(getEndTime(bapteme))}
                                  </div>

                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <div
                                      className={`text-xs font-medium truncate flex-1 ${
                                        bapteme.categories &&
                                        bapteme.categories.length > 1
                                          ? "text-gray-700 dark:text-gray-300"
                                          : "text-white/90"
                                      }`}
                                    >
                                      {bapteme.categories &&
                                      bapteme.categories.length > 0 ? (
                                        <>
                                          {formatCategoryName(
                                            bapteme.categories[0]
                                          )}
                                          {bapteme.categories.length > 1 && (
                                            <span
                                              className={`ml-0.5 ${
                                                bapteme.categories.length > 1
                                                  ? "text-gray-600 dark:text-gray-400"
                                                  : "text-white/70"
                                              }`}
                                            >
                                              +{bapteme.categories.length - 1}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        "Sans cat."
                                      )}
                                    </div>
                                    <div
                                      className={`font-bold text-xs rounded px-1.5 py-0.5 whitespace-nowrap ${
                                        bapteme.categories &&
                                        bapteme.categories.length > 1
                                          ? "bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900"
                                          : "bg-white/20 dark:bg-white/30 text-white"
                                      }`}
                                    >
                                      {bapteme.placesRestantes}/{bapteme.places}
                                    </div>
                                  </div>

                                  {getCategoryBorder(bapteme)}
                                </div>
                              );
                            })}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Ajouter un baptême à{" "}
                          {hour.toString().padStart(2, "0")}h
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </React.Fragment>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Right side: Monitors list */}
        <div className="w-full md:w-80 flex flex-col mb-4 sm:mb-0">
          <div className="border-b bg-muted/30 p-3">
            <h2 className="text-lg font-bold">Moniteurs de service</h2>
            <div className="text-xs text-muted-foreground mt-1">
              {monitorsSchedule.size} moniteur
              {monitorsSchedule.size > 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            {monitorsSchedule.size === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Aucun moniteur assigné pour cette journée
              </div>
            ) : (
              Array.from(monitorsSchedule.entries()).map(([id, schedule]) => (
                <div
                  key={id}
                  className="bg-card border rounded-lg p-3 hover:shadow-md transition-all hover:border-primary/50"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center overflow-hidden border border-primary/20">
                        <Avatar className="h-full w-full rounded-lg bg-foreground">
                          {schedule.avatarUrl ? (
                            <AvatarImage
                              src={schedule.avatarUrl ?? undefined}
                              alt={schedule.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="text-lg font-bold text-primary">
                              {schedule.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1 truncate">
                        {schedule.name}
                      </div>

                      {/* Amplitude horaire */}
                      <div className="bg-primary/20 dark:bg-primary/30 rounded px-2 py-1 mb-2">
                        <div className="text-xs font-medium text-primary">
                          {schedule.minHour.toString().padStart(2, "0")}h00 -{" "}
                          {schedule.maxHour.toString().padStart(2, "0")}h00
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {schedule.maxHour - schedule.minHour}h de service
                        </div>
                      </div>

                      {/* Nombre de baptêmes */}
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {schedule.baptemes.length}
                        </span>{" "}
                        baptême{schedule.baptemes.length > 1 ? "s" : ""} assigné
                        {schedule.baptemes.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    // Get all days to display (including previous/next month days for complete weeks)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
      <div className="flex flex-col h-full">
        {/* Month header */}
        <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-20">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarDays.map((day) => {
            const dayBaptemes = getBaptemesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={`border-r last:border-r-0 border-b p-2 cursor-pointer hover:bg-muted/50 min-h-[120px] relative overflow-visible ${
                  !isCurrentMonth ? "text-muted-foreground bg-muted/20" : ""
                } ${isToday(day) ? "bg-primary/10" : ""}`}
                onClick={() => {
                  if (role === "ADMIN" || role === "MONITEUR") {
                    onHourClick(day);
                  }
                }}
              >
                <div
                  className={`text-sm mb-1 ${
                    isToday(day) ? "font-bold text-primary" : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayBaptemes.slice(0, 3).map((bapteme) => (
                    <div
                      key={bapteme.id}
                      className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-90 relative overflow-hidden transition-all ${
                        bapteme.categories && bapteme.categories.length > 1
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-white"
                      }`}
                      style={getBaptemeBackgroundStyle(bapteme)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBaptemeClick(bapteme);
                      }}
                    >
                      <div
                        className={`font-medium text-xs mb-0.5 truncate ${
                          bapteme.categories && bapteme.categories.length > 1
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-white"
                        }`}
                      >
                        {formatTime(new Date(bapteme.date))} -{" "}
                        {formatTime(getEndTime(bapteme))}
                      </div>

                      {/* Categories */}
                      <div
                        className={`text-xs mb-0.5 truncate ${
                          bapteme.categories && bapteme.categories.length > 1
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-white opacity-90"
                        }`}
                      >
                        {bapteme.categories && bapteme.categories.length > 0 ? (
                          <>
                            {formatCategoryName(bapteme.categories[0])}
                            {bapteme.categories.length > 1 && (
                              <span
                                className={`ml-1 ${
                                  bapteme.categories.length > 1
                                    ? "text-gray-600 dark:text-gray-400"
                                    : "opacity-70"
                                }`}
                              >
                                +{bapteme.categories.length - 1}
                              </span>
                            )}
                          </>
                        ) : (
                          "Sans catégorie"
                        )}
                      </div>

                      <div className="text-xs flex items-center justify-between gap-1">
                        <span
                          className={`truncate flex-1 min-w-0 ${
                            bapteme.categories && bapteme.categories.length > 1
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-white opacity-80"
                          }`}
                        >
                          {bapteme.moniteurs?.length > 0
                            ? bapteme.moniteurs.length === 1
                              ? bapteme.moniteurs[0].moniteur.name
                              : `${bapteme.moniteurs[0].moniteur.name} +${
                                  bapteme.moniteurs.length - 1
                                }`
                            : "Aucun moniteur"}
                        </span>
                        <span
                          className={`font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${
                            bapteme.categories && bapteme.categories.length > 1
                              ? "bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900"
                              : "bg-white/20 dark:bg-white/30 text-white"
                          }`}
                        >
                          {bapteme.placesRestantes}/{bapteme.places}
                        </span>
                      </div>

                      {/* Liseré coloré pour les créneaux multi-catégories */}
                      {getCategoryBorder(bapteme)}
                    </div>
                  ))}
                  {dayBaptemes.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayBaptemes.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 border-b gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              <CalendarIcon className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Aujourd&apos;hui</span>
              <span className="xs:hidden">Today</span>
            </Button>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold capitalize truncate">
            {view === "day"
              ? format(selectedDayDate, "EEEE d MMMM yyyy", { locale: fr })
              : format(currentDate, "MMMM yyyy", { locale: fr })}
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Select
            value={view}
            onValueChange={(value: CalendarView) => setView(value)}
          >
            <SelectTrigger className="w-24 sm:w-32 flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
            </SelectContent>
          </Select>

          {role === "ADMIN" && (
            <Button onClick={onAddBapteme} className="flex-shrink-0">
              <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau Baptême</span>
              <span className="sm:hidden">Baptême</span>
            </Button>
          )}
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-auto">
        <div
          className={`${
            view === "week"
              ? "min-w-[1000px]"
              : view === "month"
              ? "min-w-[700px]"
              : "min-w-0"
          } h-full`}
        >
          {view === "day"
            ? renderDayView()
            : view === "week"
            ? renderWeekView()
            : renderMonthView()}
        </div>
      </div>
    </div>
  );
}
