/**
 * order-processing.test.ts
 *
 * Unit tests for the pure helper functions in src/lib/order-processing.ts.
 * DB-calling functions (createBookingsFromOrder, clearCart, finalizeOrder…) are
 * NOT tested here — they require integration tests with a real database.
 *
 * Covered: prepareEmailData()
 */

import { describe, it, expect, vi } from "vitest";

// Silence "server-only" guard (handled globally via vitest.config.ts alias).
// Mock the DB singleton and email senders so the module can be imported without
// a running database or Resend API key.
vi.mock("@/lib/prisma", () => ({ default: {} }));
vi.mock("@/lib/resend", () => ({
  sendOrderConfirmationEmail: vi.fn(),
  sendAdminNewOrderEmail: vi.fn(),
  sendGiftVoucherPurchaseEmail: vi.fn(),
}));

import { prepareEmailData } from "@/lib/order-processing";

// ---------------------------------------------------------------------------
// Test data builders
// ---------------------------------------------------------------------------

function makeStageItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "STAGE",
    depositAmount: 150,
    remainingAmount: 530,
    totalPrice: 680,
    participantData: {
      firstName: "Jean",
      lastName: "Dupont",
      phone: "0612345678",
    },
    stage: { startDate: "2026-06-15", type: "INITIATION" },
    ...overrides,
  };
}

function makeBaptemeItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "BAPTEME",
    depositAmount: 40,
    remainingAmount: 70,
    totalPrice: 110,
    participantData: {
      firstName: "Marie",
      lastName: "Martin",
      phone: "0712345678",
      selectedCategory: "AVENTURE",
    },
    bapteme: { date: "2026-07-20" },
    ...overrides,
  };
}

function makeGiftVoucherItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "GIFT_VOUCHER",
    totalPrice: 110,
    depositAmount: 0,
    remainingAmount: 0,
    participantData: {
      firstName: "Sophie",
      lastName: "Bernard",
      phone: "0612000000",
    },
    ...overrides,
  };
}

function makeOrder(
  items: ReturnType<typeof makeStageItem | typeof makeBaptemeItem | typeof makeGiftVoucherItem>[],
  overrides: Record<string, unknown> = {},
) {
  return {
    orderNumber: "ORD-20260316-001",
    createdAt: new Date("2026-03-16"),
    customerEmail: "client@test.fr",
    totalAmount: 800,
    discountAmount: 0,
    orderItems: items,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// prepareEmailData — basic structure
// ---------------------------------------------------------------------------

describe("prepareEmailData — basic structure", () => {
  it("returns orderNumber from the order", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.orderNumber).toBe("ORD-20260316-001");
  });

  it("returns customerEmail from the order", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.customerEmail).toBe("client@test.fr");
  });

  it("falls back to client.email when customerEmail is absent", () => {
    const order = makeOrder([], {
      customerEmail: undefined,
      client: { email: "admin@test.fr" },
    });
    const result = prepareEmailData(order);
    expect(result.customerEmail).toBe("admin@test.fr");
  });

  it("falls back to placeholder when no email at all", () => {
    const order = makeOrder([], { customerEmail: undefined });
    const result = prepareEmailData(order);
    expect(result.customerEmail).toContain("placeholder");
  });

  it("returns discountAmount from the order", () => {
    const result = prepareEmailData(makeOrder([], { discountAmount: 50 }));
    expect(result.discountAmount).toBe(50);
  });

  it("defaults discountAmount to 0 when absent", () => {
    const order = makeOrder([]);
    (order as any).discountAmount = undefined;
    const result = prepareEmailData(order);
    expect(result.discountAmount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// prepareEmailData — customer name / phone extraction
// ---------------------------------------------------------------------------

describe("prepareEmailData — customer name & phone", () => {
  it("extracts name from first participant's firstName + lastName", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.customerName).toBe("Jean Dupont");
  });

  it("extracts phone from first participant", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.customerPhone).toBe("0612345678");
  });

  it("falls back to 'Client' when orderItems is empty", () => {
    const result = prepareEmailData(makeOrder([]));
    expect(result.customerName).toBe("Client");
  });

  it("falls back to 'Non spécifié' when phone is absent", () => {
    const item = makeStageItem({ participantData: { firstName: "Jean", lastName: "D" } });
    const result = prepareEmailData(makeOrder([item]));
    expect(result.customerPhone).toBe("Non spécifié");
  });
});

