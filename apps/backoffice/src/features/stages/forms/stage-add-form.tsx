"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, LoaderIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StageType } from "@prisma/client";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { useGetStageBasePrices } from "@/features/tarifs/api/use-get-stage-base-prices";
import { MultiSelect } from "@/components/ui/multi-select";

interface StageAddFormProps {
  selectedDate?: Date | null;
  onSubmit: (stage: {
    startDate: Date;
    duration: number;
    places: number;
    moniteurIds: string[];
    price: number;
    acomptePrice: number;
    type: StageType;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function StageAddForm({
  selectedDate,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: StageAddFormProps) {
  // Récupérer la liste des moniteurs
  const { data: moniteurs, isLoading: isLoadingMoniteurs } =
    useGetMoniteursAndAdmins();

  // Récupérer les prix de base des stages depuis la configuration
  const { data: stagePrices, isLoading: isLoadingStagePrices } =
    useGetStageBasePrices();

  // Durées par défaut selon le type de stage
  // Durées par défaut selon le type de stage
  const getDefaultDuration = useCallback((type: StageType): number => {
    switch (type) {
      case StageType.AUTONOMIE:
        return 14; // 2 semaines
      case StageType.INITIATION:
      case StageType.PROGRESSION:
      case StageType.DOUBLE:
      default:
        return 7; // 1 semaine
    }
  }, []);

  // Prix par défaut selon le type de stage (depuis la configuration)
  const getDefaultPrice = useCallback(
    (type: StageType): number => {
      if (!stagePrices) {
        // Valeurs de fallback si les prix ne sont pas encore chargés
        switch (type) {
          case StageType.AUTONOMIE:
            return 1200.0;
          case StageType.PROGRESSION:
            return 680.0;
          case StageType.DOUBLE:
          case StageType.INITIATION:
          default:
            return 680.0;
        }
      }

      // DOUBLE utilise le même prix qu'INITIATION (même tarif, même durée)
      const lookupType = type === StageType.DOUBLE ? StageType.INITIATION : type;
      const priceConfig = stagePrices.find((p) => p.stageType === lookupType);
      return priceConfig?.price || 680.0;
    },
    [stagePrices],
  );

  // État du formulaire
  const [formData, setFormData] = useState({
    startDate: selectedDate || new Date(),
    duration: getDefaultDuration(StageType.INITIATION),
    places: 6,
    moniteurIds: [] as string[],
    type: StageType.INITIATION as StageType,
    price: getDefaultPrice(StageType.INITIATION),
    acomptePrice: getDefaultPrice(StageType.INITIATION) * 0.4,
  });
  const [showCalendar, setShowCalendar] = useState(false);

  // Initialiser la durée et le prix selon le type de stage
  useEffect(() => {
    if (stagePrices) {
      setFormData((prev) => ({
        ...prev,
        duration: getDefaultDuration(prev.type),
        price: getDefaultPrice(prev.type),
      }));
    }
  }, [stagePrices, getDefaultDuration, getDefaultPrice]);

  //Modifier le montant de l'acompte d'office quand le prix change (le passer à 2/5 du prix)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      acomptePrice: parseFloat((prev.price * 0.4).toFixed(2)),
    }));
  }, [formData.price]);

  // Mettre à jour la date de début si une date sélectionnée est fournie
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, startDate: selectedDate }));
    }
  }, [selectedDate]);

  // Mettre à jour la durée et le prix quand le type change
  const handleTypeChange = (type: StageType) => {
    const newPrice = getDefaultPrice(type);
    setFormData((prev) => ({
      ...prev,
      type,
      duration: getDefaultDuration(type),
      price: newPrice,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.moniteurIds.length === 0) {
      alert("Veuillez sélectionner au moins un moniteur");
      return;
    }

    onSubmit({
      startDate: formData.startDate,
      duration: formData.duration,
      places: formData.places,
      moniteurIds: formData.moniteurIds,
      price: formData.price,
      acomptePrice: formData.acomptePrice,
      type: formData.type,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, startDate: date }));
      setShowCalendar(false);
    }
  };

  // Afficher un loader pendant le chargement des prix
  if (isLoadingStagePrices) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderIcon className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des tarifs...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Date de début</Label>
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-transparent"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(formData.startDate, "EEEE d MMMM yyyy", { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[60]" align="start">
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={handleDateSelect}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de stage</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleTypeChange(value as StageType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={StageType.INITIATION}>
              Initiation (7 jours)
            </SelectItem>
            <SelectItem value={StageType.PROGRESSION}>
              Progression (7 jours)
            </SelectItem>
            <SelectItem value={StageType.AUTONOMIE}>
              Autonomie (14 jours)
            </SelectItem>
            <SelectItem value={StageType.DOUBLE}>
              Double - Initiation/Progression (7 jours)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Durée (jours)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          max="30"
          value={formData.duration}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              duration: Number.parseInt(e.target.value) || 1,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="places">Nombre de places</Label>
        <Input
          id="places"
          type="number"
          min="1"
          max="20"
          value={formData.places}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              places: Number.parseInt(e.target.value) || 1,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Prix (€)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              price: Number.parseFloat(e.target.value) || 0,
            }))
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          Prix de base configuré : {getDefaultPrice(formData.type).toFixed(2)}€
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="acomptePrice">Prix de l&apos;acompte (€)</Label>
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
          required
        />
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
              label: `${moniteur.name} (${moniteur.role === "ADMIN" ? "Admin" : "Moniteur"})`,
            }))}
            onValueChange={(values) =>
              setFormData((prev) => ({ ...prev, moniteurIds: values }))
            }
            defaultValue={formData.moniteurIds}
            placeholder="Sélectionner des moniteurs"
            variant="inverted"
            maxCount={3}
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
            className="flex-1"
          >
            Annuler
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Création en cours..." : "Créer le Stage"}
        </Button>
      </div>
    </form>
  );
}
