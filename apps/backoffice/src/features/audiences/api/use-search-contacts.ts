import { useQuery } from "@tanstack/react-query";

export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ["search-contacts", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await fetch(
        `/api/audiences/contacts/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Erreur de recherche");
      const { data } = await response.json();
      return data;
    },
    enabled: query.length >= 2,
  });
}
