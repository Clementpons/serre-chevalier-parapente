/**
 * phone-normalizer.test.ts
 *
 * Unit tests for normalizeMobileNumber() in src/lib/phone-normalizer.ts.
 * The function wraps google-libphonenumber and enforces French mobile (06/07)
 * numbers for SMS delivery via Twilio.
 */

import { describe, it, expect } from "vitest";
import { normalizeMobileNumber } from "@/lib/phone-normalizer";

describe("normalizeMobileNumber — empty / whitespace input", () => {
  it("returns isValid:false and 'Numéro vide' for empty string", () => {
    const result = normalizeMobileNumber("");
    expect(result.isValid).toBe(false);
    expect(result.formattedNumber).toBeNull();
    expect(result.error).toBe("Numéro vide");
  });

  it("returns isValid:false for whitespace-only string", () => {
    const result = normalizeMobileNumber("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Numéro vide");
  });
});

describe("normalizeMobileNumber — valid French mobile numbers", () => {
  it("normalises 06 local format to E.164", () => {
    const result = normalizeMobileNumber("0612345678");
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe("+33612345678");
    expect(result.error).toBeUndefined();
  });

  it("normalises 07 local format to E.164", () => {
    // 076x/079x ranges are allocated French mobile numbers (e.g. Free Mobile)
    const result = normalizeMobileNumber("0762345678");
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe("+33762345678");
  });

  it("accepts already-formatted E.164 +336 number", () => {
    const result = normalizeMobileNumber("+33612345678");
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe("+33612345678");
  });

  it("accepts already-formatted E.164 +337 number", () => {
    const result = normalizeMobileNumber("+33762345678");
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe("+33762345678");
  });

  it("handles spaces in the number", () => {
    const result = normalizeMobileNumber("06 12 34 56 78");
    expect(result.isValid).toBe(true);
    expect(result.formattedNumber).toBe("+33612345678");
  });
});

describe("normalizeMobileNumber — rejected French numbers", () => {
  it("rejects a Paris landline (01 prefix) with mobile-required error", () => {
    const result = normalizeMobileNumber("0123456789");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/06\/07/);
  });

  it("rejects a Lyon landline (04 prefix) with mobile-required error", () => {
    const result = normalizeMobileNumber("0412345678");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/06\/07/);
  });
});

describe("normalizeMobileNumber — invalid / unparseable numbers", () => {
  it("returns isValid:false for a non-numeric string", () => {
    const result = normalizeMobileNumber("not-a-number");
    expect(result.isValid).toBe(false);
    expect(result.formattedNumber).toBeNull();
  });

  it("returns isValid:false for a too-short number", () => {
    const result = normalizeMobileNumber("061234");
    expect(result.isValid).toBe(false);
  });
});
