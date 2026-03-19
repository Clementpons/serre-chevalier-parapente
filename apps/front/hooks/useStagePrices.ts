import { useState, useEffect } from "react";

const DEFAULT_PRICES: Record<string, number> = {
  INITIATION: 700,
  PROGRESSION: 700,
  AUTONOMIE: 1200,
};

export function useStagePrices() {
  const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/tarifs/stages/base`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            const map: Record<string, number> = { ...DEFAULT_PRICES };
            result.data.forEach((item: { stageType: string; price: number }) => {
              map[item.stageType] = item.price;
            });
            setPrices(map);
          }
        }
      } catch (err) {
        console.error("Erreur chargement prix stages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const getPrice = (stageType: string): number =>
    prices[stageType] ?? DEFAULT_PRICES[stageType] ?? 700;

  return { prices, loading, getPrice };
}
