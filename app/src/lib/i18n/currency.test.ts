import { describe, it, expect } from "vitest";
import { convertAmount, formatAmount } from "./currency";

describe("convertAmount", () => {
  it("returns same amount when currencies are equal", () => {
    expect(convertAmount(100, "EUR", "EUR")).toBe(100);
    expect(convertAmount(0, "EUR", "EUR")).toBe(0);
    expect(convertAmount(50000, "FCFA", "FCFA")).toBe(50000);
  });

  it("converts EUR to FCFA correctly", () => {
    const result = convertAmount(100, "EUR", "FCFA");
    expect(result).toBe(65596); // 100 * 655.957 rounded
  });

  it("converts FCFA to EUR correctly", () => {
    const result = convertAmount(65596, "FCFA", "EUR");
    expect(result).toBe(100);
  });

  it("returns 0 for invalid/negative amounts", () => {
    expect(convertAmount(-5, "EUR", "FCFA")).toBe(-5);
    expect(convertAmount(0, "EUR", "FCFA")).toBe(0);
  });

  it("handles missing currency gracefully", () => {
    expect(convertAmount(100, "", "FCFA")).toBe(100);
    expect(convertAmount(100, "EUR", "")).toBe(100);
    expect(convertAmount(100, "", "")).toBe(100);
  });

  it("handles unknown currencies", () => {
    expect(convertAmount(100, "GBP", "EUR")).toBe(100);
    expect(convertAmount(100, "EUR", "GBP")).toBe(100);
  });
});

describe("formatAmount", () => {
  it("formats in French locale", () => {
    // Intl.NumberFormat fr-FR utilise l'espace insécable fine (U+202F) comme séparateur de milliers
    const result = formatAmount(1000, "fr");
    expect(result.replace(/\u202f/g, " ")).toBe("1 000");
    expect(formatAmount(1000000, "fr").replace(/\u202f/g, " ")).toBe("1 000 000");
  });

  it("formats in English locale", () => {
    expect(formatAmount(1000, "en")).toBe("1,000");
    expect(formatAmount(1000000, "en")).toBe("1,000,000");
  });

  it("rounds to nearest integer", () => {
    expect(formatAmount(99.6, "fr")).toBe("100");
    expect(formatAmount(99.4, "fr")).toBe("99");
  });
});
