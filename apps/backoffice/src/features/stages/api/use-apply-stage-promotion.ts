import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.stages)[":id"]["promote"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.stages)[":id"]["promote"]["$patch"]
>;

export const useApplyStagePromotion = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.stages[":id"]["promote"]["$patch"]({
        param,
        json,
      });
      return await response.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["stages"] });
        router.refresh();
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erreur lors de l'application de la promotion");
    },
  });

  return mutation;
};