// ---------------------------------------------------------------------------
// prepareEmailData — STAGE item totals
// ---------------------------------------------------------------------------

describe("prepareEmailData — STAGE items", () => {
  it("accumulates depositTotal from depositAmount", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.depositTotal).toBe(150);
  });

  it("accumulates remainingTotal from remainingAmount", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.remainingTotal).toBe(530);
  });

  it("adds a futurePayment entry when remainingAmount > 0", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.futurePayments).toHaveLength(1);
    expect(result.futurePayments[0].amount).toBe(530);
    expect(result.futurePayments[0].description).toBe("Solde Stage INITIATION");
    expect(result.futurePayments[0].participantName).toBe("Jean Dupont");
  });

  it("does NOT add a futurePayment when remainingAmount is 0", () => {
    const result = prepareEmailData(
      makeOrder([makeStageItem({ remainingAmount: 0 })]),
    );
    expect(result.futurePayments).toHaveLength(0);
  });

  it("sums depositTotal across multiple STAGE items", () => {
    const result = prepareEmailData(
      makeOrder([makeStageItem(), makeStageItem({ depositAmount: 200 })]),
    );
    expect(result.depositTotal).toBe(350);
  });
});

// ---------------------------------------------------------------------------
// prepareEmailData — BAPTEME item totals
// ---------------------------------------------------------------------------

describe("prepareEmailData — BAPTEME items", () => {
  it("accumulates depositTotal from depositAmount", () => {
    const result = prepareEmailData(makeOrder([makeBaptemeItem()]));
    expect(result.depositTotal).toBe(40);
  });

  it("adds a futurePayment with correct description", () => {
    const result = prepareEmailData(makeOrder([makeBaptemeItem()]));
    expect(result.futurePayments[0].description).toBe("Solde Baptême AVENTURE");
    expect(result.futurePayments[0].amount).toBe(70);
  });
});

// ---------------------------------------------------------------------------
// prepareEmailData — GIFT_VOUCHER item totals
// ---------------------------------------------------------------------------

describe("prepareEmailData — GIFT_VOUCHER items", () => {
  it("adds totalPrice to depositTotal", () => {
    const result = prepareEmailData(makeOrder([makeGiftVoucherItem()]));
    expect(result.depositTotal).toBe(110);
  });

  it("does NOT add a futurePayment for gift vouchers", () => {
    const result = prepareEmailData(makeOrder([makeGiftVoucherItem()]));
    expect(result.futurePayments).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// prepareEmailData — discount application
// ---------------------------------------------------------------------------

describe("prepareEmailData — discountAmount", () => {
  it("subtracts discountAmount from depositTotal", () => {
    const result = prepareEmailData(
      makeOrder([makeStageItem()], { discountAmount: 50 }),
    );
    expect(result.depositTotal).toBe(100); // 150 - 50
  });

  it("clamps depositTotal to 0 when discount exceeds deposits", () => {
    const result = prepareEmailData(
      makeOrder([makeStageItem({ depositAmount: 30 })], { discountAmount: 200 }),
    );
    expect(result.depositTotal).toBe(0);
  });

  it("does NOT apply discount when discountAmount is 0", () => {
    const result = prepareEmailData(makeOrder([makeStageItem()]));
    expect(result.depositTotal).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// prepareEmailData — mixed item types
// ---------------------------------------------------------------------------

describe("prepareEmailData — mixed item types", () => {
  it("correctly totals a mixed STAGE + BAPTEME + GIFT_VOUCHER cart", () => {
    const result = prepareEmailData(
      makeOrder([makeStageItem(), makeBaptemeItem(), makeGiftVoucherItem()]),
    );
    // depositTotal = 150 (stage) + 40 (bapteme) + 110 (gift)
    expect(result.depositTotal).toBe(300);
    // remainingTotal = 530 (stage) + 70 (bapteme)
    expect(result.remainingTotal).toBe(600);
    // futurePayments: one for stage, one for bapteme
    expect(result.futurePayments).toHaveLength(2);
  });
});
