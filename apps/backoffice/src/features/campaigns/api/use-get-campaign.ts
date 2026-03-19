import { useQuery } from "@tanstack/react-query";

export const useGetCampaignById = (id: string) => {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${id}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération");

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      return result.data;
    },
    enabled: !!id,
  });
};
