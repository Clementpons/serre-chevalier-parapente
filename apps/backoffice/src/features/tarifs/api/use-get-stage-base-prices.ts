import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetStageBasePrices = () => {
  const query = useQuery({
    queryKey: ["stage-base-prices"],
    queryFn: async () => {
      const response = await client.api.tarifs.stages.base.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch stage base prices");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};