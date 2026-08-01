import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyCode,
  nightsBetween,
  generateBookingReference,
  toISODate,
  formatDate,
} from "./format";

describe("formatCurrency", () => {
  it("formats GHS with two decimals", () => {
    const out = formatCurrency(1500);
    expect(out).toContain("1,500.00");
    expect(out).toMatch(/GH₵|GHS/);
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0.00");
  });
});

describe("formatCurrencyCode", () => {
  it("uses the GHS code, not the ₵ symbol (PDF/SMS safe)", () => {
    const out = formatCurrencyCode(3600);
    expect(out).toContain("GHS");
    expect(out).toContain("3,600.00");
    expect(out).not.toContain("₵");
  });
});

describe("nightsBetween", () => {
  it("counts whole nights", () => {
    expect(nightsBetween("2026-07-10", "2026-07-13")).toBe(3);
  });
  it("returns 0 for same day", () => {
    expect(nightsBetween("2026-07-10", "2026-07-10")).toBe(0);
  });
  it("never returns negative", () => {
    expect(nightsBetween("2026-07-13", "2026-07-10")).toBe(0);
  });
});

describe("generateBookingReference", () => {
  it("matches MP-XXXXXX with unambiguous charset", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateBookingReference()).toMatch(/^MP-[A-HJ-NP-Z2-9]{6}$/);
    }
  });
  it("is reasonably unique", () => {
    const set = new Set(Array.from({ length: 200 }, generateBookingReference));
    expect(set.size).toBeGreaterThan(190);
  });
});

describe("toISODate", () => {
  it("returns YYYY-MM-DD", () => {
    expect(toISODate(new Date("2026-06-21T15:30:00Z"))).toBe("2026-06-21");
  });
});

describe("formatDate", () => {
  it("renders a human date", () => {
    expect(formatDate("2026-06-21")).toMatch(/21 Jun 2026/);
  });
});
