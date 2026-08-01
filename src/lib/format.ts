import { HOTEL } from "./constants";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: HOTEL.currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Currency with the ISO code ("GHS 3,600.00") instead of the ₵ symbol.
 * Use in generated PDFs (PDFKit's base fonts lack the ₵ glyph) and SMS
 * (₵ isn't in the GSM 7-bit character set).
 */
export function formatCurrencyCode(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: HOTEL.currency,
    currencyDisplay: "code",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/** Booking reference like MP-7K2P9Q */
export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MP-${s}`;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
