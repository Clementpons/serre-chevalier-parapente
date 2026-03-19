"use client";

import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

//*------------------*//
//Get all baptemes
//*------------------*//
export const useGetAllBaptemes = () => {
  const query = useQuery({
    queryKey: ["baptemes"],
    queryFn: async () => {
      try {
        const res = await client.api.baptemes.$get();
        if (!res.ok) {
          toast.error("Erreur lors de la récupération des créneaux");
          return null;
        }

        const { success, message, data } = await res.json();
        if (!success) {
          toast.error(message);
          return null;
        }
        return data;
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la récupération des créneaux");
        return null;
      }
    },
  });

  return query;
};

export const useGetBaptemeById = (id: string) => {
  const query = useQuery({
    queryKey: ["bapteme", id],
    queryFn: async () => {
      const res = await client.api.baptemes[":id"].$get({ param: { id } });
      if (!res.ok) {
        return null;
      }

      const { success, message, data } = await res.json();
      if (!success) {
        toast.error(message);
        return null;
      }
      return data;
    },
  });

  return query;
};
