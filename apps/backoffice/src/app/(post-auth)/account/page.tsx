import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCurrent } from "@/features/auth/actions";
import LogoutButton from "@/features/auth/components/logout-button";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: "Stage de Parapente - Votre compte | Bienvenue !",
  description: "",
};

export default async function AccountPage() {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }
  if (user?.role === "ADMIN" || user?.role === "MONITEUR") {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen w-screen">
      <p>Hello {user.name}</p>
      <p>
        Bienvenue sur votre compte, vous pouvez y gérer vos informations
        personnelles.
      </p>
      <p>Vous pouvez aussi vous déconnecter.</p>
      <p>{user.email}</p>
      <Avatar>
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
        <AvatarFallback>
          {user.name[0]}
          {user.name[1]}
        </AvatarFallback>
      </Avatar>
      <LogoutButton />
    </main>
  );
}
