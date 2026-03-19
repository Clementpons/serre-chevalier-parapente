"use client";

import { client } from "@/lib/rpc";
import { Role } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

//*------------------*//
//Get all users
//*------------------*//
export const useGetAllUsers = () => {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await client.api.users["$get"]();
      if (!res.ok) {
        return null;
      }

      const { success, message, data } = await res.json();
      if (!success) {
        toast.error(message);
        return null;
      }
      return { data };
    },
  });
  return query;
};

//*------------------*//
//Get one user by id
//*------------------*//
export const useGetUserById = (id: string) => {
  const query = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await client.api.users[":id"]["$get"]({
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

//*------------------*//
//Get all users by role
//*------------------*//
export const useGetUsersByRole = (role: Role) => {
  const query = useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const res = await client.api.users["by-role"][":role"].$get({
        param: { role },
      });
      if (!res.ok) {
        return null;
      }

      const { success, message, data } = await res.json();
      if (!success) {
        toast.error(message);
        return null;
      }

      const transformedData = data?.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));

      return transformedData;
    },
  });
  return query;
};
