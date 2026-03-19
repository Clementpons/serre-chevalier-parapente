"use client";

import { useGetOrderDetails } from "@/features/orders/api/use-get-order-details";
import { useUpdateOrderStatus } from "@/features/orders/api/use-update-order-status";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ChevronLeftIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon2,
  CalendarIcon,
  EuroSignIcon,
  CreditCardIcon2,
  CheckCircleIcon,
  VideoIcon,
  FileTextIcon,
  TagIcon,
  PercentIcon2,
  AlertTriangleIcon,
  ExternalLinkIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Acompte payé",
  PARTIALLY_PAID: "Acompte payé",
  FULLY_PAID: "Entièrement payée",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const STATUS_VARIANT: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  PARTIALLY_PAID: "bg-blue-100 text-blue-800 border-blue-200",
  FULLY_PAID: "bg-green-200 text-green-900 border-green-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  STAGE: "Stage",
  BAPTEME: "Baptême",
  GIFT_VOUCHER: "Bon cadeau",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement",
  CASH: "Espèces",
  CHECK: "Chèque",
};

const editableStatuses = ["PENDING", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED"] as const;
type EditableStatus = (typeof editableStatuses)[number];

interface OrderDetailsProps {
  id: string;
}

export function OrderDetails({ id }: OrderDetailsProps) {
  const router = useRouter();
  const { data: order, isLoading, error } = useGetOrderDetails(id);
  const updateStatus = useUpdateOrderStatus();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<EditableStatus>("CONFIRMED");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto hover:bg-transparent">
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Retour aux commandes
        </Button>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Commande introuvable
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Payment calculations ──────────────────────────────────────
  // Stripe payments only (not manual, not gift voucher)
  const totalOnlinePaid = order.payments
    .filter((p: any) => p.status === "SUCCEEDED" && !p.isManual && p.paymentType !== "GIFT_VOUCHER")
    .reduce((s: number, p: any) => s + p.amount, 0);

  const totalManualPaid = order.payments
    .filter((p: any) => p.status === "SUCCEEDED" && p.isManual)
    .reduce((s: number, p: any) => s + p.amount, 0);

  // Gift voucher payments (type = GIFT_VOUCHER, created for free orders)
  const totalGiftVoucherCovered = order.payments
    .filter((p: any) => p.status === "SUCCEEDED" && p.paymentType === "GIFT_VOUCHER")
    .reduce((s: number, p: any) => s + p.amount, 0);

  const promoDiscountAmount = order.promoDiscountAmount ?? 0;
  const promoCode = order.promoCode?.code as string | undefined;

  // Remaining = sum of per-item remaining (most accurate: avoids double-counting promo)
  // The promo was already deducted from the Stripe charge, so we don't subtract it again here.
  const totalRemaining = order.orderItems.reduce((sum: number, item: any) => {
    if (item.isFullyPaid) return sum; // soldé (bon cadeau, paiement final confirmé)
    const itemAllocations: any[] = item.paymentAllocations ?? [];
    const itemPaid = itemAllocations
      .filter((a: any) => a.payment?.status === "SUCCEEDED")
      .reduce((s: number, a: any) => s + a.allocatedAmount, 0);
    const promoShare = (item.discountAmount as number) ?? 0;
    const finalDiscount = (item.finalDiscountAmount as number) ?? 0;
    return sum + Math.max(0, item.totalPrice - itemPaid - promoShare - finalDiscount);
  }, 0);

  const isFullyPaid = order.status === "FULLY_PAID" || totalRemaining === 0;

  const handleStatusUpdate = () => {
    updateStatus.mutate(
      { param: { id: order.id }, json: { status: newStatus } },
      { onSettled: () => setStatusDialogOpen(false) },
    );
  };

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
            <span className="text-sm">Retour aux commandes</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Créée le {format(new Date(order.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${
              STATUS_VARIANT[order.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewStatus(order.status as EditableStatus);
              setStatusDialogOpen(true);
            }}
          >
            Changer le statut
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="h-5 w-5" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.client ? (
              <>
                <div className="flex items-start gap-3">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-base">
                      {order.client.firstName} {order.client.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm">{order.client.email}</p>
                </div>
                {order.client.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{order.client.phone}</p>
                  </div>
                )}
                {order.client.address && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm">
                      {order.client.address}, {order.client.postalCode} {order.client.city}
                      {order.client.country && `, ${order.client.country}`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun client associé</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <EuroSignIcon className="h-5 w-5" />
              Récapitulatif financier
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {/* Sous-total */}
              <div className="flex justify-between px-6 py-3">
                <span className="text-sm text-muted-foreground">Sous-total</span>
                <span className="text-sm font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {/* Promo code — informational only, already deducted from the Stripe charge */}
              {promoDiscountAmount > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-green-50">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-green-700" />
                    <span className="text-sm text-green-800">
                      Code promo{promoCode ? ` ${promoCode}` : ""}
                      <span className="text-xs text-green-600 ml-1">(sur acompte)</span>
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    -{formatCurrency(promoDiscountAmount)}
                  </span>
                </div>
              )}
              {/* Gift voucher coverage (real GIFT_VOUCHER payment type) */}
              {totalGiftVoucherCovered > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-green-50">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-green-700" />
                    <span className="text-sm text-green-800">Couvert par bons cadeaux</span>
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    -{formatCurrency(totalGiftVoucherCovered)}
                  </span>
                </div>
              )}
              {/* Paid online (Stripe only) */}
              {totalOnlinePaid > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-blue-50">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon2 className="h-4 w-4 text-blue-700" />
                    <span className="text-sm text-blue-800">Acompte payé en ligne (Stripe)</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatCurrency(totalOnlinePaid)}
                  </span>
                </div>
              )}
              {/* Paid manually */}
              {totalManualPaid > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-slate-700" />
                    <span className="text-sm text-slate-800">Règlements manuels (sur place)</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatCurrency(totalManualPaid)}
                  </span>
                </div>
              )}
              {/* Remaining */}
              <div
                className={`flex items-center justify-between px-6 py-3 ${
                  isFullyPaid ? "bg-green-100" : "bg-orange-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isFullyPaid ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-700" />
                  ) : (
                    <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      isFullyPaid ? "text-green-800" : "text-orange-800"
                    }`}
                  >
                    {isFullyPaid ? "Soldé" : "Solde restant"}
                  </span>
                </div>
                <span
                  className={`font-bold text-base ${
                    isFullyPaid ? "text-green-700" : "text-orange-700"
                  }`}
                >
                  {isFullyPaid ? "✓ Soldé" : formatCurrency(totalRemaining)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileTextIcon className="h-5 w-5" />
            Articles ({order.orderItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.orderItems.map((item: any) => {
            const pd = item.participantData as any;
            const participant = item.stageBooking?.stagiaire ?? item.baptemeBooking?.stagiaire;
            const isGiftVoucherUsed = !!pd?.usedGiftVoucherCode;

            // Per-item payment allocations
            const itemAllocations: any[] = item.paymentAllocations ?? [];
            const itemPaid = itemAllocations
              .filter((a: any) => a.payment?.status === "SUCCEEDED")
              .reduce((s: number, a: any) => s + a.allocatedAmount, 0);

            const itemPromoShare = (item.discountAmount as number) ?? 0;
            const itemFinalDiscount = (item.finalDiscountAmount as number) ?? 0;
            const itemRemaining = item.isFullyPaid
              ? 0
              : Math.max(0, item.totalPrice - itemPaid - itemPromoShare - itemFinalDiscount);
            const bookingId = item.stageBooking?.id ?? item.baptemeBooking?.id;

            return (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                {/* Item header */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {ITEM_TYPE_LABELS[item.type] ?? item.type}
                    </Badge>
                    <span className="font-semibold text-sm">
                      {item.type === "STAGE" && item.stage
                        ? `Stage ${item.stage.type} — ${format(new Date(item.stage.startDate), "dd MMM yyyy", { locale: fr })}`
                        : item.type === "BAPTEME" && item.bapteme
                          ? `Baptême ${pd?.selectedCategory ?? ""} — ${format(new Date(item.bapteme.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}`
                          : item.type === "GIFT_VOUCHER"
                            ? `Bon cadeau ${pd?.voucherProductType === "STAGE" ? `Stage ${pd?.voucherStageCategory ?? ""}` : `Baptême ${pd?.voucherBaptemeCategory ?? ""}`}`
                            : "Article"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-sm">{formatCurrency(item.totalPrice)}</span>
                    {bookingId && (
                      <Link href={`/dashboard/reservations/${bookingId}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Voir la réservation">
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Item body */}
                <div className="px-4 py-3 space-y-2 text-sm">
                  {/* Participant */}
                  {item.type !== "GIFT_VOUCHER" && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {participant
                          ? `${participant.firstName} ${participant.lastName}`
                          : pd?.firstName
                            ? `${pd.firstName} ${pd.lastName}`
                            : "—"}
                      </span>
                      {pd?.phone && <span className="text-xs">· {pd.phone}</span>}
                    </div>
                  )}

                  {/* Gift voucher buyer/recipient */}
                  {item.type === "GIFT_VOUCHER" && (
                    <div className="space-y-1 text-muted-foreground">
                      <p>Acheteur : <span className="text-foreground font-medium">{pd?.buyerName}</span> ({pd?.buyerEmail})</p>
                      <p>Bénéficiaire : <span className="text-foreground font-medium">{pd?.recipientName}</span>
                        {pd?.recipientEmail && ` (${pd.recipientEmail})`}
                      </p>
                      {item.generatedGiftVoucher?.code && (
                        <p>Code généré : <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{item.generatedGiftVoucher.code}</code></p>
                      )}
                    </div>
                  )}

                  {/* Gift voucher used */}
                  {isGiftVoucherUsed && (
                    <div className="flex items-center gap-2 text-green-700">
                      <TagIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>Bon cadeau utilisé : <code className="bg-green-50 px-1.5 py-0.5 rounded text-xs font-mono">{pd.usedGiftVoucherCode}</code></span>
                    </div>
                  )}

                  {/* Video option */}
                  {pd?.hasVideo && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <VideoIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>Option vidéo incluse</span>
                    </div>
                  )}

                  {/* Promo code discount on this item */}
                  {(item.discountAmount ?? 0) > 0 && (
                    <div className="flex items-center gap-2 text-green-700">
                      <TagIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">
                        Réduction promo (acompte) : -{formatCurrency(item.discountAmount)}
                        {item.effectiveDepositAmount != null && (
                          <span className="text-green-600 ml-1">
                            → Acompte effectif : {formatCurrency(item.effectiveDepositAmount)}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Final discount (geste commercial) */}
                  {itemFinalDiscount > 0 && (
                    <div className="flex items-center gap-2 text-amber-700">
                      <PercentIcon2 className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Réduction finale : -{formatCurrency(itemFinalDiscount)}
                        {item.finalDiscountNote && ` (${item.finalDiscountNote})`}
                      </span>
                    </div>
                  )}

                  <Separator className="my-1" />

                  {/* Per-item payment status */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Payé : <span className="text-foreground font-medium">{formatCurrency(itemPaid)}</span>
                    </span>
                    {item.type !== "GIFT_VOUCHER" && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          item.isFullyPaid || itemRemaining === 0
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.isFullyPaid || itemRemaining === 0
                          ? "Soldé"
                          : `Reste : ${formatCurrency(itemRemaining)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCardIcon2 className="h-5 w-5" />
            Historique des paiements
          </CardTitle>
          <CardDescription>
            {order.payments.filter((p: any) => p.status === "SUCCEEDED").length} paiement(s) réussi(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Aucun paiement enregistré</p>
          ) : (
            <div className="space-y-3">
              {order.payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          payment.status === "SUCCEEDED"
                            ? "default"
                            : payment.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {payment.status === "SUCCEEDED"
                          ? "Réussi"
                          : payment.status === "PENDING"
                            ? "En attente"
                            : "Échoué"}
                      </Badge>
                      {payment.isManual && (
                        <Badge variant="outline" className="text-xs">
                          {PAYMENT_METHOD_LABELS[payment.manualPaymentMethod] ?? payment.manualPaymentMethod}
                        </Badge>
                      )}
                      {!payment.isManual && (
                        <Badge variant="outline" className="text-xs">Stripe</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {payment.stripePaymentIntentId && (
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                        {payment.stripePaymentIntentId}
                      </p>
                    )}
                    {payment.isManual && payment.recordedByUser && (
                      <p className="text-xs text-muted-foreground">
                        Enregistré par {payment.recordedByUser.name}
                      </p>
                    )}
                    {payment.manualPaymentNote && (
                      <p className="text-xs text-muted-foreground italic">
                        {payment.manualPaymentNote}
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold shrink-0">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>Commande #{order.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="status">Nouveau statut</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as EditableStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editableStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateStatus.isPending || newStatus === order.status}
            >
              {updateStatus.isPending ? "Enregistrement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
