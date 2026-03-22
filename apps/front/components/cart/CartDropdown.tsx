"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionManager } from "@/lib/sessionManager";
import Link from "next/link";

interface CartItem {
  id: string;
  type: string;
  quantity: number;
  participantData: any;
  stage?: any;
  bapteme?: any;
  giftVoucherAmount?: number;
  expiresAt?: string;
}

function getItemLabel(item: CartItem): { main: string; sub?: string } {
  switch (item.type) {
    case "STAGE": {
      const stageType =
        item.participantData?.selectedStageType || item.stage?.type || "";
      return { main: `Stage ${stageType}` };
    }
    case "BAPTEME": {
      const category = item.participantData?.selectedCategory || "";
      return { main: `Baptême ${category}` };
    }
    case "GIFT_VOUCHER": {
      const sub =
        item.participantData?.voucherProductType === "STAGE"
          ? `Stage ${item.participantData?.voucherStageCategory || ""}`
          : `Baptême ${item.participantData?.voucherBaptemeCategory || ""}`;
      return { main: "Bon Cadeau", sub };
    }
    default:
      return { main: "Article" };
  }
}

function groupItems(items: CartItem[]) {
  const groups: Map<
    string,
    { count: number; label: { main: string; sub?: string } }
  > = new Map();
  for (const item of items) {
    const label = getItemLabel(item);
    const key = `${label.main}|${label.sub || ""}`;
    if (groups.has(key)) {
      groups.get(key)!.count += 1;
    } else {
      groups.set(key, { count: 1, label });
    }
  }
  return Array.from(groups.values());
}

export function CartDropdown() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadCartItems();

    const handleCartUpdate = () => loadCartItems();
    window.addEventListener("cartUpdated", handleCartUpdate);

    const interval = setInterval(loadCartItems, 30000);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadCartItems = async () => {
    try {
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
        const now = Date.now();
        const validItems = data.data.items.filter((item: CartItem) => {
          if (
            (item.type === "STAGE" || item.type === "BAPTEME") &&
            item.expiresAt
          ) {
            return new Date(item.expiresAt).getTime() > now;
          }
          return true;
        });
        setCartItems(validItems);
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    }
  };

  const groups = groupItems(cartItems);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full"
          title="Votre panier"
        >
          <ShoppingCart className="size-4" />
          {cartItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs pointer-events-none">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {cartItems.length === 0 ? (
          <p className="px-3 py-4 text-sm text-center text-slate-500">
            Votre panier est vide
          </p>
        ) : (
          <>
            <div className="px-3 py-2 space-y-2">
              {groups.map((group, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 text-sm tabular-nums shrink-0">
                    {group.count}×
                  </span>
                  <div>
                    <p className="text-sm text-slate-800">{group.label.main}</p>
                    {group.label.sub && (
                      <p className="text-xs text-slate-500">{group.label.sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <Link href="/checkout" onClick={() => setOpen(false)}>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:text-white"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Voir le panier
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
