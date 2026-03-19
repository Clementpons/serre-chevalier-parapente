"use client";

import { CalendarScheduleStages } from "@/features/stages/components/calendar-schedule-stages";
import { StageDetailsSheet } from "@/features/stages/components/stage-details-sheet";
import { AddStageDialog } from "./add-stage-dialog";
import { useState, useEffect } from "react";
import { Stage, User, StageBooking, StageType } from "@prisma/client";
import { useGetAllStages } from "@/features/stages/api/use-get-stage";
import { useCreateStage } from "@/features/stages/api/use-create-stage";
import { useCurrent } from "@/features/auth/api/use-current";

// Type for the API response from the server
interface StageApiResponse extends Stage {
  moniteurs: Array<{
    moniteur: User;
  }>;
  bookings: StageBooking[];
}

interface StageWithDetails {
  id: string;
  startDate: Date;
  duration: number;
  places: number;
  price: number;
  acomptePrice: number;
  promotionOriginalPrice: number | null;
  promotionEndDate: Date | null;
  promotionReason: string | null;
  type: StageType;
  createdAt: Date;
  updatedAt: Date;
  moniteurs: Array<{
    moniteur: User;
  }>;
  bookings: any[];
  placesRestantes?: number;
}

export default function Page() {
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStage, setSelectedStage] = useState<StageWithDetails | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch current user for role
  const { data: user } = useCurrent();

  // Fetch stages from API
  const { data: stagesData, isLoading } = useGetAllStages();
  const createStage = useCreateStage();

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

  // Transform API data to match the expected Stage type with additional info
  const stages =
    stagesData?.map((stage: any) => ({
      id: stage.id,
      startDate: new Date(stage.startDate),
      duration: stage.duration,
      places: stage.places,
      price: stage.price,
      acomptePrice: stage.acomptePrice,
      promotionOriginalPrice: stage.promotionOriginalPrice,
      promotionReason: stage.promotionReason ?? null,
      type: stage.type,
      // createdAt/updatedAt not returned by optimized API
      createdAt: new Date(),
      updatedAt: new Date(),
      moniteurs: stage.moniteurs.map((m: any) => ({
        moniteur: {
          id: m.moniteur.id,
          name: m.moniteur.name,
          avatarUrl: m.moniteur.avatarUrl,
          role: m.moniteur.role,
          // Minimal fields for list view
          email: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
      bookings: [], // Bookings are not returned by getAll anymore
      confirmedBookings: stage.confirmedBookings, // New field from API
      bookingsCount: stage.confirmedBookings, // Hack for frontend compatibility if needed, or use specific field
      placesRestantes: stage.availablePlaces, // New field from API
    })) || [];

  // Keep the full data with moniteurs for details sheet
  // Note: bookings will be empty here, need to fetch details on click
  const stagesWithDetails: StageWithDetails[] =
    stagesData?.map((stage: any) => ({
      id: stage.id,
      startDate: new Date(stage.startDate),
      duration: stage.duration,
      places: stage.places,
      price: stage.price,
      acomptePrice: stage.acomptePrice,
      promotionOriginalPrice: stage.promotionOriginalPrice,
      promotionReason: stage.promotionReason ?? null,
      type: stage.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      moniteurs: stage.moniteurs.map((m: any) => ({
        moniteur: {
          id: m.moniteur.id,
          name: m.moniteur.name,
          avatarUrl: m.moniteur.avatarUrl,
          role: m.moniteur.role,
          email: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
      bookings: [],
      placesRestantes: stage.availablePlaces,
    })) || [];

  const handleStageClick = (stage: StageWithDetails) => {
    // Find the full stage data with moniteur info
    const fullStage = stagesWithDetails.find((s) => s.id === stage.id);
    if (fullStage) {
      setSelectedStage(fullStage);
      setShowDetailsSheet(true);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowAddForm(true);
  };

  const handleAddStage = () => {
    setSelectedDate(null);
    setShowAddForm(true);
  };

  const handleCreateStage = (newStage: {
    startDate: Date;
    duration: number;
    places: number;
    moniteurIds: string[];
    price: number;
    acomptePrice: number;
    type: StageType;
  }) => {
    createStage.mutate(
      {
        startDate: newStage.startDate.toISOString(),
        duration: newStage.duration,
        places: newStage.places,
        moniteurIds: newStage.moniteurIds,
        price: newStage.price,
        acomptePrice: newStage.acomptePrice,
        type: newStage.type,
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setSelectedDate(null);
        },
      },
    );
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">
            Chargement des stages...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div className="h-[calc(100vh-120px)]">
        <CalendarScheduleStages
          stages={stages as any}
          onStageClick={handleStageClick}
          onDayClick={handleDayClick}
          onAddStage={handleAddStage}
          role={user?.role ?? undefined}
        />
      </div>

      <AddStageDialog
        open={showAddForm}
        onOpenChange={setShowAddForm}
        selectedDate={selectedDate}
        onCreateStage={handleCreateStage}
        isSubmitting={createStage.isPending}
      />

      <StageDetailsSheet
        open={showDetailsSheet}
        onOpenChange={setShowDetailsSheet}
        stage={selectedStage}
        role={user?.role ?? undefined}
      />
    </main>
  );
}

export const fetchCache = "force-no-store";
