import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDashboardStats = (selectedMonth?: string) => {
  const query = useQuery({
    queryKey: ["dashboard-stats", selectedMonth ?? "current"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (client.api.dashboard.stats.$get as any)(
        selectedMonth ? { query: { selectedMonth } } : {}
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
