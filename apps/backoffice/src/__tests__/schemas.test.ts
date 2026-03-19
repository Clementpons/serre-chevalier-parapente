/**
 * schemas.test.ts
 * Unit tests for Zod validation schemas across all features.
 */

import { describe, it, expect } from "vitest";

// ─── Stages ──────────────────────────────────────────────────────────────────
import {
  CreateStageSchema,
  UpdateStageSchema,
  ApplyStagePromotionSchema,
} from "../features/stages/schemas";

describe("CreateStageSchema", () => {
  const valid = {
    startDate: "2026-06-01",
    duration: 5,
    places: 6,
    moniteurIds: ["moniteur-id-1"],
    price: 680,
    acomptePrice: 150,
    type: "INITIATION",
  };

  it("accepts valid data", () => {
    expect(CreateStageSchema.parse(valid)).toBeTruthy();
  });

  it("rejects invalid date", () => {
    expect(() => CreateStageSchema.parse({ ...valid, startDate: "not-a-date" })).toThrow();
  });

  it("rejects 0 duration", () => {
    expect(() => CreateStageSchema.parse({ ...valid, duration: 0 })).toThrow();
  });

  it("rejects 0 places", () => {
    expect(() => CreateStageSchema.parse({ ...valid, places: 0 })).toThrow();
  });

  it("rejects empty moniteurIds", () => {
    expect(() => CreateStageSchema.parse({ ...valid, moniteurIds: [] })).toThrow();
  });

  it("rejects negative price", () => {
    expect(() => CreateStageSchema.parse({ ...valid, price: -10 })).toThrow();
  });

  it("rejects invalid stage type", () => {
    expect(() => CreateStageSchema.parse({ ...valid, type: "UNKNOWN" })).toThrow();
  });
});

