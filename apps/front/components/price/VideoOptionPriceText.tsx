"use client";

import { useBaptemePrices } from "@/hooks/useBaptemePrices";

export function VideoOptionPriceText() {
  const { videoOptionPrice, loading } = useBaptemePrices();
  return (
    <p className="text-slate-600 text-sm mt-1">
      + Option vidéo :{" "}
      {loading ? (
        <span className="inline-block w-12 h-3.5 bg-slate-200 animate-pulse rounded align-middle" />
      ) : (
        `${videoOptionPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`
      )}
    </p>
  );
}
