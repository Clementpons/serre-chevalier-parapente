"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bapteme, User } from "@prisma/client";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  TagIcon,
  MailIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
} from "@/lib/icons";
import { useState } from "react";
import { EditBaptemeDialog } from "./edit-bapteme-dialog";
import { useDeleteBapteme } from "@/features/biplaces/api/use-delete-bapteme";
import { useCreateBapteme } from "@/features/biplaces/api/use-create-bapteme";
import { BaptemeCategory } from "@/features/biplaces/schemas";

interface BaptemeWithMoniteurs extends Omit<Bapteme, "categories"> {
  moniteurs: Array<{
    moniteur: User;
  }>;
  bookings?: any[];
  categories: BaptemeCategory[];
}

// Labels pour les catégories
const CATEGORY_LABELS: Record<BaptemeCategory, string> = {
  [BaptemeCategory.AVENTURE]: "Aventure",
  [BaptemeCategory.DUREE]: "Durée",
  [BaptemeCategory.LONGUE_DUREE]: "Longue Durée",
  [BaptemeCategory.ENFANT]: "Enfant",
  [BaptemeCategory.HIVER]: "Hiver",
};

// Prix pour chaque catégorie
const CATEGORY_PRICES: Record<BaptemeCategory, number> = {
  [BaptemeCategory.AVENTURE]: 110,
  [BaptemeCategory.DUREE]: 150,
  [BaptemeCategory.LONGUE_DUREE]: 185,
  [BaptemeCategory.ENFANT]: 90,
  [BaptemeCategory.HIVER]: 130,
};

interface BaptemeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bapteme: BaptemeWithMoniteurs | null;
  role?: string;
  userId?: string;
}

export function BaptemeDetailsDialog({
  open,
  onOpenChange,
  bapteme,
  role,
  userId,
}: BaptemeDetailsDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const deleteBapteme = useDeleteBapteme();
  const createBapteme = useCreateBapteme();

  if (!bapteme) return null;

  const hasBookings =
    (bapteme as any).confirmedBookings > 0 ||
    (bapteme.bookings && bapteme.bookings.length > 0);
  const isAssigned = bapteme.moniteurs.some((m) => m.moniteur.id === userId);
  const canEdit = role === "ADMIN" || (role === "MONITEUR" && isAssigned);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    if (hasBookings) {
      alert(
        "Ce baptême ne peut pas être supprimé car il contient des réservations.",
      );
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer ce baptême ?")) {
      try {
        await deleteBapteme.mutateAsync({
          id: bapteme.id,
        });
        onOpenChange(false);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleDuplicate = async () => {
    if (selectedDates.length === 0) return;

    setIsDuplicating(true);

    const sourceHour = bapteme.date.getHours();
    const sourceMinute = bapteme.date.getMinutes();
    const moniteurIds = bapteme.moniteurs.map((m) => m.moniteur.id);

    try {
      for (const date of selectedDates) {
        const targetDate = new Date(date);
        targetDate.setHours(sourceHour, sourceMinute, 0, 0);

        await createBapteme.mutateAsync({
          date: targetDate.toISOString(),
          duration: bapteme.duration,
          places: bapteme.places,
          categories: bapteme.categories,
          moniteurIds,
          acomptePrice: bapteme.acomptePrice,
        });
      }

      setShowDuplicateDialog(false);
      setSelectedDates([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h${remainingMinutes.toString().padStart(2, "0")}`;
  };

  const endTime = new Date(bapteme.date);
  endTime.setMinutes(endTime.getMinutes() + bapteme.duration);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du Baptême</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {format(bapteme.date, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(bapteme.date, "HH:mm", { locale: fr })} -{" "}
                    {format(endTime, "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Durée</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(bapteme.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Places disponibles</p>
                  <p className="text-sm text-muted-foreground">
                    {bapteme.places} personnes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TagIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Catégories disponibles</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bapteme.categories && bapteme.categories.length > 0 ? (
                      bapteme.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs bg-primary/20 text-primary-foreground border-primary/30"
                        >
                          {CATEGORY_LABELS[category]} ({CATEGORY_PRICES[category]}
                          €)
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aucune catégorie définie
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-5 w-5 flex items-center justify-center text-primary font-bold">
                  €
                </div>
                <div>
                  <p className="font-medium">Montant de l&apos;acompte</p>
                  <p className="text-sm text-muted-foreground">
                    {bapteme.acomptePrice}€ à payer lors de la réservation
                  </p>
                </div>
              </div>
            </div>

            {/* Informations des moniteurs */}
            <div className="border-t border-border pt-4">
              <h3 className="font-medium mb-3">
                Moniteur{bapteme.moniteurs.length > 1 ? "s" : ""} assigné
                {bapteme.moniteurs.length > 1 ? "s" : ""}
              </h3>
              <div className="space-y-3">
                {bapteme.moniteurs.map((moniteurData, index) => (
                  <div
                    key={moniteurData.moniteur.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage
                        src={moniteurData.moniteur.avatarUrl ?? undefined}
                        alt={moniteurData.moniteur.name}
                      />
                      <AvatarFallback>
                        {moniteurData.moniteur.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {moniteurData.moniteur.name}
                        </p>
                        <Badge
                          variant={
                            moniteurData.moniteur.role === "ADMIN"
                              ? "default"
                              : "secondary"
                          }
                          className="bg-primary/20"
                        >
                          {moniteurData.moniteur.role === "ADMIN"
                            ? "Admin"
                            : "Moniteur"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="h-4 w-4 text-primary" />
                        <span>{moniteurData.moniteur.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Membre depuis{" "}
                        {format(moniteurData.moniteur.createdAt, "MMMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDuplicateDialog(true)}
                  className="flex items-center gap-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  Dupliquer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <EditIcon className="h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={hasBookings || deleteBapteme.isPending}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  {deleteBapteme.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>

        <EditBaptemeDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          bapteme={bapteme}
          role={role}
          userId={userId}
        />
      </Dialog>

      {/* Dialog de duplication */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dupliquer vers d&apos;autres dates</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les dates sur lesquelles dupliquer ce baptême
              ({format(bapteme.date, "HH:mm", { locale: fr })},{" "}
              {formatDuration(bapteme.duration)},{" "}
              {bapteme.places} places).
            </p>

            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates ?? [])}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              locale={fr}
              className="rounded-md border mx-auto"
            />

            {selectedDates.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} sélectionnée{selectedDates.length > 1 ? "s" : ""}
                </span>
                {" : "}
                {selectedDates
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map((d) => format(d, "d MMM", { locale: fr }))
                  .join(", ")}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicateDialog(false);
                setSelectedDates([]);
              }}
              disabled={isDuplicating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={selectedDates.length === 0 || isDuplicating}
            >
              {isDuplicating
                ? `Création en cours...`
                : `Dupliquer (${selectedDates.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
