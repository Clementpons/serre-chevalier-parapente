import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetGiftVouchers = () => {
  const query = useQuery({
    queryKey: ["giftvouchers"],
    queryFn: async () => {
      const response = await client.api.giftvouchers.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch gift vouchers");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};