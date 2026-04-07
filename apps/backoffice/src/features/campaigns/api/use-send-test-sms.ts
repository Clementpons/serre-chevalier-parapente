import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendTestSms = () => {
  return useMutation({
    mutationFn: async ({
      message,
      recipients,
    }: {
      message: string;
      recipients: string[];
    }) => {
      const response = await fetch("/api/campaigns/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, recipients }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Erreur serveur");
      return result.data as { phone: string; success: boolean; error?: string }[];
    },
    onSuccess: (data) => {
      const sent = data.filter((r) => r.success).length;
      const failed = data.filter((r) => !r.success).length;
      if (failed === 0) {
        toast.success(`${sent} SMS de test envoyé(s) avec succès`);
      } else {
        toast.warning(`${sent} envoyé(s), ${failed} échec(s) — vérifiez les numéros`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'envoi du SMS de test");
    },
  });
};
