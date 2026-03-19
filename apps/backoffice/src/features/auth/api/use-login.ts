import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type LoginInput = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (json: LoginInput) => {
      const result = await authClient.signIn.email({
        email: json.email,
        password: json.password,
      });
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    onSuccess: () => {
      toast.success("Connexion réussie");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Identifiants incorrects");
    },
  });

  return mutation;
};
