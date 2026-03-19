import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetTopBar = () => {
  const query = useQuery({
    queryKey: ["topbar"],
    queryFn: async () => {
      const response = await client.api.content.topbar.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch topbar content");
      }
      const { data, success } = await response.json();
      return success ? data : null;
    },
  });

  return query;
};
