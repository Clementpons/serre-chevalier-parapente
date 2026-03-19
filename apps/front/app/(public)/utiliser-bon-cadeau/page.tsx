import type { Metadata } from "next";
import UtiliserBonCadeauClient from "./client";

export const metadata: Metadata = {
  title: "Utiliser mon bon cadeau - Serre Chevalier Parapente",
  description:
    "Entrez votre code bon cadeau pour réserver votre stage ou baptême de parapente à Serre Chevalier.",
};

export default function UtiliserBonCadeauPage() {
  return <UtiliserBonCadeauClient />;
}
