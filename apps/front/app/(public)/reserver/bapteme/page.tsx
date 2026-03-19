import React from 'react'
import BaptemeReservationClientPage from './client';

export const metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.serre-chevalier-parapente.fr/reserver/bapteme" },
};

function BaptemeReservationPage() {
  return (
    <BaptemeReservationClientPage/>
  )
}

export default BaptemeReservationPage