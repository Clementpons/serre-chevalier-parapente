import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useSearchOrders = (query: string) => {
  const queryResult = useQuery({
    enabled: query.length >= 2,
    queryKey: ["orders-search", query],
    queryFn: async () => {
      const response = await client.api.orders.search.$get({
        query: { q: query },
      });

      if (!response.ok) {
        throw new Error("Failed to search orders");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return queryResult;
};