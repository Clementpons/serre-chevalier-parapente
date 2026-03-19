import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.users)[":id"]["role"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.users)[":id"]["role"]["$patch"]
>;

export const useUpdateUserRole = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.users[":id"].role["$patch"]({ param, json });
      return await response.json();
    },
    onSuccess: (response, { json }) => {
      if (response.success) {
        toast.success(response.message);

        queryClient.invalidateQueries({ queryKey: ["users", json.role] });
        queryClient.invalidateQueries({ queryKey: ["users", response.data?.role] });

        router.refresh();
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
