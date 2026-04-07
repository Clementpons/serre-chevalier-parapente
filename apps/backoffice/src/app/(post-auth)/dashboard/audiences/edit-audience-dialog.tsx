"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  UpdateAudienceSchema,
  type UpdateAudience,
} from "@/features/audiences/schemas";
import { useUpdateAudience } from "@/features/audiences/api/use-update-audience";
import { LoaderIcon, PlusIcon, TrashIcon } from "@/lib/icons";
import { ContactSearch } from "./contact-search";

const RULE_LABELS: Record<string, string> = {
  CLIENT_RESERVED_STAGE: "A réservé un stage (client)",
  CLIENT_RESERVED_BAPTEME: "A réservé un baptême (client)",
  STAGIAIRE_STAGE: "A participé à un stage (stagiaire)",
  STAGIAIRE_BAPTEME: "A participé à un baptême (stagiaire)",
  PURCHASED_GIFT_VOUCHER: "A acheté un bon cadeau",
  ORDER_ABOVE_AMOUNT: "A passé une commande > X€",
  CLIENT_NO_ORDER: "Client sans aucune commande",
  STAGIAIRE_NO_BOOKING: "Stagiaire sans aucune réservation",
};

const STAGE_TYPES = [
  { value: "INITIATION", label: "Stage Initiation" },
  { value: "PROGRESSION", label: "Stage Progression" },
  { value: "AUTONOMIE", label: "Stage Autonomie" },
];

const BAPTEME_CATEGORIES = [
  { value: "AVENTURE", label: "Baptême Aventure" },
  { value: "DUREE", label: "Baptême Durée" },
  { value: "LONGUE_DUREE", label: "Baptême Longue Durée" },
  { value: "ENFANT", label: "Baptême Enfant" },
  { value: "HIVER", label: "Baptême Hiver" },
];

