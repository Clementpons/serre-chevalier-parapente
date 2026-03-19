import { Metadata } from "next";
import { StagiairesList } from "./stagiaires-list";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Stagiaires",
  description: "Gestion des stagiaires",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:p-8 lg:p-16">
      <StagiairesList />
    </main>
  );
}

export const fetchCache = "force-no-store";
