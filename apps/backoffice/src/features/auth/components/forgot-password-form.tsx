"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const isPending = form.formState.isSubmitting;

  async function onSubmit(values: Values) {
    // better-auth ne révèle pas si l'email existe (sécurité)
    await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email envoyé</CardTitle>
          <CardDescription className="text-center text-balance">
            Si un compte existe avec cette adresse, vous recevrez un email avec
            un lien pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="mt-4 text-center">
          <Link
            href="/sign-in"
            className="text-sm text-primary hover:underline">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Mot de passe oublié</CardTitle>
        <CardDescription className="text-center text-balance">
          Saisissez votre adresse email pour recevoir un lien de
          réinitialisation.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="votre@email.fr"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <LoaderIcon className="size-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer le lien"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <Separator />
      <CardContent className="mt-4">
        <div className="flex justify-center text-xs text-primary">
          <Link href="/sign-in" className="hover:underline cursor-pointer">
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
