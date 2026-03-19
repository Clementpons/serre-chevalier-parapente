"use client";

import { useMinPrice } from "@/hooks/useMinPrice";

interface StagePriceBadgeProps {
  stageType: "INITIATION" | "PROGRESSION" | "AUTONOMIE";
}

export function StagePriceBadge({ stageType }: StagePriceBadgeProps) {
  const { minPrice, loading } = useMinPrice("STAGE", stageType);

  const display = loading
    ? "..."
    : minPrice !== null
      ? `À partir de ${minPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`
      : "Tarif sur demande";

  return (
    <p className="text-white bg-blue-600 border border-blue-600 rounded-full py-1 px-4 inline-flex items-center">
      {display}
    </p>
  );
}
