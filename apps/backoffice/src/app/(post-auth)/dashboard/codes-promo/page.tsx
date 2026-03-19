import { Metadata } from "next";
import { PromoCodesSection } from "./codes-promo";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Codes Promo",
  description: "Gestion des codes de réduction",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-16">
      <PromoCodesSection />
    </main>
  );
}

export const fetchCache = "force-no-store";