interface EditAudienceDialogProps {
  audience: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAudienceDialog({
  audience,
  open,
  onOpenChange,
}: EditAudienceDialogProps) {
  const updateAudience = useUpdateAudience(audience?.id);

  const form = useForm<UpdateAudience>({
    resolver: zodResolver(UpdateAudienceSchema),
    defaultValues: {
      name: "",
      description: "",
      rules: [],
      contacts: [],
    },
  });

  // Reset form when audience changes or dialog opens
  useEffect(() => {
    if (audience && open) {
      form.reset({
        name: audience.name,
        description: audience.description ?? "",
        rules:
          audience.rules?.map((r: any) => ({
            ruleType: r.ruleType,
            stageType: r.stageType ?? undefined,
            baptemeCategory: r.baptemeCategory ?? undefined,
            minOrderAmount: r.minOrderAmount ?? undefined,
            dateFrom: r.dateFrom ? new Date(r.dateFrom) : undefined,
            dateTo: r.dateTo ? new Date(r.dateTo) : undefined,
          })) || [],
        contacts:
          audience.contacts?.map((c: any) => ({
            phone: c.phone,
            name: c.name ?? "",
          })) || [],
      });
    }
  }, [audience, open, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rules",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const onSubmit = async (data: UpdateAudience) => {
    await updateAudience.mutateAsync(data);
    onOpenChange(false);
  };

  const watchedRules = form.watch("rules");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;Audience</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Stagiaires Initiation 2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={2}
                      placeholder="Description optionnelle..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Règles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Règles de filtrage</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ruleType: "CLIENT_RESERVED_STAGE" })}
                >
                  <PlusIcon className="h-3.5 w-3.5 mr-1" />
                  Ajouter une règle
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Les contacts satisfaisant <strong>au moins une règle</strong>{" "}
                seront inclus.
              </p>

              {fields.length === 0 && (
                <div className="text-sm text-center py-4 border border-dashed rounded bg-muted/20 text-muted-foreground">
                  Aucune règle dynamique définie.
                </div>
              )}

              {fields.map((field, index) => {
                const ruleType = watchedRules?.[index]?.ruleType;
                const showStageFilter =
                  ruleType === "CLIENT_RESERVED_STAGE" ||
                  ruleType === "STAGIAIRE_STAGE";
                const showBaptemeFilter =
                  ruleType === "CLIENT_RESERVED_BAPTEME" ||
                  ruleType === "STAGIAIRE_BAPTEME";
                const showAmountFilter = ruleType === "ORDER_ABOVE_AMOUNT";

                return (
                  <div
                    key={field.id}
                    className="border rounded-lg p-3 space-y-3 bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        Règle {index + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`rules.${index}.ruleType`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Type</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(RULE_LABELS).map(
                                ([val, label]) => (
                                  <SelectItem
                                    key={val}
                                    value={val}
                                    className="text-xs"
                                  >
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Filtre type de stage */}
                    {watchedRules &&
                      watchedRules[index]?.ruleType &&
                      (ruleType === "CLIENT_RESERVED_STAGE" ||
                        ruleType === "STAGIAIRE_STAGE") && (
                        <FormField
                          control={form.control}
                          name={`rules.${index}.stageType`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Type de stage (optionnel)
                              </FormLabel>
                              <Select
                                onValueChange={(val) =>
                                  f.onChange(val === "ALL" ? undefined : val)
                                }
                                value={f.value ?? "ALL"}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Tous les stages" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ALL">
                                    Tous les stages
                                  </SelectItem>
                                  {STAGE_TYPES.map((t) => (
                                    <SelectItem
                                      key={t.value}
                                      value={t.value}
                                      className="text-xs"
                                    >
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      )}

                    {/* Filtre catégorie baptême */}
                    {showBaptemeFilter && (
                      <FormField
                        control={form.control}
                        name={`rules.${index}.baptemeCategory`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Catégorie baptême (optionnel)
                            </FormLabel>
                            <Select
                              onValueChange={(val) =>
                                f.onChange(val === "ALL" ? undefined : val)
                              }
                              value={f.value ?? "ALL"}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Toutes catégories" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ALL">
                                  Toutes catégories
                                </SelectItem>
                                {BAPTEME_CATEGORIES.map((c) => (
                                  <SelectItem
                                    key={c.value}
                                    value={c.value}
                                    className="text-xs"
                                  >
                                    {c.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Filtre montant min */}
                    {showAmountFilter && (
                      <FormField
                        control={form.control}
                        name={`rules.${index}.minOrderAmount`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Montant min (€) *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                className="h-8 text-xs"
                                placeholder="Ex: 200"
                                {...f}
                                value={f.value ?? ""}
                                onChange={(e) =>
                                  f.onChange(
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
                    )}

                    {/* Plage de dates */}
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`rules.${index}.dateFrom`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Du</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-8 text-xs"
                                {...f}
                                value={
                                  f.value
                                    ? new Date(f.value)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  f.onChange(
                                    e.target.value
                                      ? new Date(e.target.value)
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
                        name={`rules.${index}.dateTo`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Au</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-8 text-xs"
                                {...f}
                                value={
                                  f.value
                                    ? new Date(f.value)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  f.onChange(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : undefined,
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contacts manuels */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <FormLabel>Contacts manuels</FormLabel>
                <div className="flex items-center gap-2">
                  <ContactSearch onSelect={(c) => appendContact(c)} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => appendContact({ phone: "", name: "" })}
                  >
                    <PlusIcon className="h-3.5 w-3.5 mr-1" />
                    Manuellement
                  </Button>
                </div>
              </div>

              {contactFields.length === 0 && (
                <div className="text-sm text-center py-4 border border-dashed rounded bg-muted/20 text-muted-foreground">
                  Aucun contact ajouté manuellement.
                </div>
              )}

              {contactFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.name`}
                    render={({ field: f }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Nom/Prénom"
                            className="h-9 text-sm"
                            {...f}
                            value={f.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.phone`}
                    render={({ field: f }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Téléphone *"
                            className="h-9 text-sm"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive shrink-0 border"
                    onClick={() => removeContact(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {form.formState.errors.root && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm mt-2">
                  {form.formState.errors.root.message}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateAudience.isPending}
              >
                {updateAudience.isPending ? (
                  <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
