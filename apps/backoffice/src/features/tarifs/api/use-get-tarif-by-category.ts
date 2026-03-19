import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { BaptemeCategory } from "@prisma/client";

export const useGetTarifByCategory = (category: BaptemeCategory) => {
  const query = useQuery({
    queryKey: ["tarif", category],
    queryFn: async () => {
      const response = await client.api.tarifs["by-category"][":category"].$get({
        param: { category },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tarif");
      }
      const { data } = await response.json();
      return data;
    },
    enabled: !!category,
  });

  return query;
};