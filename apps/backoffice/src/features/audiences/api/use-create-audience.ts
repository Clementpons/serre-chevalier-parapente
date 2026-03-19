import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.audiences)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.audiences)["$post"]>["json"];

export const useCreateAudience = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.audiences["$post"]({ json });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["audiences"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la création de l'audience"),
  });
};
