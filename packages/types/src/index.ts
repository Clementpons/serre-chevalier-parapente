// @serreche/types
// Shared TypeScript types between apps/front and apps/backoffice
// These types mirror the Prisma schema for use on the frontend without importing @prisma/client

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "MONITEUR" | "CUSTOMER";

export type CartItemType = "STAGE" | "BAPTEME" | "GIFT_VOUCHER";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "FULLY_PAID"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentType = "STRIPE" | "MANUAL" | "GIFT_VOUCHER";

export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type DiscountType = "FIXED" | "PERCENTAGE";

export type StageType = "INITIATION" | "PROGRESSION" | "AUTONOMIE";

export type BaptemeCategory =
  | "AVENTURE"
  | "DUREE"
  | "LONGUE_DUREE"
  | "ENFANT"
  | "HIVER";

export type GiftVoucherProductType = "STAGE" | "BAPTEME";

// ─── API Response wrapper ─────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight?: number;
  height?: number;
  birthDate?: string;
  selectedCategory?: BaptemeCategory;
  hasVideo?: boolean;
  selectedStageType?: StageType;
  voucherProductType?: GiftVoucherProductType;
  buyerName?: string;
  buyerEmail?: string;
  notifyRecipient?: boolean;
  usedGiftVoucherCode?: string;
}

export interface CartItem {
  id: string;
  type: CartItemType;
  quantity: number;
  stageId?: string;
  baptemeId?: string;
  giftVoucherAmount?: number;
  participantData: CartParticipantData;
  expiresAt?: string | null;
  price: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  type: CartItemType;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  createdAt: string;
  items: OrderItem[];
}
