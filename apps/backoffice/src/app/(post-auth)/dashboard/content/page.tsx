import { Metadata } from "next";
import TopBarFront from "./topbar-front";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Contenu Site Web",
  description: "Gestion du contenu du site web (Front Public)",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-16">
      <TopBarFront />
    </main>
  );
}

export const fetchCache = "force-no-store";