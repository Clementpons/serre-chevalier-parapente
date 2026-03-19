"use client";

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { BaptemeAddForm } from "./bapteme-add-form";
import { useCreateBapteme } from "@/features/biplaces/api/use-create-bapteme";
import { BaptemeCategory } from "@/features/biplaces/schemas";
import { useRouter } from "next/navigation";

interface BaptemeData {
  date: Date;
  duration: number;
  places: number;
  moniteurIds: string[];
  categories: BaptemeCategory[];
  acomptePrice: number;
}

interface BaptemeBiPlaceAddFormProps {
  onSuccess?: () => void;
  role?: string;
  userId?: string;
}

export function BaptemeBiPlaceAddForm({
  onSuccess,
  role,
  userId,
}: BaptemeBiPlaceAddFormProps) {
  const createBapteme = useCreateBapteme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(
    undefined
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get date and hour from URL parameters only on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const dateParam = urlParams.get("date");
      const hourParam = urlParams.get("hour");

      if (dateParam) {
        setSelectedDate(new Date(dateParam));
      }

      if (hourParam) {
        setSelectedHour(parseInt(hourParam));
      }
    }
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div>Chargement...</div>;
  }

  const handleSubmit = async (baptemeData: BaptemeData) => {
    try {
      // Convert to the format expected by the API
      const apiData = {
        date: baptemeData.date.toISOString(),
        duration: baptemeData.duration,
        places: baptemeData.places,
        moniteurIds: baptemeData.moniteurIds,
        categories: baptemeData.categories,
        acomptePrice: baptemeData.acomptePrice,
      };
      
      await createBapteme.mutateAsync(apiData);

      // Redirect to biplaces page after successful creation
      router.push("/dashboard/biplaces");

      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la création du baptême:", error);
    }
  };

  return (
    <BaptemeAddForm
      selectedDate={selectedDate}
      selectedHour={selectedHour}
      onSubmit={handleSubmit}
      role={role}
      userId={userId}
      isSubmitting={createBapteme.isPending}
    />
  );
}

export default BaptemeBiPlaceAddForm;
