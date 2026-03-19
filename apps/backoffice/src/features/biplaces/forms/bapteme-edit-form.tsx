"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpdateBapteme } from "@/features/biplaces/api/use-update-bapteme";
import { BaptemeCategory } from "@/features/biplaces/schemas";
import { MultiSelect } from "@/components/ui/multi-select";
import { useGetTarifs } from "@/features/tarifs/api/use-get-tarifs";
import { useGetBaptemeDepositPrice } from "@/features/tarifs/api/use-get-bapteme-deposit-price";

interface BaptemeData {
  id: string;
  date: Date;
  duration: number;
  places: number;
  acomptePrice: number;
  moniteurIds?: string[];
  moniteurs?: Array<{
    moniteur: {
      id: string;
      name: string;
      avatarUrl: string | null;
      role: string;
    };
  }>;
  categories: BaptemeCategory[];
  bookings?: any[];
}

// Labels pour les catégories
const CATEGORY_LABELS: Record<BaptemeCategory, string> = {
  [BaptemeCategory.AVENTURE]: "Aventure",
  [BaptemeCategory.DUREE]: "Durée",
  [BaptemeCategory.LONGUE_DUREE]: "Longue Durée",
  [BaptemeCategory.ENFANT]: "Enfant",
  [BaptemeCategory.HIVER]: "Hiver",
};

interface BaptemeEditFormProps {
  bapteme: BaptemeData;
  onSuccess?: () => void;
  onCancel?: () => void;
  role?: string;
  userId?: string;
}

