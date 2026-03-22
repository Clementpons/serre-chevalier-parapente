import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.stages)[":id"]["promote"]["$delete"]
>;

export const useCancelStagePromotion = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await client.api.stages[":id"]["promote"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: (response, { id }) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["stages"] });
        queryClient.invalidateQueries({ queryKey: ["stage", id] });
        router.refresh();
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation de la promotion");
    },
  });

  return mutation;
};
