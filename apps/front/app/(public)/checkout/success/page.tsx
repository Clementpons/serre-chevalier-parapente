"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";

type Order = {
  id: string;
  orderNumber: string;
  status?: string;
  subtotal?: number;
  discountAmount?: number;
  totalAmount: number;
  clientId?: string;
  appliedGiftCardId?: string | null;
  createdAt: string;
  updatedAt?: string;
  customerEmail?: string | null;
  orderItems?: OrderItem[];
  payments?: any[];
};
type ParticipantData = {
  email?: string;
  phone?: string;
  height?: number;
  weight?: number;
  hasVideo?: boolean;
  lastName?: string;
  firstName?: string;
  birthDate?: string;
  selectedCategory?: string;
  selectedStageType?: string;
  usedGiftVoucherCode?: string | null;
  voucherProductType?: string;
  voucherStageCategory?: string;
  voucherBaptemeCategory?: string;
  recipientName?: string;
  buyerName?: string;
  buyerEmail?: string;
  notifyRecipient?: boolean;
  personalMessage?: string;
};
type Stage = {
  id?: string;
  startDate?: string;
  duration?: number;
  places?: number;
  price?: number;
  acomptePrice?: number;
  type?: string;
};
type Bapteme = {
  id?: string;
  date?: string;
  duration?: number;
  places?: number;
  categories?: string[];
  acomptePrice?: number;
};
type OrderItem = {
  id: string;
  type: "STAGE" | "BAPTEME" | "GIFT_VOUCHER" | string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
  stageId?: string | null;
  baptemeId?: string | null;
  participantData?: ParticipantData | null;
  stage?: Stage | null;
  bapteme?: Bapteme | null;
  depositAmount?: number | null;
  remainingAmount?: number | null;
  isFullyPaid?: boolean;
  stageBooking?: any;
  baptemeBooking?: any;
};

