import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

//*------------------*//
//Get all stagiaires
//*------------------*//
export const useGetAllStagiaires = ({
  page,
  pageSize,
  sortBy,
  sortOrder,
  search,
  nopaging,
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  nopaging?: boolean;
} = {}) => {
  const query = useQuery({
    queryKey: [
      "stagiaires",
      { page, pageSize, sortBy, sortOrder, search, nopaging },
    ],
    queryFn: async () => {
      const res = await client.api.stagiaires["$get"]({
        query: {
          page: page?.toString(),
          pageSize: pageSize?.toString(),
          sortBy,
          sortOrder,
          search,
          nopaging: nopaging?.toString(),
        },
      });
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

/*------------------*/
// Get stagiaire by ID
/*------------------*/

export const useGetStagiaireById = (id: string) => {
  const query = useQuery({
    queryKey: ["stagiaire", id],
    queryFn: async () => {
      const res = await client.api.stagiaires[":id"].$get({
        param: { id },
      });
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
