import { useState, useEffect } from "react";

type ProductType = "STAGE" | "BAPTEME";

interface MinPriceResponse {
  success: boolean;
  data: {
    minPrice: number;
    currency: string;
  };
}

const FALLBACK_PRICES: Record<string, number> = {
  // STAGES
  STAGE_INITIATION: 700,
  STAGE_PROGRESSION: 700,
  STAGE_AUTONOMIE: 1200,

  // BAPTEMES
  BAPTEME_AVENTURE: 110,
  BAPTEME_DUREE: 150,
  BAPTEME_LONGUE_DUREE: 185,
  BAPTEME_ENFANT: 90,
  BAPTEME_HIVER: 130,
};

export function useMinPrice(type: ProductType, subType?: string) {
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to construct key for fallback lookup
  const getFallbackKey = () => {
    if (subType) {
      return `${type}_${subType}`;
    }
    return type; // Backup key if needed, though most usages have subtype
  };

  useEffect(() => {
    const fetchMinPrice = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          type: type,
        });

        if (subType) {
          queryParams.append("subType", subType);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/tarifs/min?${queryParams.toString()}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
          },
        );

        const data: MinPriceResponse = await response.json();

        if (data.success && data.data?.minPrice) {
          setMinPrice(data.data.minPrice);
        } else {
          // Fallback if API response is not successful or missing data
          console.warn(
            `Failed to fetch min price for ${type} ${subType}, using fallback`,
          );
          setMinPrice(FALLBACK_PRICES[getFallbackKey()] || 0);
        }
      } catch (err) {
        console.warn(`Error fetching min price for ${type} ${subType}:`, err);
        setError("Impossible de charger le tarif");
        setMinPrice(FALLBACK_PRICES[getFallbackKey()] || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchMinPrice();
  }, [type, subType]);

  return { minPrice, loading, error };
}
