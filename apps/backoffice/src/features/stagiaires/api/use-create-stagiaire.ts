import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStagiaire } from "../actions";

type RequestType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: Date;
  height: number;
  weight: number;
};

export const useCreateStagiaire = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, RequestType>({
    mutationFn: async (data) => {
      return await createStagiaire(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["stagiaires"] });
        router.refresh();
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du stagiaire");
    },
  });

  return mutation;
};