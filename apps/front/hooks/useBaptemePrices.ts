import { useState, useEffect } from "react";

export interface Tariff {
  category: string;
  price: number;
}

const DEFAULT_PRICES: Record<string, number> = {
  AVENTURE: 110,
  DUREE: 150,
  LONGUE_DUREE: 185,
  ENFANT: 90,
  HIVER: 130,
};

const DEFAULT_VIDEO_PRICE = 25;

export function useBaptemePrices() {
  const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [videoOptionPrice, setVideoOptionPrice] = useState<number>(DEFAULT_VIDEO_PRICE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/tarifs/all`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const { baptemeCategories, videoOption } = result.data;

            if (Array.isArray(baptemeCategories)) {
              const pricesMap: Record<string, number> = { ...DEFAULT_PRICES };
              baptemeCategories.forEach((t: any) => {
                if (t.category && t.price) {
                  pricesMap[t.category] = t.price;
                }
              });
              setPrices(pricesMap);
            }

            if (videoOption?.price) {
              setVideoOptionPrice(videoOption.price);
            }
          }
        } else {
          setError("Failed to fetch prices");
        }
      } catch (err) {
        console.error("Erreur chargement prix:", err);
        setError("Error loading prices");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const getPrice = (category: string) => {
    return prices[category] || DEFAULT_PRICES[category] || 110;
  };

  return { prices, videoOptionPrice, loading, error, getPrice };
}
