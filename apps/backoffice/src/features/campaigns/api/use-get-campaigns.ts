import { useQuery } from "@tanstack/react-query";

export const useGetCampaigns = () => {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) throw new Error("Erreur lors de la récupération");

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      return result.data;
    },
  });
};
