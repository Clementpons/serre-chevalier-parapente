import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface GetReservationsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "ALL" | "STAGE" | "BAPTEME";
  status?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const useGetReservations = (params: GetReservationsParams = {}) => {
  const query = useQuery({
    queryKey: ["reservations", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.type) searchParams.append("type", params.type);
      if (params.status) searchParams.append("status", params.status);
      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);
      if (params.category) searchParams.append("category", params.category);

      const response = await client.api.reservations.$get({
        query: Object.fromEntries(searchParams),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data = await response.json();
      return data;
    },
  });

  return query;
};