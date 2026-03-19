import { Metadata } from "next";
import { ClientsList } from "./clients-list";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Clients",
  description: "Gestion des clients",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:p-8 lg:p-16">
      <ClientsList />
    </main>
  );
}

export const fetchCache = "force-no-store";
