import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetReservationDetails = (id: string) => {
  const query = useQuery({
    queryKey: ["reservation-details", id],
    queryFn: async () => {
      const response = await client.api.reservations[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reservation details");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!id,
  });

  return query;
};