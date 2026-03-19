"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { LoaderIcon } from "@/lib/icons";
import Link from "next/link";
import PasswordSecurityTest from "@/features/auth/components/password-security-test";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPassword = form.watch("newPassword");
  const isPending = form.formState.isSubmitting;

  async function onSubmit(values: Values) {
    if (!token) {
      setError("Lien invalide ou expiré. Veuillez refaire une demande.");
      return;
    }
    setError(null);
    const { error: authError } = await authClient.resetPassword({
      newPassword: values.newPassword,
      token,
    });
    if (authError) {
      setError(
        authError.code === "INVALID_TOKEN"
          ? "Ce lien est invalide ou a expiré. Veuillez refaire une demande."
          : authError.message ?? "Une erreur est survenue."
      );
      return;
    }
    router.push("/sign-in?reset=success");
  }

  if (!token) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Lien invalide</CardTitle>
          <CardDescription className="text-center text-balance">
            Ce lien de réinitialisation est invalide ou a expiré.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline">
            Faire une nouvelle demande
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="text-center text-balance">
          Choisissez un nouveau mot de passe pour votre compte.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {newPassword.length > 0 && (
              <PasswordSecurityTest password={newPassword} />
            )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Répéter le mot de passe"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <LoaderIcon className="size-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
