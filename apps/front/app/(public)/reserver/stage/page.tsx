import React from "react";
import StageReservationClientPage from "./client";

export const metadata = {
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://www.serre-chevalier-parapente.fr/reserver/stage",
  },
};

function StageReservationPage() {
  return <StageReservationClientPage />;
}

export default StageReservationPage;
