import { Metadata } from "next";
import { Tarifs } from "./tarifs";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Tarifs",
  description: "Gestion des tarifs des baptêmes bi-places",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-16">
      <Tarifs />
    </main>
  );
}

export const fetchCache = "force-no-store";