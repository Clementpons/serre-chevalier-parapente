"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import {
  ShoppingCart,
  CreditCard,
  User,
  MapPin,
  Mountain,
  Users,
  Gift,
  ChevronDown,
  Trash2,
  AlertTriangle,
  Clock,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import { EditableParticipantDetails } from "@/components/checkout/EditableParticipantDetails";
import { VideoToggle } from "@/components/checkout/VideoToggle";
import { GiftVoucherDetails } from "@/components/checkout/GiftVoucherDetails";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";
import ResponsiveModal from "@/components/responsive-modal";

interface CartItem {
  id: string;
  type: string;
  quantity: number;
  participantData: any;
  stage?: any;
  bapteme?: any;
  giftVoucherAmount?: number;
  expiresAt?: string;
  createdAt?: string;
}

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  acceptedCGV: boolean;
  acceptedMarketing: boolean;
}

// Composant Timer pour les réservations temporaires
function ReservationTimer({
  cartItems,
  compact = false,
}: {
  cartItems: CartItem[];
  compact?: boolean;
}) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tempItems = cartItems.filter(
      (item) =>
        (item.type === "STAGE" || item.type === "BAPTEME") && item.expiresAt,
    );

    if (tempItems.length === 0) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const earliestExpiry = tempItems.reduce((earliest, item) => {
        const itemExpiry = new Date(item.expiresAt!).getTime();
        return itemExpiry < earliest ? itemExpiry : earliest;
      }, new Date(tempItems[0].expiresAt!).getTime());

      const remaining = earliestExpiry - now;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [cartItems]);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (timeRemaining === null) return null;

  const isUrgent = timeRemaining < 300000; // Moins de 5 minutes

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-orange-900 text-sm mb-1">
              Places temporairement bloquées
            </p>
            <p className="text-xs text-orange-800">
              Finalisez votre paiement rapidement. Temps restant :{" "}
              <span
                className={`font-bold ${
                  isUrgent ? "text-red-700" : "text-orange-900"
                }`}
              >
                {formatTimeRemaining(timeRemaining)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 rounded-full">
          <Clock className="w-8 h-8 text-orange-600 animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-orange-900 text-lg mb-2">
            Places temporairement bloquées
          </h3>
          <p className="text-sm text-orange-800 mb-2">
            Vos places sont réservées temporairement. Finalisez votre paiement
            rapidement pour confirmer vos réservations.
          </p>
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-orange-800 flex items-center gap-2 border-l-2 border-orange-400 pl-3">
              Temps restant :{" "}
              <span
                className={`font-bold text-lg ${
                  isUrgent ? "text-red-700" : "text-orange-900"
                }`}
              >
                {formatTimeRemaining(timeRemaining)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant LoadingOverlay pour les mises à jour
function LoadingOverlay({
  message = "Mise à jour en cours...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-lg font-semibold text-gray-800">{message}</p>
        <p className="text-sm text-gray-600 text-center">
          Veuillez patienter...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const {
    getPrice,
    videoOptionPrice,
    loading: pricesLoading,
  } = useBaptemePrices();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<
    Record<string, boolean>
  >({});
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [step, setStep] = useState<"cart" | "customer-info">("cart");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    id: string;
    code: string;
    label: string;
    discountAmount: number;
    applicableProductTypes: string[];
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();
  const { toast } = useToast();

  useEffect(() => {
    loadCartItems();
  }, []);

  // Re-valide le code promo à chaque changement du panier (ajout vidéo, suppression d'item…)
  useEffect(() => {
    if (!appliedPromo) return;
    const revalidate = async () => {
      const cartItemsBreakdown = cartItems.map((item) => ({
        type: item.type as "STAGE" | "BAPTEME" | "GIFT_VOUCHER",
        isGiftVoucherCovered: !!item.participantData?.usedGiftVoucherCode,
        amount:
          item.type === "STAGE"
            ? (item.stage?.price ?? 0)
            : item.type === "BAPTEME"
              ? getItemPrice(item)
              : (item.giftVoucherAmount ?? 0),
      }));
      const cartTotal = cartItemsBreakdown.reduce(
        (sum, i) => sum + i.amount,
        0,
      );
      const cartSubtotal = cartItems.reduce((sum, item) => {
        if (item.type === "STAGE") return sum + (item.stage?.price ?? 0);
        return sum + getItemPrice(item);
      }, 0);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/promocodes/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
            body: JSON.stringify({
              code: appliedPromo.code,
              cartTotal,
              cartSubtotal,
              cartItems: cartItemsBreakdown,
            }),
          },
        );
        const result = await res.json();
        if (result.success) {
          setAppliedPromo((prev) =>
            prev
              ? { ...prev, discountAmount: result.data.discountAmount }
              : null,
          );
        } else {
          setAppliedPromo(null);
        }
      } catch {
        // Échec silencieux — on garde le montant actuel
      }
    };
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, appliedPromo?.code]);

  const loadCartItems = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          headers: {
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setCartItems(data.data.items);
        setTotalAmount(data.data.totalAmount);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre panier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du panier",
        variant: "destructive",
      });
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;
    await removeItem(itemToDelete.id);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const removeItem = async (itemId: string) => {
    try {
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Article supprimé",
          description: "L'article a été retiré de votre panier",
        });
        loadCartItems(true);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur suppression item:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const getItemTitle = (item: CartItem) => {
    switch (item.type) {
      case "STAGE":
        const stageType =
          item.participantData?.selectedStageType || item.stage?.type;
        return `Stage ${stageType} - ${new Date(
          item.stage?.startDate,
        ).toLocaleDateString("fr-FR")}`;
      case "BAPTEME":
        return `Baptême ${item.participantData.selectedCategory} - ${new Date(
          item.bapteme?.date,
        ).toLocaleDateString("fr-FR")}`;
      case "GIFT_VOUCHER":
        const voucherType =
          item.participantData.voucherProductType === "STAGE"
            ? `Stage ${item.participantData.voucherStageCategory}`
            : `Baptême ${item.participantData.voucherBaptemeCategory}`;
        return `Bon Cadeau ${voucherType}`;
      default:
        return "Article";
    }
  };

  const formatTimeSlot = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + duration);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  const getItemPrice = (item: CartItem) => {
    switch (item.type) {
      case "STAGE":
        if (item.participantData?.usedGiftVoucherCode) return 0;
        return item.stage?.price || 0;
      case "BAPTEME":
        if (item.participantData?.usedGiftVoucherCode) return 0;
        const basePrice = getPrice(item.participantData.selectedCategory);
        const videoPrice = item.participantData.hasVideo ? videoOptionPrice : 0;
        return basePrice + videoPrice;
      case "GIFT_VOUCHER":
        return item.giftVoucherAmount || 0;
      default:
        return 0;
    }
  };

  const getStageDeposit = (stage: any) => {
    return stage?.acomptePrice || Math.round((stage?.price || 0) * 0.33);
  };

  const getStageRemaining = (stage: any) => {
    const deposit = getStageDeposit(stage);
    return (stage?.price || 0) - deposit;
  };

  const getBaptemeDeposit = (bapteme: any, participantData: any) => {
    const acompte = bapteme?.acomptePrice || 35;
    const videoPrice = participantData?.hasVideo ? videoOptionPrice : 0;
    return acompte + videoPrice;
  };

  const getBaptemeRemaining = (bapteme: any, participantData: any) => {
    const basePrice = getPrice(participantData.selectedCategory);
    const acompte = bapteme?.acomptePrice || 35;
    return basePrice - acompte;
  };

  const calculateTotals = () => {
    let depositTotal = 0;
    let remainingTotal = 0;
    let fullTotal = 0;
    const futurePayments: {
      amount: number;
      date: string;
      description: string;
      participantName: string;
    }[] = [];

    cartItems.forEach((item) => {
      if (item.type === "STAGE") {
        if (item.participantData?.usedGiftVoucherCode) {
          fullTotal += item.stage?.price || 0;
          return;
        }
        const deposit = getStageDeposit(item.stage);
        const remaining = getStageRemaining(item.stage);
        const itemTotal = item.stage?.price || 0;
        depositTotal += deposit;
        remainingTotal += remaining;
        fullTotal += itemTotal;
        if (remaining > 0) {
          const participantName = `${item.participantData?.firstName || ""} ${
            item.participantData?.lastName || ""
          }`.trim();
          futurePayments.push({
            amount: remaining,
            date: item.stage?.startDate,
            description: `Solde Stage ${item.stage?.type}`,
            participantName,
          });
        }
      } else if (item.type === "BAPTEME") {
        if (item.participantData?.usedGiftVoucherCode) {
          fullTotal += getPrice(item.participantData.selectedCategory);
          return;
        }
        const deposit = getBaptemeDeposit(item.bapteme, item.participantData);
        const remaining = getBaptemeRemaining(
          item.bapteme,
          item.participantData,
        );
        const itemTotal = getItemPrice(item);
        depositTotal += deposit;
        remainingTotal += remaining;
        fullTotal += itemTotal;
        if (remaining > 0) {
          const participantName = `${item.participantData?.firstName || ""} ${
            item.participantData?.lastName || ""
          }`.trim();
          futurePayments.push({
            amount: remaining,
            date: item.bapteme?.date,
            description: `Solde Baptême ${item.participantData.selectedCategory}`,
            participantName,
          });
        }
      } else {
        const itemTotal = getItemPrice(item);
        depositTotal += itemTotal;
        fullTotal += itemTotal;
      }
    });

    return { depositTotal, remainingTotal, fullTotal, futurePayments };
  };

  const groupItemsByType = () => {
    const groups: Record<string, CartItem[]> = {
      STAGE: [],
      BAPTEME: [],
      GIFT_VOUCHER: [],
    };
    cartItems.forEach((item) => {
      if (item.type === "GIFT_VOUCHER") groups.GIFT_VOUCHER.push(item);
      else if (item.type === "STAGE") groups.STAGE.push(item);
      else if (item.type === "BAPTEME") groups.BAPTEME.push(item);
    });
    return groups;
  };

  const getSectionInfo = (type: string) => {
    switch (type) {
      case "STAGE":
        return {
          title: "Stages",
          icon: Mountain,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        };
      case "BAPTEME":
        return {
          title: "Baptêmes",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "GIFT_VOUCHER":
        return {
          title: "Bons Cadeaux",
          icon: Gift,
          color: "text-cyan-600",
          bgColor: "bg-cyan-50",
        };
      default:
        return {
          title: "Articles",
          icon: ShoppingCart,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  const toggleItemDetails = (itemId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const applyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    if (calculateTotals().depositTotal === 0) {
      toast({
        title: "Code promo non applicable",
        description: "Votre panier est déjà gratuit.",
        variant: "destructive",
      });
      return;
    }
    setIsApplyingPromo(true);
    try {
      const cartItemsBreakdown = cartItems.map((item) => ({
        type: item.type as "STAGE" | "BAPTEME" | "GIFT_VOUCHER",
        isGiftVoucherCovered: !!item.participantData?.usedGiftVoucherCode,
        // Prix plein de l'article (la réduction s'applique sur le tarif total)
        // Les items couverts par bon cadeau seront exclus côté serveur
        amount:
          item.type === "STAGE"
            ? (item.stage?.price ?? 0)
            : item.type === "BAPTEME"
              ? getItemPrice(item)
              : (item.giftVoucherAmount ?? 0),
      }));
      const cartTotal = cartItemsBreakdown.reduce(
        (sum, i) => sum + i.amount,
        0,
      );
      // cartSubtotal = prix pleins pour la vérification du minCartAmount
      const cartSubtotal = cartItems.reduce((sum, item) => {
        if (item.type === "STAGE") return sum + (item.stage?.price ?? 0);
        return sum + getItemPrice(item);
      }, 0);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/promocodes/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            code: promoCodeInput.trim().toUpperCase(),
            cartTotal,
            cartSubtotal,
            cartItems: cartItemsBreakdown,
          }),
        },
      );
      const result = await res.json();
      if (result.success) {
        setAppliedPromo({
          id: result.data.promoCode.id,
          code: result.data.promoCode.code,
          label: result.data.promoCode.label ?? result.data.promoCode.code,
          discountAmount: result.data.discountAmount,
          applicableProductTypes:
            result.data.promoCode.applicableProductTypes ?? [],
        });
        toast({
          title: "Code promo appliqué !",
          description: `Réduction de ${result.data.discountAmount.toFixed(2)}€`,
        });
      } else {
        toast({
          title: "Code invalide",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le code promo",
        variant: "destructive",
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    console.log("[CHECKOUT] 🛒 Creating order", {
      timestamp: new Date().toISOString(),
      customerEmail: data.email,
      cartItemsCount: cartItems.length,
      giftVoucherItemsCount: cartItems.filter(
        (item) => item.type === "GIFT_VOUCHER",
      ).length,
    });

    setIsCreatingOrder(true);

    try {
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            customerEmail: data.email,
            customerData: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              address: data.address,
              postalCode: data.postalCode,
              city: data.city,
              country: data.country,
            },
            ...(appliedPromo ? { promoCodeId: appliedPromo.id } : {}),
          }),
        },
      );

      const result = await response.json();

      console.log("[CHECKOUT] 📥 Order creation response", {
        success: result.success,
        orderNumber: result.data?.order?.orderNumber,
        requiresPayment: result.data?.requiresPayment,
      });

      if (result.success) {
        const requiresPayment =
          result.data.requiresPayment !== false &&
          result.data.paymentIntent !== null;

        if (!requiresPayment) {
          toast({
            title: "Réservation confirmée ! 🎉",
            description: `Votre réservation ${result.data.order.orderNumber} a été validée`,
          });
          window.location.href = `/checkout/success?order=${result.data.order.id}`;
        } else {
          const clientSecret = result.data.paymentIntent.clientSecret;
          toast({
            title: "Commande créée !",
            description: `Commande ${result.data.order.orderNumber} créée avec succès`,
          });
          window.location.href = `/checkout/payment?order=${result.data.order.id}&client_secret=${clientSecret}`;
        }
      } else {
        toast({
          title: "Erreur",
          description:
            result.message || "Erreur lors de la création de la commande",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur création commande:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Chargement de votre commande
          </h2>
          <p className="text-gray-500">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 mb-8">
            Découvrez nos expériences uniques en parapente
          </p>
          <Button
            onClick={() => (window.location.href = "/reserver")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Explorer les activités
          </Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const todayAmount = Math.max(0, totals.depositTotal - discountAmount);

  // Répartition de la réduction promo par article (proportionnelle, floor + reste au dernier)
  const promoSharesMap = new Map<string, number>();
  if (appliedPromo && appliedPromo.discountAmount > 0) {
    const types = appliedPromo.applicableProductTypes;
    const getFullPrice = (item: (typeof cartItems)[0]) => {
      if (item.type === "STAGE")
        return (item.stage?.price ?? 0) * item.quantity;
      if (item.type === "BAPTEME") return getItemPrice(item) * item.quantity;
      return item.giftVoucherAmount ?? 0;
    };
    // Tri identique au serveur : prix DESC (le moins cher en dernier absorbe l'arrondi)
    const applicable = cartItems
      .filter((item) => {
        if (item.participantData?.usedGiftVoucherCode) return false;
        if (types.length > 0 && !types.includes(item.type)) return false;
        return true;
      })
      .sort((a, b) => getFullPrice(b) - getFullPrice(a));
    const applicableTotal = applicable.reduce(
      (sum, item) => sum + getFullPrice(item),
      0,
    );
    if (applicableTotal > 0) {
      let assigned = 0;
      for (let i = 0; i < applicable.length; i++) {
        const item = applicable[i];
        const isLast = i === applicable.length - 1;
        if (isLast) {
          promoSharesMap.set(
            item.id,
            Math.max(0, appliedPromo.discountAmount - assigned),
          );
        } else {
          const share = Math.floor(
            (appliedPromo.discountAmount * getFullPrice(item)) /
              applicableTotal,
          );
          promoSharesMap.set(item.id, share);
          assigned += share;
        }
      }
    }
  }

  // Récapitulatif des lignes de commande — utilisé dans les deux colonnes droites
  const SummaryLines = () => (
    <div className="space-y-2">
      {cartItems
        .filter((item) => !item.participantData?.usedGiftVoucherCode)
        .map((item) => {
          const baseDeposit =
            item.type === "STAGE"
              ? getStageDeposit(item.stage)
              : item.type === "BAPTEME"
                ? getBaptemeDeposit(item.bapteme, item.participantData)
                : getItemPrice(item);
          const promoShare = promoSharesMap.get(item.id) ?? 0;
          const effectiveDeposit = Math.max(0, baseDeposit - promoShare);
          return (
            <div key={item.id} className="space-y-0.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate mr-2 leading-tight">
                  {item.type === "STAGE"
                    ? `Acompte — ${getItemTitle(item)}`
                    : getItemTitle(item)}
                </span>
                <span className="font-medium whitespace-nowrap line-through text-gray-400">
                  {promoShare > 0
                    ? `${baseDeposit.toFixed(2)}€`
                    : `${baseDeposit.toFixed(2)}€`}
                </span>
              </div>
              {promoShare > 0 && (
                <>
                  <div className="flex justify-between text-xs text-green-600 pl-2">
                    <span>Réduction {appliedPromo!.code}</span>
                    <span>-{promoShare.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-800 font-semibold pl-2">
                    <span>→ Acompte effectif</span>
                    <span>{effectiveDeposit.toFixed(2)}€</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      {cartItems
        .filter((item) => item.participantData?.usedGiftVoucherCode)
        .map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-xs text-green-600"
          >
            <span className="truncate mr-2">
              {getItemTitle(item)} (bon cadeau)
            </span>
            <span>0€</span>
          </div>
        ))}
      <Separator className="my-2" />
      <div className="flex justify-between text-sm text-gray-700">
        <span>Acomptes ({appliedPromo ? "après réduction" : "total"})</span>
        <span>{todayAmount.toFixed(2)}€</span>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between items-baseline">
        <p className="font-bold text-gray-900 text-sm">
          À payer aujourd&apos;hui
        </p>
        <span className="text-xl font-bold text-blue-600">
          {todayAmount.toFixed(2)}€
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de progression */}
      <div className="bg-white border-b shadow-sm pt-16">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`flex items-center gap-2 ${step === "cart" ? "text-blue-600" : "text-emerald-600"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "cart" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}`}
              >
                {step === "customer-info" ? "✓" : "1"}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Panier
              </span>
            </div>
            <div
              className={`h-px w-10 ${step === "customer-info" ? "bg-blue-400" : "bg-gray-300"}`}
            />
            <div
              className={`flex items-center gap-2 ${step === "customer-info" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "customer-info" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                2
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Informations
              </span>
            </div>
            <div className="h-px w-10 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                3
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Paiement
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {step === "cart" ? (
          /* ── ÉTAPE 1 : Panier ─────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche — Articles (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.some(
                (item) =>
                  (item.type === "STAGE" || item.type === "BAPTEME") &&
                  item.expiresAt,
              ) && <ReservationTimer cartItems={cartItems} />}

              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
                <span className="text-sm text-gray-500">
                  {cartItems.length} article{cartItems.length > 1 ? "s" : ""}
                </span>
              </div>

              {Object.entries(groupItemsByType()).map(([type, items]) => {
                if (items.length === 0) return null;
                const sectionInfo = getSectionInfo(type);
                const IconComponent = sectionInfo.icon;

                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <IconComponent
                        className={`w-4 h-4 ${sectionInfo.color}`}
                      />
                      <h2
                        className={`text-xs font-semibold uppercase tracking-widest ${sectionInfo.color}`}
                      >
                        {sectionInfo.title}
                      </h2>
                    </div>

                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${sectionInfo.bgColor} flex-shrink-0 mt-0.5`}
                            >
                              <IconComponent
                                className={`w-4 h-4 ${sectionInfo.color}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                                {getItemTitle(item)}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.type === "GIFT_VOUCHER"
                                  ? `Pour : ${item.participantData.recipientName}`
                                  : `Pour : ${item.participantData.firstName} ${item.participantData.lastName}`}
                              </p>
                              {item.type === "BAPTEME" &&
                                item.bapteme?.startTime &&
                                item.bapteme?.duration && (
                                  <p className="text-xs text-blue-600 mt-1 font-medium">
                                    🕐{" "}
                                    {formatTimeSlot(
                                      item.bapteme.startTime,
                                      item.bapteme.duration,
                                    )}
                                  </p>
                                )}
                              {(item.type === "BAPTEME" ||
                                item.type === "STAGE" ||
                                item.type === "GIFT_VOUCHER") && (
                                <button
                                  type="button"
                                  onClick={() => toggleItemDetails(item.id)}
                                  className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                >
                                  {expandedDetails[item.id]
                                    ? "Masquer"
                                    : "Voir"}{" "}
                                  les détails
                                  <ChevronDown
                                    className={`w-3 h-3 transition-transform ${expandedDetails[item.id] ? "rotate-180" : ""}`}
                                  />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                              {item.type === "STAGE" &&
                                !item.participantData?.usedGiftVoucherCode && (
                                  <div className="text-right">
                                    {item.stage?.promotionOriginalPrice &&
                                      item.stage.price <
                                        item.stage.promotionOriginalPrice && (
                                        <p className="text-xs text-gray-400 line-through">
                                          {item.stage.promotionOriginalPrice}€
                                        </p>
                                      )}
                                    <p className="text-sm font-bold text-gray-800">
                                      {item.stage?.price}€
                                    </p>
                                    {(() => {
                                      const dep = getStageDeposit(item.stage);
                                      const share =
                                        promoSharesMap.get(item.id) ?? 0;
                                      const effDep = Math.max(0, dep - share);
                                      return (
                                        <>
                                          {share > 0 ? (
                                            <>
                                              <p className="text-xs text-green-600 font-semibold">
                                                Réduction : -{share}€
                                              </p>
                                              <p className="text-xs text-orange-600 font-semibold">
                                                Acompte : {effDep}€
                                              </p>
                                            </>
                                          ) : (
                                            <p className="text-xs text-orange-600">
                                              Acompte : {dep}€
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-500">
                                            Solde :{" "}
                                            {getStageRemaining(item.stage)}€
                                          </p>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              {item.type === "BAPTEME" &&
                                !item.participantData?.usedGiftVoucherCode && (
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">
                                      {getItemPrice(item)}€
                                    </p>
                                    {(() => {
                                      const dep = getBaptemeDeposit(
                                        item.bapteme,
                                        item.participantData,
                                      );
                                      const share =
                                        promoSharesMap.get(item.id) ?? 0;
                                      const effDep = Math.max(0, dep - share);
                                      return (
                                        <>
                                          {share > 0 ? (
                                            <>
                                              <p className="text-xs text-green-600 font-semibold">
                                                Réduction : -{share}€
                                              </p>
                                              <p className="text-xs text-orange-600 font-semibold">
                                                Acompte : {effDep}€
                                              </p>
                                            </>
                                          ) : (
                                            <p className="text-xs text-orange-600">
                                              Acompte : {dep}€
                                            </p>
                                          )}
                                        </>
                                      );
                                    })()}
                                    {item.participantData.hasVideo && (
                                      <p className="text-xs text-green-600">
                                        + Vidéo :{" "}
                                        {pricesLoading
                                          ? "…"
                                          : `${videoOptionPrice}€`}
                                      </p>
                                    )}
                                  </div>
                                )}
                              {item.type === "GIFT_VOUCHER" && (
                                <p className="text-sm font-bold text-gray-800">
                                  {getItemPrice(item)}€
                                </p>
                              )}
                              {item.participantData?.usedGiftVoucherCode && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs border">
                                  Bon cadeau ✓
                                </Badge>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(item)}
                                className="text-gray-300 hover:text-red-500 transition-colors mt-2"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {item.type === "BAPTEME" &&
                          !item.participantData.hasVideo &&
                          !item.participantData?.usedGiftVoucherCode && (
                            <div
                              className="px-4 pb-4 border-t border-gray-100 pt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <VideoToggle
                                itemId={item.id}
                                hasVideo={false}
                                onUpdate={() => loadCartItems(true)}
                                participantData={item.participantData}
                              />
                            </div>
                          )}

                        {(item.type === "BAPTEME" || item.type === "STAGE") &&
                          expandedDetails[item.id] && (
                            <div className="border-t border-gray-100 p-4 bg-gray-50">
                              <EditableParticipantDetails
                                participantData={item.participantData}
                                type={item.type as "BAPTEME" | "STAGE"}
                                itemId={item.id}
                                onUpdate={() => loadCartItems(true)}
                              />
                            </div>
                          )}
                        {item.type === "GIFT_VOUCHER" &&
                          expandedDetails[item.id] && (
                            <div className="border-t border-gray-100 p-4 bg-gray-50">
                              <GiftVoucherDetails
                                participantData={item.participantData}
                                itemId={item.id}
                                onUpdate={() => loadCartItems(true)}
                              />
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Colonne droite — Code promo + Récapitulatif + CTA (1/3) */}
            <div className="space-y-4 lg:sticky lg:top-6 h-fit">
              {/* Code promo — masqué si panier déjà gratuit */}
              {totals.depositTotal > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-400" />
                    Code promo
                  </h3>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-green-800">
                          <strong>{appliedPromo.code}</strong> appliqué
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          -{appliedPromo.discountAmount.toFixed(2)}€ de
                          réduction
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCodeInput("");
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={promoCodeInput}
                        onChange={(e) =>
                          setPromoCodeInput(e.target.value.toUpperCase())
                        }
                        placeholder="Code promo"
                        className="uppercase text-sm"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), applyPromoCode())
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo || !promoCodeInput.trim()}
                        className="shrink-0"
                      >
                        {isApplyingPromo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "OK"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Récapitulatif */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">
                  Récapitulatif
                </h3>
                <SummaryLines />
              </div>

              {/* CTA */}
              <Button
                onClick={() => setStep("customer-info")}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md"
              >
                Continuer
                <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
              </Button>

              {/* Info acompte / solde */}
              {totals.remainingTotal > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 text-base leading-none mt-0.5">
                      ℹ️
                    </span>
                    <div className="space-y-1.5 text-xs text-amber-900">
                      <p>
                        <strong>Acompte de {todayAmount.toFixed(2)}€</strong> à
                        régler aujourd&apos;hui pour confirmer votre
                        réservation.
                      </p>
                      <p>
                        Le solde de{" "}
                        <strong>{totals.remainingTotal.toFixed(2)}€</strong>{" "}
                        sera réglé directement sur place le jour de votre
                        activité.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signaux de confiance */}
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                <span>🔒 SSL</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Stripe
                </span>
                <span>•</span>
                <span>TVA incluse</span>
              </div>
            </div>
          </div>
        ) : (
          /* ── ÉTAPE 2 : Informations ───────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche — Formulaire (2/3) */}
            <div className="lg:col-span-2">
              {cartItems.some(
                (item) =>
                  (item.type === "STAGE" || item.type === "BAPTEME") &&
                  item.expiresAt,
              ) && (
                <div className="mb-4">
                  <ReservationTimer cartItems={cartItems} compact />
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h1 className="text-xl font-bold text-gray-900">
                    Vos informations
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Renseignez vos coordonnées pour finaliser la réservation
                  </p>
                </div>

                <form
                  id="checkout-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-6"
                >
                  {/* Contact */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Contact
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName", {
                            required: "Prénom requis",
                          })}
                          placeholder="Jean"
                          className="mt-1"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName", { required: "Nom requis" })}
                          placeholder="Dupont"
                          className="mt-1"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", { required: "Email requis" })}
                        placeholder="jean.dupont@email.com"
                        className="mt-1"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        {...register("phone", { required: "Téléphone requis" })}
                        placeholder="06 12 34 56 78"
                        className="mt-1"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Adresse */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Adresse
                    </h2>
                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        {...register("address", {
                          required: "Adresse requise",
                        })}
                        placeholder="123 Rue de la Paix"
                        className="mt-1"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Code postal *</Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode", {
                            required: "Code postal requis",
                          })}
                          placeholder="75001"
                          className="mt-1"
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          {...register("city", { required: "Ville requise" })}
                          placeholder="Paris"
                          className="mt-1"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Pays *</Label>
                      <Input
                        id="country"
                        {...register("country", { required: "Pays requis" })}
                        placeholder="France"
                        defaultValue="France"
                        className="mt-1"
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Consentements RGPD */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Consentements
                    </h2>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="acceptedCGV"
                        {...register("acceptedCGV", {
                          required:
                            "Vous devez accepter les CGV pour continuer",
                        })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <Label
                          htmlFor="acceptedCGV"
                          className="cursor-pointer text-sm text-gray-700"
                        >
                          J&apos;accepte les{" "}
                          <a
                            href="/cgv"
                            target="_blank"
                            className="underline text-blue-600"
                          >
                            CGV
                          </a>{" "}
                          et la{" "}
                          <a
                            href="/privacy"
                            target="_blank"
                            className="underline text-blue-600"
                          >
                            Politique de confidentialité
                          </a>{" "}
                          *
                        </Label>
                        {errors.acceptedCGV && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.acceptedCGV.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="acceptedMarketing"
                        {...register("acceptedMarketing")}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="acceptedMarketing"
                        className="cursor-pointer text-sm text-gray-700"
                      >
                        J&apos;accepte de recevoir des offres commerciales de
                        Serre Chevalier Parapente{" "}
                        <span className="text-gray-400 text-xs">
                          (optionnel)
                        </span>
                      </Label>
                    </div>
                  </div>

                  {/* Bouton paiement — visible mobile uniquement */}
                  <Button
                    type="submit"
                    className="w-full lg:hidden bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md"
                    disabled={isCreatingOrder}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isCreatingOrder
                      ? "Création en cours…"
                      : `Payer ${todayAmount.toFixed(2)}€`}
                  </Button>
                </form>
              </div>
            </div>

            {/* Colonne droite — Récapitulatif sticky (1/3) */}
            <div className="space-y-4 lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-700">
                    Récapitulatif
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Modifier
                  </button>
                </div>
                <SummaryLines />
              </div>

              {/* Bouton paiement desktop */}
              <Button
                type="submit"
                form="checkout-form"
                className="w-full hidden lg:flex bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md"
                disabled={isCreatingOrder}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isCreatingOrder
                  ? "Création en cours…"
                  : `Payer ${todayAmount.toFixed(2)}€`}
              </Button>

              {/* Info acompte / solde */}
              {totals.remainingTotal > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 text-base leading-none mt-0.5">
                      ℹ️
                    </span>
                    <div className="space-y-1.5 text-xs text-amber-900">
                      <p>
                        <strong>Acompte de {todayAmount.toFixed(2)}€</strong> à
                        régler aujourd&apos;hui pour confirmer votre
                        réservation.
                      </p>
                      <p>
                        Le solde de{" "}
                        <strong>{totals.remainingTotal.toFixed(2)}€</strong>{" "}
                        sera réglé directement sur place le jour de votre
                        activité.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signaux de confiance */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒 Paiement sécurisé SSL</span>
                <span>•</span>
                <span>Stripe</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <ResponsiveModal
        title="Supression d'un article"
        description=""
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        {itemToDelete && (
          <div className="space-y-3">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer cet article de votre panier ?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="font-semibold text-sm text-gray-800">
                {getItemTitle(itemToDelete)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Pour: {itemToDelete.participantData.firstName}{" "}
                {itemToDelete.participantData.lastName}
              </p>
              {itemToDelete.type === "BAPTEME" &&
                itemToDelete.bapteme?.startTime &&
                itemToDelete.bapteme?.duration && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    🕐{" "}
                    {formatTimeSlot(
                      itemToDelete.bapteme.startTime,
                      itemToDelete.bapteme.duration,
                    )}
                  </p>
                )}
              {itemToDelete.type === "BAPTEME" &&
                itemToDelete.participantData.hasVideo && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    + Option vidéo
                  </p>
                )}
              <p className="text-sm font-bold text-gray-800 mt-2">
                {getItemPrice(itemToDelete)}€
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={confirmRemoveItem}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </ResponsiveModal>

      {isUpdating && (
        <LoadingOverlay message="Mise à jour de votre panier..." />
      )}
    </div>
  );
}
