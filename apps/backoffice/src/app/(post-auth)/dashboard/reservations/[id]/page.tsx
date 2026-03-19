import { Metadata } from "next";
import { ReservationDetails } from "./reservation-details";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Détails de la réservation",
  description: "Détails complets d'une réservation",
};

export default async function ReservationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <ReservationDetails id={id} />
    </main>
  );
}

export const fetchCache = "force-no-store";