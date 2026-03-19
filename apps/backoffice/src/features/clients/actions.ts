"use server";

import { revalidatePath } from "next/cache";
import { AddClientSchema } from "./schemas";

export async function createClient(data: {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}) {
  const apiKey = process.env.PUBLIC_API_KEY;

  if (!apiKey) {
    throw new Error("PUBLIC_API_KEY is not configured");
  }

  // Validate data with schema
  const validatedData = AddClientSchema.parse(data);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/clients/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(validatedData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Revalidate clients data
    revalidatePath("/dashboard/clients");

    return result;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
}
