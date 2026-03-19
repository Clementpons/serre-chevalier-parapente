import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetPayments = () => {
  const query = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await client.api.payments.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};