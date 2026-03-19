import React from "react";
import ReserverClientPage from "./client";

export const metadata = {
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://www.serre-chevalier-parapente.fr/reserver",
  },
};

function ReservationPage() {
  return <ReserverClientPage />;
}

export default ReservationPage;
