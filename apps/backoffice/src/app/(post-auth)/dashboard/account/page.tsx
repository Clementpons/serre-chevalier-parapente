import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/actions";
import { AccountSettings } from "./account-settings";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Mon compte",
  description: "Paramètres de votre compte",
};

export default async function Page() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <main className="flex flex-1 flex-col gap-4 p-16">
      <AccountSettings user={user} />
    </main>
  );
}

export const fetchCache = "force-no-store";