export function BaptemeEditForm({
  bapteme,
  onSuccess,
  onCancel,
  role,
  userId,
}: BaptemeEditFormProps) {
  const { data: moniteurs, isLoading: isLoadingMoniteurs } =
    useGetMoniteursAndAdmins();
  const { data: tarifs, isLoading: isLoadingTarifs } = useGetTarifs();
  const { data: depositPrice } = useGetBaptemeDepositPrice();
  const updateBapteme = useUpdateBapteme();

  const [formData, setFormData] = useState({
    date: new Date(),
    time: "10:00",
    duration: 120,
    places: 6,
    moniteurIds: [] as string[],
    categories: [] as BaptemeCategory[],
    acomptePrice: bapteme?.acomptePrice || depositPrice?.price || 35,
  });
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState("");

  useEffect(() => {
    if (bapteme) {
      const baptemeDate = new Date(bapteme.date);
      const timeString = `${baptemeDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${baptemeDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Check if duration is a custom value (not in preset options)
      const presetDurations = [60, 90, 120, 150, 180];
      const isCustom = !presetDurations.includes(bapteme.duration);

      const acompteValue = bapteme.acomptePrice || depositPrice?.price || 35;

      setFormData({
        date: baptemeDate,
        time: timeString,
        duration: bapteme.duration,
        places: bapteme.places,
        moniteurIds: bapteme.moniteurs?.map((m) => m.moniteur.id) || [],
        categories: bapteme.categories || [],
        acomptePrice: acompteValue,
      });

      if (isCustom) {
        setIsCustomDuration(true);
        setCustomDuration(bapteme.duration.toString());
      }
    }
  }, [bapteme, depositPrice]);

  // Calculer le nombre minimum de places (nombre de réservations existantes)
  const minPlaces = bapteme?.bookings?.length || 0;
  const isLoading = updateBapteme.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bapteme || formData.moniteurIds.length === 0) {
      return;
    }

    if (formData.categories.length === 0) {
      alert("Veuillez sélectionner au moins une catégorie");
      return;
    }

    // Vérifier que le nombre de places n'est pas inférieur au nombre de réservations
    if (formData.places < minPlaces) {
      alert(
        `Impossible de réduire le nombre de places à ${formData.places}. Il y a déjà ${minPlaces} réservation(s) pour ce baptême.`
      );
      return;
    }

    // Vérifier que l'acompte est défini
    if (!formData.acomptePrice || formData.acomptePrice <= 0) {
      alert("Le montant de l'acompte doit être supérieur à 0€");
      return;
    }

    const [hours, minutes] = formData.time.split(":").map(Number);
    const baptemeDate = new Date(formData.date);
    baptemeDate.setHours(hours, minutes, 0, 0);

    try {
      await updateBapteme.mutateAsync({
        id: bapteme.id,
        date: baptemeDate.toISOString(),
        duration: formData.duration,
        places: formData.places,
        moniteurIds: formData.moniteurIds,
        categories: formData.categories,
        acomptePrice: formData.acomptePrice,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleCategoryChange = (
    category: BaptemeCategory,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-transparent opacity-50 cursor-not-allowed"
          disabled
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(formData.date, "EEEE d MMMM yyyy", { locale: fr })}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Heure</Label>
        <Input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, time: e.target.value }))
          }
          disabled
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Durée (minutes)</Label>
        <Select
          value={isCustomDuration ? "custom" : formData.duration.toString()}
          onValueChange={(value) => {
            if (value === "custom") {
              setIsCustomDuration(true);
              setCustomDuration(formData.duration.toString());
            } else {
              setIsCustomDuration(false);
              setFormData((prev) => ({
                ...prev,
                duration: Number.parseInt(value),
              }));
            }
          }}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">1 heure (60 min)</SelectItem>
            <SelectItem value="90">1h30 (90 min)</SelectItem>
            <SelectItem value="120">2 heures (120 min)</SelectItem>
            <SelectItem value="150">2h30 (150 min)</SelectItem>
            <SelectItem value="180">3 heures (180 min)</SelectItem>
            <SelectItem value="custom">Durée personnalisée</SelectItem>
          </SelectContent>
        </Select>

        {isCustomDuration && (
          <div className="mt-2">
            <Input
              type="number"
              min="1"
              max="600"
              placeholder="Durée en minutes"
              value={customDuration || formData.duration}
              onChange={(e) => {
                const value = e.target.value;
                setCustomDuration(value);
                if (value && !isNaN(Number(value))) {
                  setFormData((prev) => ({
                    ...prev,
                    duration: Number.parseInt(value),
                  }));
                }
              }}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Entrez la durée souhaitée en minutes (1-600)
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="places">Nombre de places</Label>
        <Input
          id="places"
          type="number"
          min={minPlaces}
          max="20"
          value={formData.places}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              places: Number.parseInt(e.target.value) || minPlaces,
            }))
          }
          disabled={isLoading}
          required
        />
        {minPlaces > 0 && (
          <p className="text-xs text-muted-foreground">
            Minimum {minPlaces} place(s) (réservations existantes)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="acomptePrice">Montant de l&apos;acompte (€)</Label>
        <Input
          id="acomptePrice"
          type="number"
          min="0"
          step="0.01"
          value={formData.acomptePrice}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              acomptePrice: Number.parseFloat(e.target.value) || 0,
            }))
          }
          disabled={isLoading || role === "MONITEUR"}
          required
        />
        <p className="text-xs text-muted-foreground">
          Montant à payer lors de la réservation (par défaut:{" "}
          {depositPrice?.price || 35}€)
        </p>
      </div>

      <div className="space-y-3">
        <Label>Catégories de baptêmes disponibles</Label>
        {isLoadingTarifs ? (
          <div className="text-sm text-muted-foreground">
            Chargement des tarifs...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Object.values(BaptemeCategory).map((category) => {
              const tarif = tarifs?.find((t) => t.category === category);
              const price = tarif?.price || 0;

              return (
                <div
                  key={category}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                    isLoading
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    !isLoading &&
                    handleCategoryChange(
                      category,
                      !formData.categories.includes(category)
                    )
                  }
                >
                  <input
                    type="checkbox"
                    id={`edit-${category}`}
                    checked={formData.categories.includes(category)}
                    onChange={() => {}} // Handled by div onClick
                    disabled={isLoading}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded pointer-events-none"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`edit-${category}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {CATEGORY_LABELS[category]}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prix: {price}€
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {formData.categories.length === 0 && (
          <p className="text-xs text-red-500">
            Veuillez sélectionner au moins une catégorie
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="moniteurs">Moniteurs</Label>
        {isLoadingMoniteurs ? (
          <div className="text-sm text-muted-foreground">
            Chargement des moniteurs...
          </div>
        ) : moniteurs && moniteurs.length > 0 ? (
          <MultiSelect
            options={moniteurs.map((moniteur) => ({
              value: moniteur.id,
              label: `${moniteur.name} (${
                moniteur.role === "ADMIN" ? "Admin" : "Moniteur"
              })`,
            }))}
            onValueChange={(values) =>
              setFormData((prev) => ({ ...prev, moniteurIds: values }))
            }
            defaultValue={formData.moniteurIds}
            placeholder="Sélectionner des moniteurs"
            variant="inverted"
            maxCount={3}
            disabled={role === "MONITEUR"}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Aucun moniteur disponible
          </div>
        )}
        {formData.moniteurIds.length === 0 && (
          <p className="text-xs text-red-500">
            Veuillez sélectionner au moins un moniteur
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={updateBapteme.isPending}
            className="flex-1"
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={updateBapteme.isPending}
          className="flex-1"
        >
          {updateBapteme.isPending ? "Modification..." : "Modifier"}
        </Button>
      </div>
    </form>
  );
}
