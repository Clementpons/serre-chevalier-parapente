"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  CreateCampaignSchema,
  type CreateCampaign,
} from "@/features/campaigns/schemas";
import { useCreateCampaign } from "@/features/campaigns/api/use-create-campaign";
import { useGetAudiences } from "@/features/audiences/api/use-get-audiences";
import { LoaderIcon } from "@/lib/icons";
import { useState, useRef, useEffect } from "react";

interface AddCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCampaignDialog({
  open,
  onOpenChange,
}: AddCampaignDialogProps) {
  const { data: audiences, isLoading: isLoadingAudiences } = useGetAudiences();
  const createCampaign = useCreateCampaign();

  const form = useForm<CreateCampaign>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      name: "",
      audienceIds: [],
      content: "Bonjour {PRENOM}, profitez de cette offre...",
      generatePromoCode: false,
    },
  });

  const watchGeneratePromo = form.watch("generatePromoCode");
  const watchPromoDiscountType = form.watch("promoDiscountType");

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        audienceIds: [],
        content: "Bonjour {PRENOM}, profitez de cette offre...",
        generatePromoCode: false,
      });
    }
  }, [open, form]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = form.getValues("content") || "";

    const newContent =
      content.substring(0, start) + variable + content.substring(end);

    form.setValue("content", newContent, { shouldValidate: true });

    // Placement du curseur après la variable insérée (nécessite un petit délai pour que le DOM se mette à jour)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length,
      );
    }, 0);
  };

  const onSubmit = async (data: CreateCampaign) => {
    // Nettoyage avant envoi au cas où le switch a été décoché
    if (!data.generatePromoCode) {
      delete data.promoDiscountType;
      delete data.promoDiscountValue;
      delete data.promoMaxDiscountAmount;
      delete data.promoMinCartAmount;
      delete data.promoMaxUses;
      delete data.promoExpiryDate;
    }
    await createCampaign.mutateAsync(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Campagne SMS</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la campagne *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Black Friday 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audienceIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audiences Cibles *</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {isLoadingAudiences ? (
                        <div className="text-sm text-muted-foreground">
                          Chargement...
                        </div>
                      ) : audiences?.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Aucune audience disponible
                        </div>
                      ) : (
                        audiences?.map((a: any) => {
                          const isSelected = field.value.includes(a.id);
                          return (
                            <Badge
                              key={a.id}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value.filter(
                                      (id: string) => id !== a.id,
                                    )
                                  : [...field.value, a.id];
                                field.onChange(newValue);
                              }}
                            >
                              {a.name} ({a._count?.rules ?? 0} règle(s),{" "}
                              {(a._count?.contacts ?? a.contacts?.length) || 0}{" "}
                              contact(s))
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu du SMS * (Max 1600 car.)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Votre message ici..."
                      className="resize-none"
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        textareaRef.current = e;
                      }}
                      id="sms-content"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
                    <span>Variables disponibles :</span>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => insertVariable("{PRENOM}")}
                    >
                      {`{PRENOM}`}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => insertVariable("{NOM}")}
                    >
                      {`{NOM}`}
                    </Badge>
                    {watchGeneratePromo && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-muted font-bold text-blue-600 bg-blue-50 border-blue-200"
                        onClick={() => insertVariable("{PROMO_CODE}")}
                      >
                        {`{PROMO_CODE}`}
                      </Badge>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border bg-muted/20 rounded-md p-4 space-y-3">
              <FormField
                control={form.control}
                name="generatePromoCode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div>
                      <FormLabel className="font-semibold text-sm">
                        Générer un code promo lié
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Créera un code promo unique à inclure dans ce SMS
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchGeneratePromo && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <FormField
                    control={form.control}
                    name="promoDiscountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Type de réduction *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Choisir" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FIXED">
                              Montant fixe (€)
                            </SelectItem>
                            <SelectItem value="PERCENTAGE">
                              Pourcentage (%)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoDiscountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Valeur *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            step={0.01}
                            min={0}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoMinCartAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Montant min panier (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            step={0.01}
                            min={0}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchPromoDiscountType === "PERCENTAGE" && (
                    <FormField
                      control={form.control}
                      name="promoMaxDiscountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Plafond réduc max (€) (optionnel)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              step={0.01}
                              min={0}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="promoMaxUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Utilisations max (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            min={1}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                parseInt(e.target.value) || undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Expiration (optionnelle)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending && (
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                )}
                Créer (Brouillon)
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