describe("ApplyStagePromotionSchema", () => {
  it("accepts valid promotion", () => {
    expect(
      ApplyStagePromotionSchema.parse({
        newPrice: 590,
        endDate: "2026-05-31",
        reason: "Promo printemps",
      })
    ).toBeTruthy();
  });

  it("accepts promotion without optional fields", () => {
    expect(ApplyStagePromotionSchema.parse({ newPrice: 590 })).toBeTruthy();
  });

  it("rejects negative price", () => {
    expect(() => ApplyStagePromotionSchema.parse({ newPrice: -1 })).toThrow();
  });

  it("rejects invalid endDate", () => {
    expect(() =>
      ApplyStagePromotionSchema.parse({ newPrice: 590, endDate: "not-a-date" })
    ).toThrow();
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../features/orders/schemas";

describe("CreateOrderSchema", () => {
  it("accepts minimum valid order", () => {
    expect(CreateOrderSchema.parse({ customerEmail: "client@email.fr" })).toBeTruthy();
  });

  it("rejects invalid email", () => {
    expect(() => CreateOrderSchema.parse({ customerEmail: "not-an-email" })).toThrow();
  });

  it("accepts with optional promoCodeId", () => {
    expect(
      CreateOrderSchema.parse({
        customerEmail: "client@email.fr",
        promoCodeId: "promo-id-123",
      })
    ).toBeTruthy();
  });

  it("accepts with full customerData", () => {
    expect(
      CreateOrderSchema.parse({
        customerEmail: "client@email.fr",
        customerData: {
          firstName: "Jean",
          lastName: "Dupont",
          phone: "0612345678",
          address: "12 rue de la Paix",
          postalCode: "75001",
          city: "Paris",
          country: "France",
        },
      })
    ).toBeTruthy();
  });
});

describe("UpdateOrderStatusSchema", () => {
  it("accepts valid status values", () => {
    const statuses = ["PENDING", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED"];
    statuses.forEach((status) => {
      expect(UpdateOrderStatusSchema.parse({ status })).toBeTruthy();
    });
  });

  it("rejects unknown status", () => {
    expect(() => UpdateOrderStatusSchema.parse({ status: "UNKNOWN" })).toThrow();
  });
});

// ─── Gift Vouchers ────────────────────────────────────────────────────────────
import {
  CreateGiftVoucherSchema,
  ValidateVoucherSchema,
  LookupVoucherSchema,
  ReserveVoucherSchema,
} from "../features/giftvouchers/schemas";

describe("CreateGiftVoucherSchema", () => {
  it("accepts valid STAGE voucher", () => {
    expect(
      CreateGiftVoucherSchema.parse({
        productType: "STAGE",
        stageCategory: "INITIATION",
        recipientName: "Marie Dupont",
        recipientEmail: "marie@email.fr",
        purchasePrice: 680,
      })
    ).toBeTruthy();
  });

  it("accepts valid BAPTEME voucher", () => {
    expect(
      CreateGiftVoucherSchema.parse({
        productType: "BAPTEME",
        baptemeCategory: "AVENTURE",
        recipientName: "Pierre Martin",
        recipientEmail: "pierre@email.fr",
      })
    ).toBeTruthy();
  });

  it("rejects STAGE voucher without stageCategory", () => {
    expect(() =>
      CreateGiftVoucherSchema.parse({
        productType: "STAGE",
        recipientName: "Marie Dupont",
        recipientEmail: "marie@email.fr",
      })
    ).toThrow();
  });

  it("rejects BAPTEME voucher without baptemeCategory", () => {
    expect(() =>
      CreateGiftVoucherSchema.parse({
        productType: "BAPTEME",
        recipientName: "Pierre Martin",
        recipientEmail: "pierre@email.fr",
      })
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      CreateGiftVoucherSchema.parse({
        productType: "STAGE",
        stageCategory: "INITIATION",
        recipientName: "Marie",
        recipientEmail: "not-an-email",
      })
    ).toThrow();
  });
});

describe("LookupVoucherSchema", () => {
  it("accepts valid code", () => {
    expect(LookupVoucherSchema.parse({ code: "GVSCP-TEST0001-STAG" })).toBeTruthy();
  });

  it("rejects empty code", () => {
    expect(() => LookupVoucherSchema.parse({ code: "" })).toThrow();
  });
});

describe("ValidateVoucherSchema", () => {
  it("accepts valid validation request", () => {
    expect(
      ValidateVoucherSchema.parse({
        code: "GVSCP-TEST0001-STAG",
        productType: "STAGE",
        category: "INITIATION",
      })
    ).toBeTruthy();
  });

  it("rejects invalid productType", () => {
    expect(() =>
      ValidateVoucherSchema.parse({
        code: "GVSCP-TEST0001",
        productType: "INVALID",
        category: "INITIATION",
      })
    ).toThrow();
  });
});

describe("ReserveVoucherSchema", () => {
  it("accepts valid reservation", () => {
    expect(
      ReserveVoucherSchema.parse({
        code: "GVSCP-TEST0001-STAG",
        sessionId: "session-uuid-1234",
      })
    ).toBeTruthy();
  });

  it("rejects empty sessionId", () => {
    expect(() =>
      ReserveVoucherSchema.parse({ code: "GVSCP-TEST", sessionId: "" })
    ).toThrow();
  });
});

// ─── Promo Codes ──────────────────────────────────────────────────────────────
import { CreatePromoCodeSchema } from "../features/promocodes/schemas";

describe("CreatePromoCodeSchema", () => {
  it("accepts valid FIXED discount", () => {
    expect(
      CreatePromoCodeSchema.parse({
        code: "PROMO10",
        discountType: "FIXED",
        discountValue: 50,
      })
    ).toBeTruthy();
  });

  it("accepts valid PERCENTAGE discount", () => {
    expect(
      CreatePromoCodeSchema.parse({
        code: "SUMMER2026",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountAmount: 80,
        minCartAmount: 200,
        maxUses: 100,
      })
    ).toBeTruthy();
  });

  it("rejects empty code", () => {
    expect(() =>
      CreatePromoCodeSchema.parse({ code: "", discountType: "FIXED", discountValue: 50 })
    ).toThrow();
  });

  it("rejects invalid discountType", () => {
    expect(() =>
      CreatePromoCodeSchema.parse({
        code: "TEST",
        discountType: "UNKNOWN",
        discountValue: 10,
      })
    ).toThrow();
  });

  it("rejects negative discountValue", () => {
    expect(() =>
      CreatePromoCodeSchema.parse({
        code: "TEST",
        discountType: "FIXED",
        discountValue: -5,
      })
    ).toThrow();
  });
});

// ─── Admin Reservation (Stage) ────────────────────────────────────────────────
import { CreateByAdminReservationStageSchema } from "../features/reservations/stages/schemas";

describe("CreateByAdminReservationStageSchema", () => {
  const valid = {
    customerId: "stagiaire-uuid-1",
    stageId: "stage-uuid-1",
    type: "INITIATION",
  };

  it("accepts valid data", () => {
    expect(CreateByAdminReservationStageSchema.parse(valid)).toBeTruthy();
  });

  it("accepts PROGRESSION type", () => {
    expect(
      CreateByAdminReservationStageSchema.parse({ ...valid, type: "PROGRESSION" })
    ).toBeTruthy();
  });

  it("accepts AUTONOMIE type", () => {
    expect(
      CreateByAdminReservationStageSchema.parse({ ...valid, type: "AUTONOMIE" })
    ).toBeTruthy();
  });

  it("rejects empty customerId", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({ ...valid, customerId: "" })
    ).toThrow();
  });

  it("rejects empty stageId", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({ ...valid, stageId: "" })
    ).toThrow();
  });

  it("rejects invalid type", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({ ...valid, type: "BIPLACE" })
    ).toThrow();
  });

  it("rejects missing type", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({
        customerId: valid.customerId,
        stageId: valid.stageId,
      })
    ).toThrow();
  });
});

// ─── Tarifs ───────────────────────────────────────────────────────────────────
import {
  UpdateTarifSchema,
  UpdateVideoOptionPriceSchema,
  UpdateStageBasePriceSchema,
  UpdateBaptemeDepositPriceSchema,
} from "../features/tarifs/schemas";

describe("Tarifs schemas", () => {
  it("UpdateTarifSchema: accepts valid data", () => {
    expect(UpdateTarifSchema.parse({ category: "AVENTURE", price: 120 })).toBeTruthy();
  });

  it("UpdateTarifSchema: rejects negative price", () => {
    expect(() => UpdateTarifSchema.parse({ category: "AVENTURE", price: -1 })).toThrow();
  });

  it("UpdateVideoOptionPriceSchema: accepts valid price", () => {
    expect(UpdateVideoOptionPriceSchema.parse({ price: 45 })).toBeTruthy();
  });

  it("UpdateStageBasePriceSchema: accepts valid data", () => {
    expect(
      UpdateStageBasePriceSchema.parse({ stageType: "INITIATION", price: 680 })
    ).toBeTruthy();
  });

  it("UpdateBaptemeDepositPriceSchema: accepts valid price", () => {
    expect(UpdateBaptemeDepositPriceSchema.parse({ price: 40 })).toBeTruthy();
  });

  it("UpdateBaptemeDepositPriceSchema: rejects negative price", () => {
    expect(() => UpdateBaptemeDepositPriceSchema.parse({ price: -10 })).toThrow();
  });
});
