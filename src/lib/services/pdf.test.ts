import { describe, it, expect } from "vitest";
import { bookingReceiptPdf, reportPdf } from "./pdf";
import { qrPngBuffer, buildQrPayload } from "@/lib/qr";

describe("bookingReceiptPdf", () => {
  it("produces a valid PDF buffer", async () => {
    const buf = await bookingReceiptPdf({
      reference: "MP-7K2P9Q",
      guestName: "Ama Owusu",
      roomName: "Suite · Room 401",
      checkIn: "2026-07-10",
      checkOut: "2026-07-13",
      nights: 3,
      total: 5400,
      status: "Confirmed",
      paymentMode: "pay_now",
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buf.length).toBeGreaterThan(500);
  });

  it("embeds the QR code when provided", async () => {
    const qr = await qrPngBuffer(buildQrPayload({
      ref: "MP-7K2P9Q",
      guest: "Ama Owusu",
      room: "Suite · 401",
      checkIn: "2026-07-10",
      checkOut: "2026-07-13",
    }));
    const withQr = await bookingReceiptPdf({
      reference: "MP-7K2P9Q",
      guestName: "Ama Owusu",
      roomName: "Suite · Room 401",
      checkIn: "2026-07-10",
      checkOut: "2026-07-13",
      nights: 3,
      total: 5400,
      status: "Confirmed",
      paymentMode: "pay_now",
      qr,
    });
    expect(withQr.subarray(0, 5).toString()).toBe("%PDF-");
    // Embedding an image makes the document materially larger than the text-only one.
    expect(withQr.length).toBeGreaterThan(1500);
  });
});

describe("reportPdf", () => {
  it("produces a valid PDF buffer with rows", async () => {
    const buf = await reportPdf({
      title: "Daily Report",
      periodLabel: "Daily report · 2026-06-21",
      rows: [
        {
          date: "2026-06-21",
          roomNumber: "401",
          guestName: "Ama Owusu",
          checkIn: "2026-06-21",
          checkOut: "2026-06-23",
          amountPaid: 3600,
          status: "Confirmed",
        },
      ],
      totalBookings: 1,
      revenue: 3600,
      occupancyRate: 12.5,
    });
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
