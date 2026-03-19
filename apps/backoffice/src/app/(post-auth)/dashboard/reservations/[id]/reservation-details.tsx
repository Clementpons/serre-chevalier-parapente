"use client";

import { useState } from "react";
import { useGetReservationDetails } from "@/features/reservations/api/use-get-reservation-details";
import { useRecordManualPayment } from "@/features/reservations/api/use-record-manual-payment";
import { useRecordFinalDiscount } from "@/features/reservations/api/use-record-final-discount";
import { useConfirmFinalPayment } from "@/features/orders/api/use-confirm-final-payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeftIcon } from "@/lib/icons";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon2,
  ClockIcon,
  EuroSignIcon,
  CreditCardIcon2,
  CheckCircleIcon,
  VideoIcon,
  UsersIcon,
  WeightIcon2,
  RulerIcon2,
  CakeIcon,
  FileTextIcon,
  PlusIcon,
  AlertTriangleIcon,
  TagIcon,
  PercentIcon2,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface ReservationDetailsProps {
  id: string;
}

export function ReservationDetails({ id }: ReservationDetailsProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetReservationDetails(id);
  const recordManualPayment = useRecordManualPayment();
  const recordFinalDiscount = useRecordFinalDiscount();
  const confirmFinalPayment = useConfirmFinalPayment();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "BANK_TRANSFER" | "CASH" | "CHECK"
  >("CASH");
  const [paymentNote, setPaymentNote] = useState("");
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [finalizeNote, setFinalizeNote] = useState("");
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountNote, setDiscountNote] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID":
      case "FULLY_PAID":
        return "default";
      case "PARTIALLY_PAID":
        return "secondary";
      case "CONFIRMED":
        return "secondary";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Payé";
      case "PARTIALLY_PAID":
        return "Acompte payé";
      case "FULLY_PAID":
        return "Entièrement payé";
      case "CONFIRMED":
        return "Confirmé";
      case "PENDING":
        return "En attente";
      case "SUCCEEDED":
        return "Réussi";
      case "FAILED":
        return "Échoué";
      case "CANCELLED":
        return "Annulé";
      case "REFUNDED":
        return "Remboursé";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      AVENTURE: "Aventure",
      DUREE: "Durée",
      LONGUE_DUREE: "Longue Durée",
      ENFANT: "Enfant",
      HIVER: "Hiver",
      INITIATION: "Initiation",
      PROGRESSION: "Progression",
      AUTONOMIE: "Autonomie",
    };
    return labels[category] || category;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CARD: "Carte Bancaire",
      BANK_TRANSFER: "Virement",
      CASH: "Espèces",
      CHECK: "Chèque",
    };
    return labels[method] || method;
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      return;
    }

    if (!orderItem?.id) {
      return;
    }

    try {
      await recordManualPayment.mutateAsync({
        orderItemId: orderItem.id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        note: paymentNote || undefined,
      });

      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentNote("");
      setPaymentMethod("CASH");
      refetch();
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Erreur lors du chargement de la réservation
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { type, booking, availablePlaces } = data.data;
  const isStage = type === "STAGE";
  const stagiaire = (booking as any).stagiaire;
  const orderItem = (booking as any).orderItem;

  const handleRecordDiscount = async () => {
    if (!discountAmount || parseFloat(discountAmount) <= 0) return;
    if (!orderItem?.id) return;

    try {
      await recordFinalDiscount.mutateAsync({
        orderItemId: orderItem.id,
        amount: parseFloat(discountAmount),
        note: discountNote || undefined,
      });
      setIsDiscountDialogOpen(false);
      setDiscountAmount("");
      setDiscountNote("");
      refetch();
    } catch (error) {
      console.error("Error recording discount:", error);
    }
  };

  const handleFinalize = () => {
    if (!orderItem?.id) return;
    confirmFinalPayment.mutate(
      { orderItemId: orderItem.id, note: finalizeNote || undefined },
      {
        onSettled: () => {
          setIsFinalizeDialogOpen(false);
          setFinalizeNote("");
          refetch();
        },
      }
    );
  };
  const order = orderItem?.order;
  const client = order?.client;
  const allPayments = order?.payments || [];

  const paymentAllocations = (orderItem as any)?.paymentAllocations || [];

  // Stage or Bapteme specific data
  const activity = isStage ? (booking as any).stage : (booking as any).bapteme;
  const activityDate = isStage ? activity.startDate : activity.date;
  const moniteurs = activity.moniteurs || [];
  const bookingCategory = isStage
    ? (booking as any).type
    : (booking as any).category;
  const hasVideo = !isStage && (booking as any).hasVideo;

  // Payment calculations
  const totalPrice = orderItem?.totalPrice || 0;
  const depositAmount = orderItem?.depositAmount || 0;
  const isFullyPaid = orderItem?.isFullyPaid || false;
  // Both stages and baptemes can have deposits (bapteme: acompte + video paid upfront)
  const hasDeposit = depositAmount > 0;
  const promoDiscountAmount = (order as any)?.promoDiscountAmount || 0;
  const promoCodeUsed = (order as any)?.promoCode?.code as string | undefined;
  const usedGiftVoucher = (orderItem as any)?.usedGiftVoucher;
  const itemPromoDiscount = (orderItem as any)?.discountAmount || 0;
  const finalDiscountAmount = (orderItem as any)?.finalDiscountAmount || 0;
  const finalDiscountNote = (orderItem as any)?.finalDiscountNote as string | undefined;
  const finalDiscountDate = (orderItem as any)?.finalDiscountDate
    ? new Date((orderItem as any).finalDiscountDate)
    : null;

  // Separate online (Stripe) vs manual payments
  const totalOnlinePaid = paymentAllocations.reduce(
    (sum: number, allocation: any) => {
      if (
        allocation.payment?.status === "SUCCEEDED" &&
        !allocation.payment?.isManual
      ) {
        return sum + allocation.allocatedAmount;
      }
      return sum;
    },
    0,
  );

  const totalManualPaid = paymentAllocations.reduce(
    (sum: number, allocation: any) => {
      if (
        allocation.payment?.status === "SUCCEEDED" &&
        allocation.payment?.isManual
      ) {
        return sum + allocation.allocatedAmount;
      }
      return sum;
    },
    0,
  );

  const totalPaidAmount = totalOnlinePaid + totalManualPaid;

  // Dynamic remaining: totalPrice minus promo discount, all payments, and geste commercial
  const dynamicRemainingAmount = Math.max(
    0,
    totalPrice - itemPromoDiscount - totalPaidAmount - finalDiscountAmount,
  );

  // Get deposit payment date (first successful allocated payment)
  const depositAllocation = paymentAllocations.find(
    (a: any) => a.payment?.status === "SUCCEEDED",
  );
  const depositDate = depositAllocation?.payment
    ? new Date(depositAllocation.payment.createdAt)
    : null;

  // Get only payments allocated to this OrderItem with their allocated amounts
  const payments = paymentAllocations.map((allocation: any) => ({
    ...allocation.payment,
    allocatedAmount: allocation.allocatedAmount,
    allocationId: allocation.id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 p-0 h-auto hover:bg-transparent -ml-1"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">Retour aux réservations</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Détails de la réservation
          </h1>
          <p className="text-sm text-muted-foreground">
            {isStage ? "Stage" : "Baptême"} - Commande #{order?.orderNumber}
          </p>
        </div>
        <Badge
          variant={getBadgeVariant(order?.status || "")}
          className="text-base sm:text-lg px-4 py-2 w-fit"
        >
          {getStatusLabel(order?.status || "")}
        </Badge>
      </div>

      {/* Payment Information - MOVED TO TOP */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <EuroSignIcon className="h-5 w-5" />
                Informations de paiement
              </CardTitle>
              <CardDescription>
                Historique complet des paiements pour cette réservation
              </CardDescription>
            </div>
            {!isFullyPaid && dynamicRemainingAmount > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => setIsFinalizeDialogOpen(true)}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Confirmer paiement final
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => setIsDiscountDialogOpen(true)}
                >
                  <PercentIcon2 className="h-4 w-4 mr-2" />
                  Réduction finale
                </Button>
                <Dialog
                  open={isPaymentDialogOpen}
                  onOpenChange={setIsPaymentDialogOpen}
                >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Enregistrer un paiement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Enregistrer un paiement manuel</DialogTitle>
                    <DialogDescription>
                      Enregistrez un paiement reçu en physique pour cette
                      réservation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant reçu *</Label>
                      <div className="relative">
                        <EuroSignIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="0.00"
                          className="pl-10"
                          disabled={recordManualPayment.isPending}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reste à payer: {formatCurrency(dynamicRemainingAmount)}
                      </p>
                      {paymentAmount &&
                        parseFloat(paymentAmount) > dynamicRemainingAmount && (
                          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <AlertTriangleIcon className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-orange-900">
                              <p className="font-medium">
                                Attention : Montant supérieur au reste à payer
                              </p>
                              <p className="text-xs mt-1">
                                Le montant saisi (
                                {formatCurrency(parseFloat(paymentAmount))})
                                dépasse le reste à payer (
                                {formatCurrency(dynamicRemainingAmount)}). Vous pouvez
                                tout de même enregistrer ce paiement si
                                nécessaire.
                              </p>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Mode de paiement *</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(value: any) => setPaymentMethod(value)}
                        disabled={recordManualPayment.isPending}
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Espèces</SelectItem>
                          <SelectItem value="CARD">Carte Bancaire</SelectItem>
                          <SelectItem value="BANK_TRANSFER">
                            Virement
                          </SelectItem>
                          <SelectItem value="CHECK">Chèque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note">Note (optionnel)</Label>
                      <Textarea
                        id="note"
                        value={paymentNote}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setPaymentNote(e.target.value)
                        }
                        placeholder="Ex: Reçu en espèces le jour du stage"
                        rows={3}
                        disabled={recordManualPayment.isPending}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsPaymentDialogOpen(false)}
                        disabled={recordManualPayment.isPending}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleRecordPayment}
                        disabled={
                          recordManualPayment.isPending ||
                          !paymentAmount ||
                          parseFloat(paymentAmount) <= 0
                        }
                        className="flex-1"
                      >
                        {recordManualPayment.isPending
                          ? "Enregistrement..."
                          : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary - structured breakdown */}
          <div className="border rounded-lg overflow-hidden">
            {/* Prix total */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <EuroSignIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Prix total {isStage ? "du stage" : "du baptême"}
                  {hasVideo && " (+ vidéo)"}
                </span>
              </div>
              <span className="text-base font-bold">{formatCurrency(totalPrice)}</span>
            </div>

            {/* Réduction immédiate : promo ou bon cadeau */}
            {(itemPromoDiscount > 0 || usedGiftVoucher) && (
              <div className="flex items-start justify-between px-4 py-3 bg-green-50 border-t">
                <div className="flex items-start gap-2">
                  <TagIcon className="h-4 w-4 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {usedGiftVoucher
                        ? `Bon cadeau utilisé (${usedGiftVoucher.code})`
                        : `Code promo${promoCodeUsed ? ` ${promoCodeUsed}` : ""}`}
                    </p>
                    {order?.createdAt && (
                      <p className="text-xs text-green-700">
                        {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-green-700">
                  {usedGiftVoucher
                    ? `-${formatCurrency(totalPrice)}`
                    : `-${formatCurrency(itemPromoDiscount)}`}
                </span>
              </div>
            )}

            {/* Acompte versé en ligne */}
            {totalOnlinePaid > 0 && (
              <div className="flex items-start justify-between px-4 py-3 border-t bg-blue-50">
                <div className="flex items-start gap-2">
                  <CreditCardIcon2 className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Acompte versé en ligne</p>
                    {depositDate && (
                      <p className="text-xs text-blue-700">
                        {format(depositDate, "dd/MM/yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {formatCurrency(totalOnlinePaid)}
                </span>
              </div>
            )}

            {/* Réduction finale */}
            {finalDiscountAmount > 0 && (
              <div className="flex items-start justify-between px-4 py-3 border-t bg-amber-50">
                <div className="flex items-start gap-2">
                  <PercentIcon2 className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Réduction finale</p>
                    {finalDiscountNote && (
                      <p className="text-xs text-amber-700 italic">{finalDiscountNote}</p>
                    )}
                    {finalDiscountDate && (
                      <p className="text-xs text-amber-700">
                        {format(finalDiscountDate, "dd/MM/yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-700">
                  -{formatCurrency(finalDiscountAmount)}
                </span>
              </div>
            )}

            {/* Montant réglé en fin d'activité (paiements manuels) */}
            {totalManualPaid > 0 && (
              <div className="flex items-start justify-between px-4 py-3 border-t bg-slate-50">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Montant réglé en fin d&apos;activité
                    </p>
                    {orderItem?.finalPaymentDate && (
                      <p className="text-xs text-slate-600">
                        {format(new Date(orderItem.finalPaymentDate), "dd/MM/yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {formatCurrency(totalManualPaid)}
                </span>
              </div>
            )}

            {/* Solde restant */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-t ${
                isFullyPaid || dynamicRemainingAmount === 0
                  ? "bg-green-100"
                  : "bg-orange-100"
              }`}
            >
              <div className="flex items-center gap-2">
                {isFullyPaid || dynamicRemainingAmount === 0 ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-700" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4 text-orange-700" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isFullyPaid || dynamicRemainingAmount === 0
                      ? "text-green-800"
                      : "text-orange-800"
                  }`}
                >
                  {isFullyPaid || dynamicRemainingAmount === 0
                    ? "Solde soldé"
                    : "Solde restant à payer"}
                </span>
              </div>
              <span
                className={`text-lg font-bold ${
                  isFullyPaid || dynamicRemainingAmount === 0
                    ? "text-green-700"
                    : "text-orange-700"
                }`}
              >
                {isFullyPaid || dynamicRemainingAmount === 0
                  ? "✓ Soldé"
                  : formatCurrency(dynamicRemainingAmount)}
              </span>
            </div>
          </div>

          {/* Gift Cards Used removed */}

          {/* Payment History */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCardIcon2 className="h-4 w-4" />
              Historique des paiements
            </h4>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun paiement enregistré
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={getPaymentStatusBadge(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                        {payment.isManual && (
                          <Badge variant="outline">
                            {getPaymentMethodLabel(payment.manualPaymentMethod)}
                          </Badge>
                        )}
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {format(
                            new Date(payment.createdAt),
                            "dd/MM/yyyy 'à' HH:mm",
                            { locale: fr },
                          )}
                        </span>
                      </div>
                      {payment.isManual ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Paiement manuel pour cette réservation
                          </p>
                          {payment.recordedByUser && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Enregistré par:{" "}
                              <span className="font-medium">
                                {payment.recordedByUser.name}
                              </span>
                            </p>
                          )}
                          {payment.manualPaymentNote && (
                            <p className="text-xs sm:text-sm text-muted-foreground italic">
                              Note: {payment.manualPaymentNote}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Paiement en ligne (part allouée à cette réservation)
                          </p>
                          {payment.stripePaymentIntentId && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                              ID Stripe: {payment.stripePaymentIntentId}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                      <p className="text-xl font-bold">
                        {formatCurrency(
                          payment.allocatedAmount || payment.amount,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {payment.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Final Payment Note */}
          {orderItem?.finalPaymentDate && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                Paiement final en physique
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm mb-2">
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">
                    {format(
                      new Date(orderItem.finalPaymentDate),
                      "dd MMMM yyyy 'à' HH:mm",
                      { locale: fr },
                    )}
                  </span>
                </p>
                {orderItem.finalPaymentNote && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Note:</span>{" "}
                    <span className="font-medium">
                      {orderItem.finalPaymentNote}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Participant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Informations du stagiaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium text-lg">
                    {stagiaire.firstName} {stagiaire.lastName}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MailIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{stagiaire.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{stagiaire.phone}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <WeightIcon2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Poids</p>
                  <p className="font-medium">{stagiaire.weight} kg</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RulerIcon2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Taille</p>
                  <p className="font-medium">{stagiaire.height} cm</p>
                </div>
              </div>

              {stagiaire.birthDate && (
                <div className="flex items-start gap-3">
                  <CakeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date de naissance
                    </p>
                    <p className="font-medium">
                      {format(new Date(stagiaire.birthDate), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {client && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCardIcon2 className="h-4 w-4" />
                    Client payeur
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Nom:</span>{" "}
                      {client.firstName} {client.lastName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {client.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Téléphone:</span>{" "}
                      {client.phone}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Adresse:</span>{" "}
                      {client.address}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Ville:</span>{" "}
                      {client.postalCode} {client.city}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Pays:</span>{" "}
                      {client.country}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isStage ? (
                <CalendarIcon className="h-5 w-5" />
              ) : (
                <VideoIcon className="h-5 w-5" />
              )}
              Détails du {isStage ? "stage" : "baptême"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-lg">
                    {format(
                      new Date(activityDate),
                      isStage ? "dd MMMM yyyy" : "dd MMMM yyyy 'à' HH:mm",
                      { locale: fr },
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <ClockIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="font-medium">
                    {isStage
                      ? `${activity.duration} jours`
                      : `${activity.duration} minutes`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileTextIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Type/Catégorie
                  </p>
                  <p className="font-medium">
                    {getCategoryLabel(bookingCategory)}
                  </p>
                </div>
              </div>

              {hasVideo && (
                <div className="flex items-start gap-3">
                  <VideoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Option vidéo
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      <VideoIcon className="h-3 w-3 mr-1" />
                      Vidéo incluse
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Places</p>
                  <p className="font-medium">
                    {availablePlaces?.remaining || 0} restantes sur{" "}
                    {availablePlaces?.total || activity.places}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availablePlaces?.confirmed || 0} réservation(s)
                    confirmée(s)
                  </p>
                </div>
              </div>

              {moniteurs.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Moniteurs assignés
                      </p>
                      <div className="space-y-1">
                        {moniteurs.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-2">
                            <Badge variant="outline">{m.moniteur.name}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final discount dialog */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Enregistrer une réduction finale</DialogTitle>
            <DialogDescription>
              Geste commercial appliqué sur le solde restant (
              {formatCurrency(dynamicRemainingAmount)}). Non comptabilisé dans le
              chiffre d&apos;affaires.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Montant de la réduction *</Label>
              <div className="relative">
                <EuroSignIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={dynamicRemainingAmount}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  disabled={recordFinalDiscount.isPending}
                />
              </div>
              {discountAmount && parseFloat(discountAmount) > dynamicRemainingAmount && (
                <p className="text-xs text-destructive">
                  La réduction ne peut pas dépasser le solde restant ({formatCurrency(dynamicRemainingAmount)})
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountNote">Motif de la réduction (optionnel)</Label>
              <Textarea
                id="discountNote"
                value={discountNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDiscountNote(e.target.value)
                }
                placeholder="Ex: Journée annulée pour cause météo"
                rows={3}
                disabled={recordFinalDiscount.isPending}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDiscountDialogOpen(false)}
                disabled={recordFinalDiscount.isPending}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRecordDiscount}
                disabled={
                  recordFinalDiscount.isPending ||
                  !discountAmount ||
                  parseFloat(discountAmount) <= 0 ||
                  parseFloat(discountAmount) > dynamicRemainingAmount
                }
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {recordFinalDiscount.isPending ? "Enregistrement..." : "Appliquer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finalize payment dialog */}
      <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmer le paiement final</DialogTitle>
            <DialogDescription>
              Marque le solde de {formatCurrency(dynamicRemainingAmount)} comme reçu en
              physique. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="finalizeNote">Note (optionnel)</Label>
            <Textarea
              id="finalizeNote"
              value={finalizeNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFinalizeNote(e.target.value)
              }
              placeholder="Ex: Reçu en espèces le jour du stage"
              rows={3}
              disabled={confirmFinalPayment.isPending}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFinalizeDialogOpen(false)}
              disabled={confirmFinalPayment.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={confirmFinalPayment.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirmFinalPayment.isPending
                ? "Confirmation..."
                : "Confirmer le paiement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