function CheckoutSuccessPageContent() {
  const { getPrice, videoOptionPrice, loading: pricesLoading } = useBaptemePrices();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Google Ads Conversion Tracking
  useEffect(() => {
    if (order) {
      const alreadyTracked = localStorage.getItem(`order_tracked_${order.id}`);
      if (!alreadyTracked && typeof window !== "undefined") {
        const dataLayer = (window as any).dataLayer || [];
        dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: order.id,
            value: order.totalAmount,
            currency: "EUR",
            items: (order.orderItems || []).map((item: OrderItem) => ({
              item_id: item.id || "",
              price: item.totalPrice || 0,
              item_name:
                item.type +
                (item.stage ? ` ${item.stage.type ?? ""}` : "") +
                (item.bapteme ? ` ${item.participantData?.selectedCategory ?? ""}` : ""),
              item_category:
                item.type === "STAGE"
                  ? "Stage"
                  : item.type === "BAPTEME"
                  ? "Baptême"
                  : "Bon Cadeau",
              quantity: 1,
            })),
          },
        });
        localStorage.setItem(`order_tracked_${order.id}`, "true");
      }
    }
  }, [order]);

  const loadOrderDetails = async (orderIdParam: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/orders/${orderIdParam}`,
        { headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" } },
      );
      const data = await response.json();
      if (data.success) setOrder(data.data);
    } catch (error) {
      console.error("[SUCCESS PAGE] ❌ Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemTitle = (item: OrderItem) => {
    switch (item.type) {
      case "STAGE":
        return `Stage ${item.stage?.type ?? ""} — ${item.stage?.startDate ? formatDate(item.stage.startDate) : "Date non précisée"}`;
      case "BAPTEME":
        return `Baptême ${item.participantData?.selectedCategory ?? ""} — ${item.bapteme?.date ? formatDate(item.bapteme.date) : "Date non précisée"}`;
      case "GIFT_VOUCHER": {
        const voucherType =
          item.participantData?.voucherProductType === "STAGE"
            ? `Stage ${item.participantData?.voucherStageCategory ?? ""}`
            : `Baptême ${item.participantData?.voucherBaptemeCategory ?? ""}`;
        return `Bon Cadeau — ${voucherType}`;
      }
      default:
        return "Article";
    }
  };

  const getStageDeposit = (stage: any) =>
    stage?.acomptePrice || Math.round((stage?.price || 0) * 0.33);

  const getStageRemaining = (stage: any) =>
    (stage?.price || 0) - getStageDeposit(stage);

  const getBaptemeDeposit = (bapteme?: Bapteme | null, participantData?: ParticipantData | null) => {
    const acompte = bapteme?.acomptePrice ?? 35;
    const videoPrice = participantData?.hasVideo ? videoOptionPrice : 0;
    return acompte + videoPrice;
  };

  const getBaptemeRemaining = (bapteme?: Bapteme | null, participantData?: ParticipantData | null) => {
    const basePrice = getPrice(participantData?.selectedCategory ?? "");
    const acompte = bapteme?.acomptePrice ?? 35;
    return basePrice - acompte;
  };

  const calculateTotals = () => {
    let depositTotal = 0;
    let remainingTotal = 0;
    const futurePayments: { amount: number; date: string; description: string; participantName: string }[] = [];

    order?.orderItems?.forEach((item: any) => {
      if (item.participantData?.usedGiftVoucherCode) return;

      if (item.type === "STAGE") {
        const deposit = getStageDeposit(item.stage);
        const remaining = getStageRemaining(item.stage);
        depositTotal += deposit;
        remainingTotal += remaining;
        if (remaining > 0) {
          futurePayments.push({
            amount: remaining,
            date: item.stage?.startDate,
            description: `Solde Stage ${item.stage?.type}`,
            participantName: `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim(),
          });
        }
      } else if (item.type === "BAPTEME") {
        const deposit = getBaptemeDeposit(item.bapteme, item.participantData);
        const remaining = getBaptemeRemaining(item.bapteme, item.participantData);
        depositTotal += deposit;
        remainingTotal += remaining;
        if (remaining > 0) {
          futurePayments.push({
            amount: remaining,
            date: item.bapteme?.date,
            description: `Solde Baptême ${item.participantData.selectedCategory}`,
            participantName: `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim(),
          });
        }
      } else {
        depositTotal += item.totalPrice;
      }
    });

    const promoDiscount = order?.discountAmount || 0;
    return { depositTotal: Math.max(0, depositTotal - promoDiscount), remainingTotal, futurePayments };
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // ── États de chargement / erreur ────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre confirmation...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-4">Impossible de récupérer les détails de votre commande</p>
          <Button onClick={() => (window.location.href = "/")}>Retour à l&apos;accueil</Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  // ── Page principale ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Barre de progression — toutes les étapes complétées */}
      <div className="bg-white border-b shadow-sm pt-16 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {[{ label: "Panier" }, { label: "Informations" }, { label: "Paiement" }].map(({ label }, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <div className="h-px w-10 bg-emerald-400" />}
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 print:px-8 print:py-0 space-y-4">

        {/* Titre d'impression */}
        <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-gray-300">
          <h1 className="text-2xl font-bold text-gray-800">Confirmation de commande</h1>
          <p className="text-gray-600">Commande {order.orderNumber} — {formatDateTime(order.createdAt)}</p>
        </div>

        {/* Header succès */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Réservation confirmée !</h1>
          <p className="text-gray-500 text-sm">
            {totals.depositTotal === 0
              ? "Votre réservation a été validée grâce à votre bon cadeau"
              : "Votre paiement a été traité avec succès"}
          </p>
        </div>

        {/* Informations commande */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Commande {order.orderNumber}</h2>
            <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">✓ Confirmée</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Heure</p>
              <p className="font-medium">{formatTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Email de confirmation</p>
              <p className="font-medium truncate">{order.customerEmail}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3">
              <User className="w-4 h-4 text-gray-400" /> Informations client
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Nom complet</p>
                <p className="font-medium">
                  {order.orderItems?.[0]?.participantData?.firstName || "Non spécifié"}{" "}
                  {order.orderItems?.[0]?.participantData?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Téléphone</p>
                <p className="font-medium">{order.orderItems?.[0]?.participantData?.phone || "Non spécifié"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs mb-0.5">Email</p>
                <p className="font-medium">
                  {order.orderItems?.[0]?.participantData?.email || order.customerEmail || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Détail des réservations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Détail de votre commande</h2>

          <div className="space-y-3">
            {order.orderItems?.map((item: OrderItem) => (
              <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-start mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">{getItemTitle(item)}</h4>
                      {item.type === "GIFT_VOUCHER" && (
                        <Badge className="bg-cyan-600 text-xs">🎁 Bon cadeau</Badge>
                      )}
                      {item.participantData?.usedGiftVoucherCode && item.type !== "GIFT_VOUCHER" && (
                        <Badge className="bg-green-600 text-xs">🎁 Bon cadeau appliqué</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.type === "GIFT_VOUCHER"
                        ? `Pour : ${item.participantData?.recipientName ?? "Non spécifié"}`
                        : `Participant : ${item.participantData?.firstName ?? ""} ${item.participantData?.lastName ?? ""}`}
                    </p>
                    {item.participantData?.usedGiftVoucherCode && item.type !== "GIFT_VOUCHER" && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Code : {item.participantData.usedGiftVoucherCode}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 mb-0.5">Prix total</p>
                    {item.participantData?.usedGiftVoucherCode && item.type !== "GIFT_VOUCHER" ? (
                      <>
                        <p className="text-xs text-gray-400 line-through">
                          {item.type === "STAGE"
                            ? item.stage?.price
                            : getPrice(item.participantData.selectedCategory || "")}€
                        </p>
                        <p className="font-bold text-green-600">0€</p>
                      </>
                    ) : (
                      <p className="font-bold text-gray-900">{item.totalPrice}€</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif des paiements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Récapitulatif des paiements</h2>

          {/* Montant payé aujourd'hui */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-green-700 uppercase font-semibold tracking-wide mb-0.5">Payé aujourd&apos;hui</p>
                {(order.discountAmount ?? 0) > 0 && (
                  <p className="text-xs text-green-600 mb-0.5">Code promo appliqué : <strong>-{(order.discountAmount ?? 0).toFixed(2)}€</strong></p>
                )}
                <p className="text-2xl font-bold text-green-600">{totals.depositTotal.toFixed(2)}€</p>
                <p className="text-xs text-green-600 mt-1">
                  Transaction le {formatDateTime(order.createdAt)}
                </p>
              </div>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">✓ Payé</span>
            </div>

            {/* Détail des acomptes */}
            {order.orderItems?.some(
              (item: any) => (item.type === "STAGE" || item.type === "BAPTEME") && !item.participantData?.usedGiftVoucherCode,
            ) && (
              <div className="pt-3 border-t border-green-200 space-y-1.5">
                <p className="text-xs font-semibold text-green-800 mb-1">Détail des acomptes :</p>
                {order.orderItems
                  ?.filter((item: OrderItem) => !item.participantData?.usedGiftVoucherCode)
                  ?.map((item: OrderItem) => {
                    if (item.type === "STAGE") {
                      return (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-green-700">
                            Acompte stage {item.stage?.type ?? ""} — {item.participantData?.firstName ?? ""} {item.participantData?.lastName ?? ""}
                            <span className="block text-green-600">{formatDate(item.stage?.startDate ?? "")}</span>
                          </span>
                          <span className="font-semibold text-green-900">{getStageDeposit(item.stage)}€</span>
                        </div>
                      );
                    } else if (item.type === "BAPTEME") {
                      return (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-green-700">
                            Acompte baptême {item.participantData?.selectedCategory ?? ""} — {item.participantData?.firstName ?? ""} {item.participantData?.lastName ?? ""}
                            {item.participantData?.hasVideo && (
                              <span className="text-green-600"> + Vidéo ({pricesLoading ? "…" : `${videoOptionPrice}€`})</span>
                            )}
                            <span className="block text-green-600">{formatDate(item.bapteme?.date ?? "")}</span>
                          </span>
                          <span className="font-semibold text-green-900">{getBaptemeDeposit(item.bapteme, item.participantData)}€</span>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}
          </div>

          {/* Solde restant à payer sur place */}
          {totals.remainingTotal > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 text-base leading-none mt-0.5">ℹ️</span>
                <div className="space-y-2 text-xs text-amber-900 flex-1">
                  <p>
                    <strong>Solde total à régler sur place : {totals.remainingTotal.toFixed(2)}€</strong>
                  </p>
                  <p>Les soldes sont à régler directement sur place le jour de chaque activité.</p>
                  <div className="space-y-2 pt-1">
                    {totals.futurePayments.map((payment, index) => (
                      <div key={index} className="border-l-2 border-amber-300 pl-3">
                        <p className="font-semibold">{payment.participantName}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-amber-700">{payment.description} — {formatDate(payment.date)}</span>
                          <span className="font-bold text-amber-900 ml-2">{payment.amount.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Réservations via bon cadeau */}
          {order.orderItems?.some((item: any) => item.participantData?.usedGiftVoucherCode) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-green-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Réservations validées via bon cadeau
              </h4>
              <p className="text-xs text-green-700">Ces réservations sont gratuites grâce à votre bon cadeau.</p>
              <div className="space-y-2">
                {order.orderItems
                  ?.filter((item: any) => item.participantData?.usedGiftVoucherCode)
                  .map((item: any) => {
                    const name = `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim();
                    const label =
                      item.type === "STAGE" && item.stage
                        ? `Stage ${item.stage?.type} — ${name}`
                        : `Baptême ${item.participantData.selectedCategory} — ${name}`;
                    const date =
                      item.type === "STAGE" ? item.stage?.startDate : item.bapteme?.date;
                    return (
                      <div key={item.id} className="flex justify-between text-xs border-l-2 border-green-300 pl-3">
                        <span className="text-green-700">
                          {label}
                          {date && <span className="block text-green-600">{formatDate(date)}</span>}
                          <span className="block text-green-600">Code : {item.participantData.usedGiftVoucherCode}</span>
                        </span>
                        <span className="font-semibold text-green-900 ml-2">0€</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Total général */}
          <div className="flex justify-between items-center pt-1">
            <p className="text-sm font-bold text-gray-900">Montant payé aujourd&apos;hui</p>
            <span className="text-xl font-bold text-green-600">{totals.depositTotal.toFixed(2)}€</span>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 print:hidden">
          <h2 className="font-semibold text-gray-900">Prochaines étapes</h2>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Confirmation par email</p>
              <p className="text-xs text-gray-500">Vous allez recevoir un email de confirmation avec tous les détails</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Tenez-vous prêts</p>
              <p className="text-xs text-gray-500">Enregistrez votre date et heure de vol dans votre agenda</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 print:hidden">
          <h2 className="font-semibold text-gray-900 mb-3">Besoin d&apos;aide ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                <a href="tel:0645913595" className="font-medium text-blue-600 hover:underline">06 45 91 35 95</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <a href="mailto:clementpons5@gmail.com" className="font-medium text-blue-600 hover:underline">
                  clementpons5@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden pb-8">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Download className="w-4 h-4" />
            Imprimer la confirmation
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            Retour à l&apos;accueil
          </Button>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre confirmation...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
