"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateCampaignSchema,
  UpdateCampaign,
} from "@/features/campaigns/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LoaderIcon } from "@/lib/icons";
import { useUpdateCampaign } from "@/features/campaigns/api/use-update-campaign";
import { useGetAudiences } from "@/features/audiences/api/use-get-audiences";
import { useState, useRef, useEffect } from "react";

interface EditCampaignDialogProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({
  campaign,
  open,
  onOpenChange,
}: EditCampaignDialogProps) {
  const updateCampaign = useUpdateCampaign(campaign?.id);
  const { data: audiences } = useGetAudiences();

  const form = useForm<UpdateCampaign>({
    resolver: zodResolver(UpdateCampaignSchema),
    defaultValues: {
      name: campaign?.name || "",
      content: campaign?.content || "",
      audienceIds: campaign?.audiences?.map((a: any) => a.id) || [],
      scheduledAt: campaign?.scheduledAt
        ? new Date(campaign.scheduledAt)
        : undefined,
      generatePromoCode: campaign?.generatePromoCode || false,
      promoDiscountType: campaign?.promoDiscountType || "FIXED",
      promoDiscountValue: campaign?.promoDiscountValue ?? undefined,
      promoMaxDiscountAmount: campaign?.promoMaxDiscountAmount ?? undefined,
      promoMinCartAmount: campaign?.promoMinCartAmount ?? undefined,
      promoMaxUses: campaign?.promoMaxUses ?? 1,
      promoExpiryDate: campaign?.promoExpiryDate
        ? new Date(campaign.promoExpiryDate)
        : undefined,
    },
  });

  // Reset form when campaign changes
  useEffect(() => {
    if (campaign && open) {
      form.reset({
        name: campaign.name,
        content: campaign.content,
        audienceIds: campaign.audiences?.map((a: any) => a.id) || [],
        scheduledAt: campaign.scheduledAt
          ? new Date(campaign.scheduledAt)
          : undefined,
        generatePromoCode: campaign.generatePromoCode || false,
        promoDiscountType: campaign.promoDiscountType || "FIXED",
        promoDiscountValue: campaign.promoDiscountValue ?? undefined,
        promoMaxDiscountAmount: campaign.promoMaxDiscountAmount ?? undefined,
        promoMinCartAmount: campaign.promoMinCartAmount ?? undefined,
        promoMaxUses: campaign.promoMaxUses ?? 1,
        promoExpiryDate: campaign.promoExpiryDate
          ? new Date(campaign.promoExpiryDate)
          : undefined,
      });
    }
  }, [campaign, open, form]);

  const watchGeneratePromo = form.watch("generatePromoCode");
  const watchAudienceIds = form.watch("audienceIds") || [];

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

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length,
      );
    }, 0);
  };

  const onSubmit = async (data: UpdateCampaign) => {
    if (!data.generatePromoCode) {
      data.promoDiscountType = undefined;
      data.promoDiscountValue = undefined;
      data.promoMaxDiscountAmount = undefined;
      data.promoMinCartAmount = undefined;
      data.promoMaxUses = undefined;
      data.promoExpiryDate = undefined;
    }

    try {
      await updateCampaign.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAudience = (id: string) => {
    const current = form.getValues("audienceIds") || [];
    if (current.includes(id)) {
      form.setValue(
        "audienceIds",
        current.filter((v) => v !== id),
        { shouldValidate: true },
      );
    } else {
      form.setValue("audienceIds", [...current, id], { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la Campagne SMS</DialogTitle>
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
              render={() => (
                <FormItem>
                  <FormLabel>Audiences Cibles *</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {audiences?.map((audience: any) => (
                        <Badge
                          key={audience.id}
                          variant={
                            watchAudienceIds.includes(audience.id)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer py-1 px-3"
                          onClick={() => toggleAudience(audience.id)}
                        >
                          {audience.name} ({audience._count?.rules || 0}{" "}
                          règle(s), {audience._count?.contacts || 0} contact(s))
                        </Badge>
                      ))}
                      {(!audiences || audiences.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">
                          Aucune audience disponible. Créez-en une d&apos;abord.
                        </p>
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
                            <SelectTrigger className="h-9">
                              <SelectValue />
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
                            className="h-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
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
                            className="h-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
                            className="h-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="promoExpiryDate"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">
                          Expiration (optionnelle)
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full h-9 pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateCampaign.isPending}>
                {updateCampaign.isPending ? (
                  <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
