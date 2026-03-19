import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetVideoOptionPrice = () => {
  const query = useQuery({
    queryKey: ["video-option-price"],
    queryFn: async () => {
      const response = await client.api.tarifs["video-option"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch video option price");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};