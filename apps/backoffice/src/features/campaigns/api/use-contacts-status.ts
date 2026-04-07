import { useQuery } from "@tanstack/react-query";

export interface ContactWithStatus {
  phone: string;
  name: string | null;
  sent: boolean;
  failed: boolean;
  sentAt: string | null;
  error: string | null;
}

export function useContactsStatus(id: string, enabled = false) {
  return useQuery({
    queryKey: ["campaign-contacts-status", id],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${id}/contacts-status`);
      if (!response.ok) throw new Error("Erreur lors du chargement des contacts");
      const json = await response.json();
      if (!json.success) throw new Error(json.message);
      return json.data as {
        contacts: ContactWithStatus[];
        sentCount: number;
        total: number;
      };
    },
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      // Rafraîchit toutes les 3s si un envoi vient d'avoir lieu
      return query.state.data ? false : 3000;
    },
  });
}
