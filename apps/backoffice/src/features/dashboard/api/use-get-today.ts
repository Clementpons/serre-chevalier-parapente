import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetToday = () => {
  return useQuery({
    queryKey: ["dashboard-today"],
    queryFn: async () => {
      const response = await client.api.dashboard.today.$get();
      if (!response.ok) throw new Error("Failed to fetch today activities");
      const { data } = await response.json();
      return data;
    },
  });
};
