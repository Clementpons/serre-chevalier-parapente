import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (json: RegisterInput) => {
      const result = await authClient.signUp.email({
        email: json.email,
        password: json.password,
        name: json.name,
      });
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    onSuccess: () => {
      toast.success("Inscription réussie");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'inscription");
    },
  });

  return mutation;
};
