import "server-only";
import ExcelJS from "exceljs";
import type { ReportData } from "@/lib/services/pdf";
import { formatDate } from "@/lib/format";

export function reportCsv(d: ReportData): string {
  const header = ["Date", "Room", "Guest", "Check-in", "Check-out", "Amount Paid (GHS)", "Status"];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    `# ${d.title}`,
    `# ${d.periodLabel}`,
    `# Total bookings,${d.totalBookings},Revenue,${d.revenue.toFixed(2)},Occupancy,${d.occupancyRate.toFixed(1)}%`,
    "",
    header.join(","),
    ...d.rows.map((r) =>
      [
        formatDate(r.date),
        r.roomNumber,
        r.guestName,
        formatDate(r.checkIn),
        formatDate(r.checkOut),
        r.amountPaid.toFixed(2),
        r.status,
      ]
        .map(escape)
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function reportExcel(d: ReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Mount Patrick Hotel";
  const ws = wb.addWorksheet("Report");

  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = d.title;
  ws.getCell("A1").font = { size: 16, bold: true, color: { argb: "FF1B2233" } };

  ws.mergeCells("A2:G2");
  ws.getCell("A2").value = d.periodLabel;
  ws.getCell("A2").font = { italic: true, color: { argb: "FF6E6553" } };

  ws.getCell("A4").value = "Total Bookings";
  ws.getCell("B4").value = d.totalBookings;
  ws.getCell("C4").value = "Revenue (GHS)";
  ws.getCell("D4").value = d.revenue;
  ws.getCell("E4").value = "Occupancy";
  ws.getCell("F4").value = `${d.occupancyRate.toFixed(1)}%`;
  ["A4", "C4", "E4"].forEach((c) => (ws.getCell(c).font = { bold: true }));

  ws.getRow(6).values = ["Date", "Room", "Guest", "Check-in", "Check-out", "Amount Paid", "Status"];
  ws.getRow(6).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(6).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B2233" } };
  });

  d.rows.forEach((r) => {
    ws.addRow([
      formatDate(r.date),
      r.roomNumber,
      r.guestName,
      formatDate(r.checkIn),
      formatDate(r.checkOut),
      r.amountPaid,
      r.status,
    ]);
  });

  ws.columns.forEach((col) => {
    col.width = 16;
  });
  ws.getColumn(3).width = 24;

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
