import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

//*------------------*//
//Get all clients
//*------------------*//
export const useGetAllClients = ({
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
      "clients",
      { page, pageSize, sortBy, sortOrder, search, nopaging },
    ],
    queryFn: async () => {
      const res = await client.api.clients["$get"]({
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
// Get client by ID
/*------------------*/

export const useGetClientById = (id: string) => {
  const query = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const res = await client.api.clients[":id"].$get({
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
