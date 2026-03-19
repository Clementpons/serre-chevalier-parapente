import { Metadata } from "next";
import { AudiencesSection } from "./audiences";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Audiences",
  description: "Gestion des audiences pour les campagnes SMS",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-16">
      <AudiencesSection />
    </main>
  );
}

export const fetchCache = "force-no-store";
