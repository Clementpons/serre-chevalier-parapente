"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useUpdateStage } from "@/features/stages/api/use-update-stages";
import { UpdateStageSchema } from "@/features/stages/schemas";
import { StageType } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { useGetStageBasePrices } from "@/features/tarifs/api/use-get-stage-base-prices";
import { MultiSelect } from "@/components/ui/multi-select";

interface StageData {
  id: string;
  startDate: Date;
  duration: number;
  places: number;
  price: number;
  acomptePrice: number;
  type: StageType;
  moniteurs?: Array<{
    moniteur: {
      id: string;
      name: string;
      avatarUrl: string | null;
      role: string;
    };
  }>;
  bookings?: any[];
}

interface StageEditFormProps {
  stage: StageData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StageEditForm({
  stage,
  onSuccess,
  onCancel,
}: StageEditFormProps) {
  const updateStage = useUpdateStage();
  const { data: moniteurs, isLoading: isLoadingMoniteurs } = useGetMoniteursAndAdmins();
  const { data: stagePrices } = useGetStageBasePrices();
  const [showCalendar, setShowCalendar] = useState(false);

  // Fonction pour obtenir le prix de base configuré selon le type
  const getConfiguredPrice = (type: StageType): number => {
    if (!stagePrices) return 0;
    const priceConfig = stagePrices.find((p) => p.stageType === type);
    return priceConfig?.price || 0;
  };

  const form = useForm<z.infer<typeof UpdateStageSchema>>({
    resolver: zodResolver(UpdateStageSchema),
    defaultValues: {
      startDate: stage.startDate.toISOString(),
      duration: stage.duration,
      places: stage.places,
      price: stage.price,
      acomptePrice: stage.acomptePrice,
      type: stage.type,
      moniteurIds: stage.moniteurs?.map(m => m.moniteur.id) || [],
    },
  });

  useEffect(() => {
    if (stage) {
      form.reset({
        startDate: stage.startDate.toISOString(),
        duration: stage.duration,
        places: stage.places,
        price: stage.price,
        acomptePrice: stage.acomptePrice,
        type: stage.type,
        moniteurIds: stage.moniteurs?.map(m => m.moniteur.id) || [],
      });
    }
  }, [stage, form]);

  const handleSubmit = async (values: z.infer<typeof UpdateStageSchema>) => {
    try {
      await updateStage.mutateAsync({ param: { id: stage.id }, json: values });
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stage:", error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("startDate", date.toISOString());
      setShowCalendar(false);
    }
  };

  const startDateValue = form.watch("startDate");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de début</FormLabel>
              <FormControl>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                      disabled={updateStage.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDateValue ? 
                        format(new Date(startDateValue), "EEEE d MMMM yyyy", { locale: fr }) :
                        "Sélectionner une date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDateValue ? new Date(startDateValue) : undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de stage</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={updateStage.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StageType.INITIATION}>Initiation (7 jours)</SelectItem>
                    <SelectItem value={StageType.PROGRESSION}>Progression (7 jours)</SelectItem>
                    <SelectItem value={StageType.AUTONOMIE}>Autonomie (14 jours)</SelectItem>
                    <SelectItem value={StageType.DOUBLE}>Double - Initiation/Progression (7 jours)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée (jours)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={updateStage.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="places"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de places</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={updateStage.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={updateStage.isPending}
                />
              </FormControl>
              <FormDescription>
                Prix de base configuré : {getConfiguredPrice(form.watch("type")).toFixed(2)}€
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="acomptePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix de l&apos;acompte (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={updateStage.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moniteurIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moniteurs</FormLabel>
              <FormControl>
                {isLoadingMoniteurs ? (
                  <div className="text-sm text-muted-foreground">
                    Chargement des moniteurs...
                  </div>
                ) : moniteurs && moniteurs.length > 0 ? (
                  <MultiSelect
                    options={moniteurs.map((moniteur) => ({
                      value: moniteur.id,
                      label: `${moniteur.name} (${moniteur.role === 'ADMIN' ? 'Admin' : 'Moniteur'})`,
                    }))}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    placeholder="Sélectionner des moniteurs"
                    variant="inverted"
                    maxCount={3}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Aucun moniteur disponible
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={updateStage.isPending}
              className="flex-1"
            >
              Annuler
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={updateStage.isPending}
            className="flex-1"
          >
            {updateStage.isPending ? "Modification..." : "Modifier le stage"}
          </Button>
        </div>
      </form>
    </Form>
  );
}