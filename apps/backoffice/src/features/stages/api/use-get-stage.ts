"use client";

import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllStages } from "../actions";

//*------------------*//
//Get all stages
//*------------------*//
export const useGetAllStages = () => {
  const query = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      try {
        const result = await getAllStages();
        if (!result.success) {
          toast.error(result.message);
          return null;
        }
        return result.data;
      } catch (error) {
        toast.error("Erreur lors de la récupération des stages");
        return null;
      }
    },
  });

  return query;
};

export const useGetStageById = (id: string) => {
  const query = useQuery({
    queryKey: ["stage", id],
    queryFn: async () => {
      const res = await client.api.stages[":id"].$get({ param: { id } });
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
