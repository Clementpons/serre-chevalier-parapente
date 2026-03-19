import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetAudiences = () => {
  return useQuery({
    queryKey: ["audiences"],
    queryFn: async () => {
      const res = await client.api.audiences["$get"]();
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

export const useGetAudienceById = (id: string) => {
  return useQuery({
    queryKey: ["audiences", id],
    queryFn: async () => {
      const res = await client.api.audiences[":id"]["$get"]({
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

export const useResolveAudience = (id: string) => {
  return useQuery({
    queryKey: ["audiences", id, "resolve"],
    queryFn: async () => {
      const res = await client.api.audiences[":id"].resolve["$get"]({
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
    staleTime: 0,
  });
};
