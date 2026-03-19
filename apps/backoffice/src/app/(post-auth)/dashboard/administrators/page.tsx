import { Metadata } from "next";
import { Admins } from "./admins";
export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Administrateurs",
  description: "",
};

export default async function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-16">
      <Admins />
    </main>
  );
}

export const fetchCache = "force-no-store";
