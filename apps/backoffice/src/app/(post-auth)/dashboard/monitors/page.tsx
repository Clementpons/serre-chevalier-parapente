import { Metadata } from "next";
import { Monitors } from "./monitors";
export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Moniteurs",
  description: "",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-16">
      <Monitors />
    </main>
  );
}

export const fetchCache = "force-no-store";
