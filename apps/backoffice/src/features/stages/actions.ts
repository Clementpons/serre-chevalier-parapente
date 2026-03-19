"use server";

import { revalidatePath } from "next/cache";

export async function getAllStages() {
  const apiKey = process.env.PUBLIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("PUBLIC_API_KEY is not configured");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching stages:", error);
    throw error;
  }
}