import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetPromoCodes = () => {
  return useQuery({
    queryKey: ["promocodes"],
    queryFn: async () => {
      const res = await client.api.promocodes["$get"]();
      if (!res.ok) return null;
      const { success, message, data } = await res.json();
      if (!success) {
        toast.error(message);
        return null;
      }
      return data;
    },
  });
};

export const useGetPromoCodeById = (id: string) => {
  return useQuery({
    queryKey: ["promocodes", id],
    queryFn: async () => {
      const res = await client.api.promocodes[":id"]["$get"]({
        param: { id },
      });
      if (!res.ok) return null;
      const { success, message, data } = await res.json();
      if (!success) {
        toast.error(message);
        return null;
      }
      return data;
    },
    enabled: !!id,
  });
};
