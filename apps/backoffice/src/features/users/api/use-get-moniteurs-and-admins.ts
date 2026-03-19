import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetMoniteursAndAdmins = () => {
  const query = useQuery({
    queryKey: ["moniteurs-and-admins"],
    queryFn: async () => {
      const [moniteursResponse, adminsResponse] = await Promise.all([
        client.api.users["by-role"][":role"].$get({
          param: { role: "MONITEUR" }
        }),
        client.api.users["by-role"][":role"].$get({
          param: { role: "ADMIN" }
        })
      ]);

      if (!moniteursResponse.ok || !adminsResponse.ok) {
        throw new Error("Failed to fetch moniteurs and admins");
      }

      const [moniteursResult, adminsResult] = await Promise.all([
        moniteursResponse.json(),
        adminsResponse.json()
      ]);

      if (!moniteursResult.success || !adminsResult.success) {
        throw new Error("Failed to fetch moniteurs and admins");
      }

      const combined = [...(moniteursResult.data || []), ...(adminsResult.data || [])];
      const uniqueUsers = combined.filter((user, index, self) =>
        index === self.findIndex(u => u.id === user.id)
      );

      const transformedData = uniqueUsers.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));

      return transformedData;
    },
  });

  return query;
};
