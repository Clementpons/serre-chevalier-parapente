import { Metadata } from "next";
import SMSSection from "./sms";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Campagnes SMS",
  description: "Gestion des campagnes SMS",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-16">
      <SMSSection />
    </main>
  );
}

export const fetchCache = "force-no-store";
