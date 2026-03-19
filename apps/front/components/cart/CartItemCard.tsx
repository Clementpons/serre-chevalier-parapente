"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, Users, Clock, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";

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

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdate: () => void;
}

export function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const { getPrice, videoOptionPrice, loading: pricesLoading } = useBaptemePrices();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Only track expiration for STAGE and BAPTEME items
    if ((item.type === "STAGE" || item.type === "BAPTEME") && item.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiryTime = new Date(item.expiresAt!).getTime();
        const remaining = expiryTime - now;

        if (remaining <= 0) {
          setIsExpired(true);
          setTimeRemaining(0);
        } else {
          setIsExpired(false);
          setTimeRemaining(remaining);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [item.expiresAt, item.type]);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getItemTitle = () => {
    switch (item.type) {
      case "STAGE":
        // Utiliser selectedStageType du participantData si disponible, sinon fallback sur stage.type
        const stageType = item.participantData?.selectedStageType || item.stage?.type;
        return `Stage ${stageType} - ${formatDate(item.stage?.startDate)}`;
      case "BAPTEME":
        return `Baptême ${item.participantData.selectedCategory} - ${formatDate(item.bapteme?.date)}`;
      case "GIFT_VOUCHER":
        const voucherType = item.participantData.voucherProductType === 'STAGE'
          ? `Stage ${item.participantData.voucherStageCategory}`
          : `Baptême ${item.participantData.voucherBaptemeCategory}`;
        return `Bon Cadeau ${voucherType}`;
      default:
        return "Article";
    }
  };

  const getItemPrice = () => {
    switch (item.type) {
      case "STAGE":
        // Si bon cadeau utilisé, prix = 0
        if (item.participantData?.usedGiftVoucherCode) {
          return 0;
        }
        return item.stage?.price || 0;
      case "BAPTEME":
        // Si bon cadeau utilisé, prix = 0
        if (item.participantData?.usedGiftVoucherCode) {
          return 0;
        }
        const basePrice = getPrice(
          item.participantData.selectedCategory
        );
        const videoPrice = item.participantData.hasVideo ? videoOptionPrice : 0;
        return basePrice + videoPrice;
      case "GIFT_VOUCHER":
        return item.giftVoucherAmount || 0;
      default:
        return 0;
    }
  };


  const getIcon = () => {
    switch (item.type) {
      case "STAGE":
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case "BAPTEME":
        return <Users className="w-6 h-6 text-blue-600" />;
      case "GIFT_VOUCHER":
        return <Gift className="w-6 h-6 text-cyan-600" />;
      default:
        return <Calendar className="w-6 h-6 text-blue-600" />;
    }
  };

  const shouldShowTimer =
    (item.type === "STAGE" || item.type === "BAPTEME") &&
    timeRemaining !== null;

  return (
    <div
      className={`flex gap-3 p-3 border rounded-lg transition-all ${isExpired ? "opacity-50 bg-red-50 border-red-200" : ""}`}
    >
      {/* Icône */}
      <div
        className={`w-16 h-16 rounded-lg flex items-center justify-center ${
          isExpired
            ? "bg-red-100"
            : item.type === "GIFT_VOUCHER" || item.participantData?.usedGiftVoucherCode
            ? "bg-cyan-100"
            : "bg-blue-100"
        }`}
      >
        {getIcon()}
      </div>

      {/* Contenu */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{getItemTitle()}</h4>
          <div className="flex gap-1">
            {item.type === "GIFT_VOUCHER" && (
              <Badge className="text-xs bg-cyan-600 hover:bg-cyan-700">
                🎁 Bon Cadeau à offrir
              </Badge>
            )}
            {item.participantData?.usedGiftVoucherCode && item.type !== "GIFT_VOUCHER" && (
              <Badge className="text-xs bg-green-600 hover:bg-green-700">
                🎁 Bon Cadeau Appliqué
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expiré
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Pour: {item.type === "GIFT_VOUCHER"
            ? item.participantData.recipientName
            : `${item.participantData.firstName} ${item.participantData.lastName}`}
        </p>
        {item.type === "STAGE" && (
          <p className="text-xs text-gray-500 mt-1">
            {item.stage?.duration} jours
          </p>
        )}
        {item.type === "BAPTEME" && item.participantData.hasVideo && (
          <p className="text-xs text-green-600 mt-1">+ Option vidéo</p>
        )}

        {/* Timer d'expiration */}
        {shouldShowTimer && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${
              isExpired ? "text-red-600" : "text-orange-600 font-semibold"
            }`}
          >
            <Clock className="w-3 h-3" />
            {isExpired ? (
              <span>Place expirée</span>
            ) : (
              <span>Place bloquée: {formatTimeRemaining(timeRemaining!)}</span>
            )}
          </div>
        )}

        {item.participantData?.usedGiftVoucherCode && item.type !== "GIFT_VOUCHER" ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 line-through">
              {item.type === "STAGE"
                ? item.stage?.price
                : getPrice(item.participantData.selectedCategory)}€
            </p>
            <p className="font-bold text-sm text-green-600">0€</p>
            <p className="text-xs text-green-600 mt-1">
              Code: {item.participantData.usedGiftVoucherCode}
            </p>
          </div>
        ) : (
          <p className="font-semibold text-sm mt-2">
            {pricesLoading && item.type === 'BAPTEME' ? (
              <span className="inline-block w-12 h-4 bg-slate-200 animate-pulse rounded" />
            ) : `${getItemPrice()}€`}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
