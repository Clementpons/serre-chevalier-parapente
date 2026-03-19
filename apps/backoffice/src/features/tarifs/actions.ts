"use server";

import prisma from "@/lib/prisma";
import { BaptemeCategory } from "@prisma/client";

export async function getAllTarifs() {
  try {
    const tarifs = await prisma.baptemeCategoryPrice.findMany({
      orderBy: {
        category: "asc",
      },
    });
    return tarifs;
  } catch (error) {
    console.error("Error fetching tarifs:", error);
    throw new Error("Failed to fetch tarifs");
  }
}

export async function getTarifByCategory(category: BaptemeCategory) {
  try {
    const tarif = await prisma.baptemeCategoryPrice.findUnique({
      where: {
        category,
      },
    });
    return tarif;
  } catch (error) {
    console.error("Error fetching tarif:", error);
    throw new Error("Failed to fetch tarif");
  }
}

export async function updateTarif(category: BaptemeCategory, price: number) {
  try {
    const tarif = await prisma.baptemeCategoryPrice.upsert({
      where: {
        category,
      },
      update: {
        price,
      },
      create: {
        category,
        price,
      },
    });
    return tarif;
  } catch (error) {
    console.error("Error updating tarif:", error);
    throw new Error("Failed to update tarif");
  }
}