"use server";

import { revalidatePath } from "next/cache";
import { AddStagiaireSchema } from "./schemas";

export async function createStagiaire(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: Date;
  height: number;
  weight: number;
}) {
  const apiKey = process.env.PUBLIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("PUBLIC_API_KEY is not configured");
  }

  // Validate data with schema
  const validatedData = AddStagiaireSchema.parse(data);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stagiaires/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Revalidate stagiaires data
    revalidatePath("/dashboard/stagiaires");
    
    return result;
  } catch (error) {
    console.error("Error creating stagiaire:", error);
    throw error;
  }
}