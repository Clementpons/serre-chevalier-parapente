"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Mountain, Users, ChevronDown, ChevronUp, Clock, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import { CartItemCard } from "./CartItemCard";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
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

export function CartSidebar({ isScrolled }: { isScrolled: boolean }) {
  const { getPrice, videoOptionPrice, loading: pricesLoading } = useBaptemePrices();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    STAGE: true,
    BAPTEME: true,
    GIFT_VOUCHER: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCartItems();

    // Écouter les événements de mise à jour du panier
    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    // Rafraîchir le panier toutes les 30 secondes pour vérifier les expirations
    const refreshInterval = setInterval(() => {
      loadCartItems();
    }, 30000);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(refreshInterval);
    };
  }, []);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          headers: {
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Filtrer les items expirés côté client (le backend devrait aussi le faire)
        const now = new Date().getTime();
        const validItems = data.data.items.filter((item: CartItem) => {
          if ((item.type === 'STAGE' || item.type === 'BAPTEME') && item.expiresAt) {
            return new Date(item.expiresAt).getTime() > now;
          }
          return true;
        });

        // Si des items ont été filtrés, afficher un toast
        if (validItems.length < data.data.items.length) {
          toast({
            title: "Places expirées",
            description: "Certaines places réservées ont expiré et ont été retirées de votre panier.",
            variant: "destructive",
          });
        }

        setCartItems(validItems);
        setTotalAmount(data.data.totalAmount);
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    } finally {
      setLoading(false);
    }
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
        }
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Article supprimé",
          description: "L'article a été retiré de votre panier",
        });
        loadCartItems(); // Recharger le panier
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

  const clearCart = async () => {
    try {
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          method: "DELETE",
          headers: {
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Panier vidé",
          description: "Tous les articles ont été supprimés",
        });
        loadCartItems();
      }
    } catch (error) {
      console.error("Erreur vidage panier:", error);
    }
  };

  const groupItemsByType = () => {
    const groups: Record<string, CartItem[]> = {
      STAGE: [],
      BAPTEME: [],
      GIFT_VOUCHER: [],
    };

    cartItems.forEach((item) => {
      // GIFT_VOUCHER = achat de bon cadeau
      if (item.type === 'GIFT_VOUCHER') {
        groups.GIFT_VOUCHER.push(item);
      }
      // STAGE normal ou avec bon cadeau appliqué
      else if (item.type === 'STAGE') {
        groups.STAGE.push(item);
      }
      // BAPTEME normal ou avec bon cadeau appliqué
      else if (item.type === 'BAPTEME') {
        groups.BAPTEME.push(item);
      }
    });

    return groups;
  };

  const getSectionInfo = (type: string) => {
    switch (type) {
      case 'STAGE':
        return {
          title: 'Stages',
          icon: Mountain,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
        };
      case 'BAPTEME':
        return {
          title: 'Baptêmes',
          icon: Users,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
        };
      case 'GIFT_VOUCHER':
        return {
          title: 'Bons Cadeaux',
          icon: Gift,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200',
        };
      default:
        return {
          title: 'Articles',
          icon: ShoppingCart,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const toggleSection = (type: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`m-2 p-0.5 2xl:p-4 z-[70] transition-all duration-300 rounded-full
        ${isScrolled ? "fixed right-14 top-2" : "fixed right-16 top-[6vh]"}
        `}
        >
          <ShoppingCart className="size-4" />
          {cartItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg h-[100svh] z-[100] bg-gradient-to-b from-white to-slate-50 py-16 pb-32">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Votre panier</h2>
                <p className="text-sm text-gray-600">
                  {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Items du panier */}
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-8 h-8 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>Chargement...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Votre panier est vide</h3>
                <p className="text-gray-500 mb-6">
                  Découvrez nos expériences uniques en parapente
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/reserver";
                  }}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Explorer les activités
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupItemsByType()).map(([type, items]) => {
                  if (items.length === 0) return null;

                  const sectionInfo = getSectionInfo(type);
                  const IconComponent = sectionInfo.icon;
                  const isCollapsed = collapsedSections[type] ?? true;

                  return (
                    <div key={type} className="space-y-3">
                      {/* Section Header */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${sectionInfo.bgColor} ${sectionInfo.borderColor}`}
                        onClick={() => toggleSection(type)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${sectionInfo.bgColor} border ${sectionInfo.borderColor}`}>
                            <IconComponent className={`w-5 h-5 ${sectionInfo.color}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold text-sm ${sectionInfo.color}`}>
                              {sectionInfo.title}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {items.length} article{items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${sectionInfo.color}`}>
                            {pricesLoading && items.some(i => i.type === 'BAPTEME') ? (
                              <span className="inline-block w-12 h-4 bg-slate-200 animate-pulse rounded" />
                            ) : `${items.reduce((total, item) => {
                              switch (item.type) {
                                case 'STAGE':
                                  return total + (item.stage?.price || 0);
                                case 'BAPTEME':
                                  if (item.participantData?.usedGiftVoucherCode) {
                                    return total + 0;
                                  }
                                  const basePrice = getPrice(item.participantData.selectedCategory);
                                  const videoPrice = item.participantData.hasVideo ? videoOptionPrice : 0;
                                  return total + basePrice + videoPrice;
                                case 'GIFT_VOUCHER':
                                  return total + (item.giftVoucherAmount || 0);
                                default:
                                  return total;
                              }
                            }, 0)}€`}
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Section Items */}
                      {!isCollapsed && (
                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                          {items.map((item) => (
                            <CartItemCard
                              key={item.id}
                              item={item}
                              onRemove={() => removeItem(item.id)}
                              onUpdate={loadCartItems}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer avec total et checkout */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {/* Avertissement avec timer global si des places temporaires */}
              {cartItems.some(item => (item.type === 'STAGE' || item.type === 'BAPTEME') && item.expiresAt) && (
                <div className="space-y-3">
                  {/* Timer global - affiche le temps restant le plus court */}
                  {(() => {
                    const tempItems = cartItems.filter(item =>
                      (item.type === 'STAGE' || item.type === 'BAPTEME') && item.expiresAt
                    );
                    if (tempItems.length > 0) {
                      // Trouver l'item qui expire le plus tôt
                      const earliestExpiry = tempItems.reduce((earliest, item) => {
                        const itemExpiry = new Date(item.expiresAt!).getTime();
                        return itemExpiry < earliest ? itemExpiry : earliest;
                      }, new Date(tempItems[0].expiresAt!).getTime());
                      
                      const earliestItem = tempItems.find(item =>
                        new Date(item.expiresAt!).getTime() === earliestExpiry
                      );
                      
                      return earliestItem ? (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 animate-pulse" />
                            <div className="flex-1">
                              <p className="font-bold text-orange-900 text-sm mb-1">
                                Places temporairement bloquées
                              </p>
                              <p className="text-xs text-orange-800">
                                Finalisez votre paiement rapidement pour confirmer vos réservations.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    }
                    return null;
                  })()}
                </div>
              )}

              <div className="bg-slate-100 rounded-lg p-4 border border-slate-400">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-900">Total à payer</p>
                    <p className="text-2xl font-bold text-blue-600">{totalAmount.toFixed(2)}€</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-900">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-white hover:text-white"
                  size="lg"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/checkout";
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Voir mon panier en détail
                </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
