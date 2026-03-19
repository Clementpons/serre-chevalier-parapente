import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetMonitorSchedule = () => {
  const query = useQuery({
    queryKey: ["monitor-schedule"],
    queryFn: async () => {
      const response = await client.api.dashboard["monitor-schedule"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch monitor schedule");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
