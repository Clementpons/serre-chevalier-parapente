"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetTarifs } from "@/features/tarifs/api/use-get-tarifs";
import { useUpdateTarif } from "@/features/tarifs/api/use-update-tarif";
import { useGetVideoOptionPrice } from "@/features/tarifs/api/use-get-video-option-price";
import { useUpdateVideoOptionPrice } from "@/features/tarifs/api/use-update-video-option-price";
import { useGetStageBasePrices } from "@/features/tarifs/api/use-get-stage-base-prices";
import { useUpdateStageBasePrice } from "@/features/tarifs/api/use-update-stage-base-price";
import { BaptemeCategory, StageType } from "@prisma/client";
import { useState } from "react";
import { LoaderIcon, SaveIcon2 } from "@/lib/icons";
import { Label } from "@/components/ui/label";

const CATEGORY_LABELS: Record<BaptemeCategory, string> = {
  AVENTURE: "Aventure",
  DUREE: "Durée",
  LONGUE_DUREE: "Longue Durée",
  ENFANT: "Enfant",
  HIVER: "Hiver",
};

const STAGE_TYPE_LABELS: Record<StageType, string> = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
  DOUBLE: "Double",
};

const STAGE_TYPE_DESCRIPTIONS: Record<StageType, string> = {
  INITIATION: "Prix de base pour les stages initiation",
  PROGRESSION: "Prix de base pour les stages progression",
  AUTONOMIE: "Prix de base pour les stages autonomie",
  DOUBLE: "",
};

export function Tarifs() {
  const { data: tarifs, isLoading } = useGetTarifs();
  const { data: videoPrice, isLoading: isLoadingVideoPrice } = useGetVideoOptionPrice();
  const { data: stagePrices, isLoading: isLoadingStagePrices } = useGetStageBasePrices();
  
  const updateTarif = useUpdateTarif();
  const updateVideoPrice = useUpdateVideoOptionPrice();
  const updateStagePrice = useUpdateStageBasePrice();
  
  const [editedPrices, setEditedPrices] = useState<Partial<Record<BaptemeCategory, number>>>({});
  const [editedVideoPrice, setEditedVideoPrice] = useState<number | undefined>(undefined);
  const [editedStagePrices, setEditedStagePrices] = useState<Partial<Record<StageType, number>>>({});

  const handlePriceChange = (category: BaptemeCategory, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedPrices((prev) => ({
        ...prev,
        [category]: numValue,
      }));
    }
  };

  const handleSave = async (category: BaptemeCategory) => {
    const price = editedPrices[category];
    if (price !== undefined) {
      await updateTarif.mutateAsync({ category, price });
      setEditedPrices((prev) => {
        const newPrices = { ...prev };
        delete newPrices[category];
        return newPrices;
      });
    }
  };

  const getCurrentPrice = (category: BaptemeCategory) => {
    if (editedPrices[category] !== undefined) {
      return editedPrices[category];
    }
    return tarifs?.find((t) => t.category === category)?.price || 0;
  };

  const hasChanges = (category: BaptemeCategory) => {
    return editedPrices[category] !== undefined;
  };

  const handleVideoPriceChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedVideoPrice(numValue);
    }
  };

  const handleSaveVideoPrice = async () => {
    if (editedVideoPrice !== undefined) {
      await updateVideoPrice.mutateAsync({ price: editedVideoPrice });
      setEditedVideoPrice(undefined);
    }
  };

  const getCurrentVideoPrice = () => {
    if (editedVideoPrice !== undefined) {
      return editedVideoPrice;
    }
    return videoPrice?.price || 0;
  };

  const hasVideoPriceChanges = () => {
    return editedVideoPrice !== undefined;
  };

  const handleStagePriceChange = (stageType: StageType, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedStagePrices((prev) => ({
        ...prev,
        [stageType]: numValue,
      }));
    }
  };

  const handleSaveStagePrice = async (stageType: StageType) => {
    const price = editedStagePrices[stageType];
    if (price !== undefined) {
      await updateStagePrice.mutateAsync({ stageType, price });
      setEditedStagePrices((prev) => {
        const newPrices = { ...prev };
        delete newPrices[stageType];
        return newPrices;
      });
    }
  };

  const getCurrentStagePrice = (stageType: StageType) => {
    if (editedStagePrices[stageType] !== undefined) {
      return editedStagePrices[stageType];
    }
    return stagePrices?.find((s) => s.stageType === stageType)?.price || 0;
  };

  const hasStagePriceChanges = (stageType: StageType) => {
    return editedStagePrices[stageType] !== undefined;
  };

  if (isLoading || isLoadingVideoPrice || isLoadingStagePrices) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Tarifs</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les prix de base des baptêmes, de l&apos;option vidéo et des stages
        </p>
      </div>

      {/* Prix des baptêmes par catégorie */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Prix des Baptêmes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const baptemeCategory = category as BaptemeCategory;
          const currentPrice = getCurrentPrice(baptemeCategory);
          const isEdited = hasChanges(baptemeCategory);

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>
                  Prix de base pour les baptêmes {label.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`price-${category}`}>Prix (€)</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`price-${category}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentPrice}
                      onChange={(e) => handlePriceChange(baptemeCategory, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSave(baptemeCategory)}
                      disabled={!isEdited || updateTarif.isPending}
                      size="icon"
                    >
                      {updateTarif.isPending ? (
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <SaveIcon2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {isEdited && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Modifications non enregistrées
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>

      {/* Prix de l'option vidéo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Option Vidéo</h2>
        <Card>
          <CardHeader>
            <CardTitle>Prix de l&apos;option vidéo</CardTitle>
            <CardDescription>
              Prix supplémentaire pour l&apos;option vidéo des baptêmes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-price">Prix (€)</Label>
              <div className="flex gap-2">
                <Input
                  id="video-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={getCurrentVideoPrice()}
                  onChange={(e) => handleVideoPriceChange(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveVideoPrice}
                  disabled={!hasVideoPriceChanges() || updateVideoPrice.isPending}
                  size="icon"
                >
                  {updateVideoPrice.isPending ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {hasVideoPriceChanges() && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Modifications non enregistrées
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prix de base des stages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Prix de Base des Stages</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(STAGE_TYPE_LABELS)
            .filter(([type]) => type !== "DOUBLE")
            .map(([type, label]) => {
              const stageType = type as StageType;
              const currentPrice = getCurrentStagePrice(stageType);
              const isEdited = hasStagePriceChanges(stageType);

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle>{label}</CardTitle>
                    <CardDescription>
                      {STAGE_TYPE_DESCRIPTIONS[stageType]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`stage-price-${type}`}>Prix (€)</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`stage-price-${type}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={currentPrice}
                          onChange={(e) => handleStagePriceChange(stageType, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleSaveStagePrice(stageType)}
                          disabled={!isEdited || updateStagePrice.isPending}
                          size="icon"
                        >
                          {updateStagePrice.isPending ? (
                            <LoaderIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <SaveIcon2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {isEdited && (
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Modifications non enregistrées
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les prix définis ici sont utilisés comme valeurs initiales dans le backoffice et peuvent être récupérés via l&apos;API publique pour affichage sur le site frontend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}