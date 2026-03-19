import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetTarifs = () => {
  const query = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const response = await client.api.tarifs.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch tarifs");
      }
      const { data } = await response.json();
      return data;
    },
  });

  return query;
};