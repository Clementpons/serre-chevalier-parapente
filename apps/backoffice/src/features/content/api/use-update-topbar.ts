import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.content.topbar)["$put"]
>;
type RequestType = InferRequestType<
  (typeof client.api.content.topbar)["$put"]
>["json"];

export const useUpdateTopBar = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.content.topbar.$put({ json });

      if (!response.ok) {
        throw new Error("Failed to update topbar content");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["topbar"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error("Échec de la mise à jour du bandeau");
    },
  });

  return mutation;
};
