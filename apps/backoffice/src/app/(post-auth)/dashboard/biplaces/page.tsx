"use client";

import { CalendarScheduleBaptemes } from "./calendar-schedule-baptemes";
import { AddBaptemeDialog } from "./add-bapteme-dialog";
import { BaptemeDetailsDialog } from "./bapteme-details-dialog";
import { useState, useEffect } from "react";
import { Bapteme, User, BaptemeBooking } from "@prisma/client";
import { useGetAllBaptemes } from "@/features/biplaces/api/use-get-bapteme";
import { useCurrent } from "@/features/auth/api/use-current";
import { useCreateBapteme } from "@/features/biplaces/api/use-create-bapteme";
import { BaptemeCategory } from "@/features/biplaces/schemas";

// Type for the API response from the server
interface BaptemeApiResponse extends Omit<
  Bapteme,
  "categories" | "date" | "createdAt" | "updatedAt"
> {
  date: string; // API returns dates as strings
  createdAt: string;
  updatedAt: string;
  moniteurs: Array<{
    id: string;
    createdAt: string;
    baptemeId: string;
    moniteurId: string;
    moniteur: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
      role: User["role"];
      createdAt: string;
      updatedAt: string;
    };
  }>;
  bookings: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    baptemeId: string;
    stagiaireId: string;
    category: BaptemeCategory;
    hasVideo: boolean;
  }>;
  categories: BaptemeCategory[];
  availablePlaces: number;
  confirmedBookings: number;
  temporaryReservations: number;
}

interface BaptemeWithMoniteurs extends Omit<Bapteme, "categories"> {
  moniteurs: Array<{
    moniteur: User;
  }>;
  categories: BaptemeCategory[];
}

interface BaptemeData {
  date: Date;
  duration: number;
  places: number;
  moniteurIds: string[];
  categories: BaptemeCategory[];
  acomptePrice: number;
}

export default function Page() {
  const { data: user } = useCurrent();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(10); // Default hour
  const [selectedBapteme, setSelectedBapteme] =
    useState<BaptemeWithMoniteurs | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch baptemes from API
  const { data: baptemesData, isLoading } = useGetAllBaptemes();
  const createBapteme = useCreateBapteme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Chargement...</div>
        </div>
      </main>
    );
  }

  // Transform API data to match the expected Bapteme type with additional info
  const baptemes =
    baptemesData?.map((bapteme: any) => ({
      id: bapteme.id,
      date: new Date(bapteme.date),
      duration: bapteme.duration,
      places: bapteme.places,
      categories: bapteme.categories || [],
      moniteurs: bapteme.moniteurs.map((m: any) => ({
        moniteur: {
          id: m.moniteur.id,
          name: m.moniteur.name,
          role: m.moniteur.role,
          email: m.moniteur.email,
          avatarUrl: m.moniteur.avatarUrl,
          createdAt: new Date(), // Not returned by API
          updatedAt: new Date(),
        },
      })),
      bookings: [], // Bookings are not returned by getAll anymore
      confirmedBookings: bapteme.confirmedBookings,
      placesRestantes: bapteme.availablePlaces,
    })) || [];

  // Keep the full data with moniteurs for details dialog
  const baptemesWithMoniteurs: BaptemeWithMoniteurs[] =
    baptemesData?.map((bapteme: any) => ({
      id: bapteme.id,
      date: new Date(bapteme.date),
      duration: bapteme.duration,
      places: bapteme.places,
      acomptePrice: bapteme.acomptePrice,
      categories: bapteme.categories || [],
      createdAt: new Date(), // Not returned by API
      updatedAt: new Date(),
      bookings: [], // Bookings are not returned by getAll anymore
      confirmedBookings: bapteme.confirmedBookings,
      moniteurs: bapteme.moniteurs.map((m: any) => ({
        moniteur: {
          id: m.moniteur.id,
          email: m.moniteur.email,
          name: m.moniteur.name,
          avatarUrl: m.moniteur.avatarUrl,
          role: m.moniteur.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
    })) || [];

  const handleBaptemeClick = (bapteme: Bapteme) => {
    // Find the full bapteme data with moniteurs info
    const fullBapteme = baptemesWithMoniteurs.find((b) => b.id === bapteme.id);
    if (fullBapteme) {
      setSelectedBapteme(fullBapteme);
      setShowDetailsDialog(true);
    }
  };

  const handleHourClick = (date: Date, hour?: number) => {
    setSelectedDate(date);
    setSelectedHour(hour ?? 10);
    setShowAddForm(true);
  };

  const handleAddBapteme = () => {
    setSelectedDate(null);
    setSelectedHour(10);
    setShowAddForm(true);
  };

  const handleCreateBapteme = (newBapteme: BaptemeData) => {
    // Convert to the format expected by the API
    const baptemeData = {
      date: newBapteme.date.toISOString(),
      duration: newBapteme.duration,
      places: newBapteme.places,
      categories: newBapteme.categories,
      moniteurIds: newBapteme.moniteurIds,
      acomptePrice: newBapteme.acomptePrice,
    };

    createBapteme.mutate(baptemeData, {
      onSuccess: () => {
        setShowAddForm(false);
        setSelectedDate(null);
      },
    });
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">
            Chargement des baptêmes...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <CalendarScheduleBaptemes
        baptemes={baptemes as any}
        onBaptemeClick={handleBaptemeClick}
        onHourClick={handleHourClick}
        onAddBapteme={handleAddBapteme}
        role={user?.role ?? undefined}
        userId={user?.id}
      />

      <AddBaptemeDialog
        open={showAddForm}
        onOpenChange={setShowAddForm}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        onCreateBapteme={handleCreateBapteme}
        isSubmitting={createBapteme.isPending}
        role={user?.role ?? undefined}
        userId={user?.id}
      />

      <BaptemeDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        bapteme={selectedBapteme}
        role={user?.role ?? undefined}
        userId={user?.id}
      />
    </main>
  );
}

export const fetchCache = "force-no-store";
