import React from "react";
import BonCadeauReservationClientPage from "./client";

export const metadata = {
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://www.serre-chevalier-parapente.fr/reserver/bon-cadeau",
  },
};

function BonCadeauReservationPage() {
  return <BonCadeauReservationClientPage />;
}

export default BonCadeauReservationPage;
