"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Stage, User, StageBooking } from "@prisma/client";
import { useState } from "react";
import {
  PlusIcon,
  MinusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon2,
  XIcon,
  TagIcon,
  XCircleIcon,
} from "@/lib/icons";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { useGetStageById } from "../api/use-get-stage";
import { useUpdateStage } from "../api/use-update-stages";
import { useDeleteStage } from "../api/use-delete-stages";
import { useApplyStagePromotion } from "../api/use-apply-stage-promotion";
import { useCancelStagePromotion } from "../api/use-cancel-stage-promotion";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageWithDetails extends Stage {
  moniteurs: Array<{ moniteur: User }>;
  bookings: any[];
  acomptePrice: number;
}

interface StageDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: StageWithDetails | null;
  role?: string;
}

// ─── Config couleurs ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { hex: string; label: string; badgeCls: string }> = {
  INITIATION:  { hex: "#38bdf8", label: "Initiation",  badgeCls: "bg-sky-100 text-sky-800 border-sky-200" },
  PROGRESSION: { hex: "#3b82f6", label: "Progression", badgeCls: "bg-blue-100 text-blue-800 border-blue-200" },
  AUTONOMIE:   { hex: "#1e40af", label: "Autonomie",   badgeCls: "bg-blue-100 text-blue-900 border-blue-300" },
  DOUBLE:      { hex: "#8b5cf6", label: "Double",      badgeCls: "bg-violet-100 text-violet-800 border-violet-200" },
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function StageDetailsSheet({
  open,
  onOpenChange,
  stage,
  role,
}: StageDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showCancelPromotionDialog, setShowCancelPromotionDialog] = useState(false);
  const [promotionForm, setPromotionForm] = useState({
    newPrice: "",
    endDate: "",
    reason: "",
  });
  const [editedStage, setEditedStage] = useState<{
    places: number;
    price: number;
    acomptePrice: number;
    moniteurIds: string[];
  } | null>(null);

  const { data: moniteurs } = useGetMoniteursAndAdmins();
  const { data: fullStageData, isLoading: isLoadingDetails } = useGetStageById(stage?.id || "");

  const displayStage = fullStageData || stage;

  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const applyPromotion = useApplyStagePromotion();
  const cancelPromotion = useCancelStagePromotion();

  if (!displayStage) return null;

  const bookings = fullStageData?.bookings || [];
  const currentBookingsCount =
    fullStageData?.bookings?.length ??
    (displayStage as any).confirmedBookings ??
    0;

  const placesRestantes = displayStage.places - currentBookingsCount;
  const hasActivePromotion = !!(displayStage as any).promotionOriginalPrice;
  const cfg = TYPE_CONFIG[displayStage.type] ?? {
    hex: "#94a3b8",
    label: displayStage.type,
    badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const endDate = addDays(new Date(displayStage.startDate), displayStage.duration - 1);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = () => {
    setEditedStage({
      places: displayStage.places,
      price: displayStage.price,
      acomptePrice: displayStage.acomptePrice,
      moniteurIds: displayStage.moniteurs.map((m: any) => m.moniteur.id),
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedStage(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!editedStage) return;
    updateStage.mutate(
      {
        param: { id: displayStage.id },
        json: {
          startDate: new Date(displayStage.startDate).toISOString(),
          duration: displayStage.duration,
          places: editedStage.places,
          price: editedStage.price,
          acomptePrice: editedStage.acomptePrice,
          moniteurIds: editedStage.moniteurIds,
          type: displayStage.type,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setEditedStage(null);
        },
      }
    );
  };

  const handleIncreasePlaces = () => {
    if (!editedStage) return;
    setEditedStage({ ...editedStage, places: editedStage.places + 1 });
  };

  const handleDecreasePlaces = () => {
    if (!editedStage) return;
    if (editedStage.places <= currentBookingsCount) {
      toast.error(`Impossible de réduire en dessous de ${currentBookingsCount} places`);
      return;
    }
    if (editedStage.places <= 1) {
      toast.error("Le nombre de places doit être supérieur à 0");
      return;
    }
    setEditedStage({ ...editedStage, places: editedStage.places - 1 });
  };

  const handleDelete = () => {
    if (currentBookingsCount > 0) {
      toast.error("Impossible de supprimer un stage avec des réservations");
      return;
    }
    deleteStage.mutate({ id: displayStage.id }, { onSuccess: () => onOpenChange(false) });
  };

  const handleApplyPromotion = () => {
    const newPrice = parseFloat(promotionForm.newPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Le prix promotionnel doit être supérieur à 0");
      return;
    }
    if (newPrice >= displayStage.price && !displayStage.promotionOriginalPrice) {
      toast.error("Le prix promotionnel doit être inférieur au prix actuel");
      return;
    }
    applyPromotion.mutate(
      {
        param: { id: displayStage.id },
        json: {
          newPrice,
          endDate: promotionForm.endDate || undefined,
          reason: promotionForm.reason || undefined,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            setShowPromotionDialog(false);
            setPromotionForm({ newPrice: "", endDate: "", reason: "" });
          }
        },
      }
    );
  };

  const handleCancelPromotion = () => {
    cancelPromotion.mutate(
      { id: displayStage.id },
      { onSuccess: () => setShowCancelPromotionDialog(false) }
    );
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  const discountPct =
    hasActivePromotion && (displayStage as any).promotionOriginalPrice
      ? Math.round(
          (1 - displayStage.price / (displayStage as any).promotionOriginalPrice) * 100
        )
      : 0;

  const currentPlaces = isEditing && editedStage ? editedStage.places : displayStage.places;
  const currentRestantes = isEditing && editedStage
    ? editedStage.places - currentBookingsCount
    : placesRestantes;

  return (
    <>
      <ResponsiveModal
        open={open}
        onOpenChange={onOpenChange}
        title={`Stage ${cfg.label}`}
      >
          {/* En-tête */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="inline-block w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: cfg.hex }}
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {cfg.label}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {format(new Date(displayStage.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                    {" → "}
                    {format(endDate, "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <Badge className={`${cfg.badgeCls} border flex-shrink-0`}>
                  {cfg.label}
                </Badge>
              </div>

              {/* Actions admin */}
              {role === "ADMIN" && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!isEditing ? (
                    <>
                      {hasActivePromotion ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 gap-1 text-xs"
                          onClick={() => setShowCancelPromotionDialog(true)}
                        >
                          <XCircleIcon className="h-3.5 w-3.5" />
                          Annuler promo
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 gap-1 text-xs"
                          onClick={() => setShowPromotionDialog(true)}
                        >
                          <TagIcon className="h-3.5 w-3.5" />
                          Promo
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <EditIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentBookingsCount > 0}
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={updateStage.isPending}
                        className="text-green-600 hover:text-green-700 gap-1 text-xs"
                      >
                        <SaveIcon2 className="h-3.5 w-3.5" />
                        Sauvegarder
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Grille infos principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carte Dates */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Dates
                </h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Début</span>
                    <span className="font-medium text-slate-800">
                      {format(new Date(displayStage.startDate), "dd/MM/yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fin</span>
                    <span className="font-medium text-slate-800">
                      {format(endDate, "dd/MM/yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durée</span>
                    <span className="font-medium text-slate-800">
                      {displayStage.duration} jour{displayStage.duration > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carte Places */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Places
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total</span>
                    {isEditing && editedStage ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDecreasePlaces}
                          disabled={editedStage.places <= currentBookingsCount}
                          className="h-7 w-7 p-0"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-7 text-center font-semibold">{editedStage.places}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleIncreasePlaces}
                          className="h-7 w-7 p-0"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium text-slate-800">{currentPlaces}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Réservées</span>
                    <span className="font-medium text-slate-800">{currentBookingsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Restantes</span>
                    <span
                      className={`font-semibold ${
                        currentRestantes > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {currentRestantes}
                    </span>
                  </div>
                  {/* Barre de progression */}
                  <div className="pt-1">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (currentBookingsCount / currentPlaces) * 100)}%`,
                          backgroundColor: currentRestantes <= 2 ? "#dc2626" : cfg.hex,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte Prix */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tarifs
                </h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Prix total</span>
                    {isEditing && editedStage ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={editedStage.price}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value) || 0;
                            const acompte = Math.round(price * 0.4 * 100) / 100;
                            setEditedStage({ ...editedStage, price, acomptePrice: acompte });
                          }}
                          className="w-20 h-7 text-right"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-slate-500">€</span>
                      </div>
                    ) : hasActivePromotion ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">{displayStage.price}€</span>
                        <span className="line-through text-slate-400 text-xs">
                          {(displayStage as any).promotionOriginalPrice}€
                        </span>
                        <Badge className="bg-red-100 text-red-700 text-[10px] px-1 py-0">
                          -{discountPct}%
                        </Badge>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-800">{displayStage.price}€</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Acompte (40%)</span>
                    {isEditing && editedStage ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={editedStage.acomptePrice}
                          onChange={(e) =>
                            setEditedStage({
                              ...editedStage,
                              acomptePrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 h-7 text-right"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-slate-500">€</span>
                      </div>
                    ) : (
                      <span className="font-medium text-slate-800">{displayStage.acomptePrice}€</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Carte Promotion (si active) */}
              {hasActivePromotion && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
                    <TagIcon className="h-3.5 w-3.5" />
                    Promotion active
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-400">Prix original</span>
                      <span className="font-medium text-slate-700 line-through">
                        {(displayStage as any).promotionOriginalPrice}€
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Réduction</span>
                      <span className="font-bold text-red-600">-{discountPct}%</span>
                    </div>
                    {(displayStage as any).promotionEndDate && (
                      <div className="flex justify-between">
                        <span className="text-red-400">Expire le</span>
                        <span className="font-medium text-slate-700">
                          {format(
                            new Date((displayStage as any).promotionEndDate),
                            "dd/MM/yyyy",
                            { locale: fr }
                          )}
                        </span>
                      </div>
                    )}
                    {(displayStage as any).promotionReason && (
                      <p className="text-xs text-red-500 italic mt-1">
                        &ldquo;{(displayStage as any).promotionReason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Moniteurs */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Moniteur{displayStage.moniteurs.length > 1 ? "s" : ""}
              </h3>
              {isEditing && editedStage ? (
                <div className="space-y-2">
                  <Label htmlFor="moniteurs" className="text-sm">Sélectionner des moniteurs</Label>
                  <MultiSelect
                    options={
                      moniteurs?.map((m) => ({
                        value: m.id,
                        label: `${m.name} (${m.role === "ADMIN" ? "Admin" : "Moniteur"})`,
                      })) || []
                    }
                    onValueChange={(values) =>
                      setEditedStage({ ...editedStage, moniteurIds: values })
                    }
                    defaultValue={editedStage.moniteurIds}
                    placeholder="Sélectionner des moniteurs"
                    variant="inverted"
                    maxCount={3}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {displayStage.moniteurs.map((md: any) => (
                    <div
                      key={md.moniteur.id}
                      className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={md.moniteur.avatarUrl ?? undefined} alt={md.moniteur.name} />
                        <AvatarFallback className="text-xs">
                          {md.moniteur.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{md.moniteur.name}</div>
                        <div className="text-xs text-slate-500">
                          {md.moniteur.role === "ADMIN" ? "Administrateur" : "Moniteur"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Réservations */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Réservations ({currentBookingsCount} / {currentPlaces})
              </h3>
              {isLoadingDetails ? (
                <p className="text-sm text-slate-400">Chargement des réservations…</p>
              ) : bookings.length > 0 ? (
                <div className="space-y-2">
                  {bookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {booking.stagiaire?.firstName} {booking.stagiaire?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{booking.stagiaire?.email}</div>
                        <div className="text-xs text-slate-400">{booking.stagiaire?.phone}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {booking.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Aucune réservation pour ce stage</p>
                  <p className="text-xs mt-1">Les clients pourront bientôt réserver ce stage</p>
                </div>
              )}
            </div>
          </div>
      </ResponsiveModal>

      {/* Confirmation suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le stage</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce stage ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => { handleDelete(); setShowDeleteDialog(false); }}
              disabled={deleteStage.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appliquer une promotion */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appliquer une promotion</DialogTitle>
            <DialogDescription>
              Prix actuel : <strong>{displayStage.price}€</strong>. Définissez le nouveau prix promotionnel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="promo-price">Nouveau prix (€) *</Label>
              <Input
                id="promo-price"
                type="number"
                placeholder={`Ex: ${Math.round(displayStage.price * 0.9)}`}
                value={promotionForm.newPrice}
                onChange={(e) => setPromotionForm({ ...promotionForm, newPrice: e.target.value })}
                min="1"
                step="1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo-end">Date de fin (optionnel)</Label>
              <Input
                id="promo-end"
                type="date"
                value={promotionForm.endDate}
                onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo-reason">Raison (optionnel)</Label>
              <Input
                id="promo-reason"
                type="text"
                placeholder="Ex: Promo printemps"
                value={promotionForm.reason}
                onChange={(e) => setPromotionForm({ ...promotionForm, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPromotionDialog(false);
                setPromotionForm({ newPrice: "", endDate: "", reason: "" });
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleApplyPromotion}
              disabled={applyPromotion.isPending || !promotionForm.newPrice}
            >
              Appliquer la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annuler la promotion */}
      <Dialog open={showCancelPromotionDialog} onOpenChange={setShowCancelPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la promotion</DialogTitle>
            <DialogDescription>
              Le prix reviendra à <strong>{(displayStage as any).promotionOriginalPrice}€</strong>. Êtes-vous sûr ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelPromotionDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelPromotion}
              disabled={cancelPromotion.isPending}
            >
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
