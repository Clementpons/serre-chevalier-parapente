"use client";

import { useMinPrice } from "@/hooks/useMinPrice";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MinPriceDisplayProps {
  type: "STAGE" | "BAPTEME";
  subType?: string;
  className?: string;
  fallbackPrice?: number; // Optional manual override fallback
}

export function MinPriceDisplay({
  type,
  subType,
  className,
  fallbackPrice,
  durationDays,
  priceClassName,
}: MinPriceDisplayProps & {
  durationDays?: number;
  priceClassName?: string;
}) {
  const { minPrice, loading, error } = useMinPrice(type, subType);

  if (loading) {
    return (
      <div
        className={cn(
          "text-xs text-slate-500 flex items-center gap-2",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Chargement...</span>
      </div>
    );
  }

  // Determine the price to show: API price > manual fallback prop > hook fallback
  const priceDisplay = minPrice !== null ? minPrice : fallbackPrice;

  if (error && priceDisplay === null) {
    return null;
  }

  if (priceDisplay === null || priceDisplay === undefined || priceDisplay === 0)
    return null;

  const dailyPrice = durationDays ? priceDisplay / durationDays : null;

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <span className="text-xs text-slate-500 uppercase font-semibold">
        À partir de
      </span>
      <span className={cn("text-3xl font-bold text-slate-900", priceClassName)}>
        {priceDisplay?.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        €
      </span>
      {dailyPrice !== null && (
        <span className="text-sm mt-1">
          soit{" "}
          {dailyPrice.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          € / jour
        </span>
      )}
    </div>
  );
}
