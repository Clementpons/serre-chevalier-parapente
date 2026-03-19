import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetBaptemeDepositPrice = () => {
  const query = useQuery({
    queryKey: ["bapteme-deposit-price"],
    queryFn: async () => {
      const response = await client.api.tarifs.baptemes.deposit.$get();
      
      if (!response.ok) {
        throw new Error("Failed to fetch bapteme deposit price");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};