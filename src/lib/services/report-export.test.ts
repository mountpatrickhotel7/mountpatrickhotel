import { describe, it, expect } from "vitest";
import { reportCsv, reportExcel } from "./report-export";
import type { ReportData } from "./pdf";

const data: ReportData = {
  title: "Daily Report",
  periodLabel: "Daily report · 2026-06-21",
  rows: [
    {
      date: "2026-06-21",
      roomNumber: "401",
      guestName: "Ama, Owusu",
      checkIn: "2026-06-21",
      checkOut: "2026-06-23",
      amountPaid: 3600,
      status: "Confirmed",
    },
  ],
  totalBookings: 1,
  revenue: 3600,
  occupancyRate: 12.5,
};

describe("reportCsv", () => {
  it("includes a header row and the summary", () => {
    const csv = reportCsv(data);
    expect(csv).toContain("Date,Room,Guest,Check-in,Check-out,Amount Paid (GHS),Status");
    expect(csv).toContain("Daily Report");
    expect(csv).toContain("3600.00");
  });

  it("quotes values containing commas", () => {
    const csv = reportCsv(data);
    expect(csv).toContain('"Ama, Owusu"');
  });
});

describe("reportExcel", () => {
  it("produces an xlsx (zip) buffer", async () => {
    const buf = await reportExcel(data);
    expect(Buffer.isBuffer(buf)).toBe(true);
    // xlsx files are zip archives → start with "PK"
    expect(buf.subarray(0, 2).toString()).toBe("PK");
  });
});
