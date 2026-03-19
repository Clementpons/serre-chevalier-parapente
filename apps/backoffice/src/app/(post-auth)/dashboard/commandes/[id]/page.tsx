import { Metadata } from "next";
import { OrderDetails } from "./order-details";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Détails commande",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:p-8 lg:p-16">
      <OrderDetails id={id} />
    </main>
  );
}

export const fetchCache = "force-no-store";
