import "server-only";
import PDFDocument from "pdfkit";
import { HOTEL } from "@/lib/constants";
import { formatCurrencyCode, formatDate } from "@/lib/format";

const NAVY = "#1b2233";
const GOLD = "#b49157";
const GRAY = "#6e6553";

function toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function header(doc: PDFKit.PDFDocument, title: string) {
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text(HOTEL.name);
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text(HOTEL.tagline.toUpperCase());
  doc.fillColor(GRAY).fontSize(9).text(HOTEL.address);
  doc.text(`${HOTEL.phone}  ·  ${HOTEL.email}`);
  doc.moveDown(1);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(title);
  doc
    .moveTo(doc.x, doc.y + 4)
    .lineTo(555, doc.y + 4)
    .strokeColor(GOLD)
    .lineWidth(2)
    .stroke();
  doc.moveDown(1);
}

function kv(doc: PDFKit.PDFDocument, label: string, value: string) {
  const y = doc.y;
  doc.fillColor(GRAY).font("Helvetica").fontSize(10).text(label, 50, y);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(value, 250, y, {
    width: 305,
    align: "right",
  });
  doc.moveDown(0.6);
}

export interface ReceiptData {
  reference: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: string;
  paymentMode: string;
  /** PNG buffer of the booking QR, embedded so the printed receipt works at reception. */
  qr?: Buffer;
}

export async function bookingReceiptPdf(d: ReceiptData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  header(doc, "Booking Receipt");

  kv(doc, "Booking Reference", d.reference);
  kv(doc, "Guest", d.guestName);
  kv(doc, "Room", d.roomName);
  kv(doc, "Check-in", `${formatDate(d.checkIn)} · ${HOTEL.checkInTime}`);
  kv(doc, "Check-out", `${formatDate(d.checkOut)} · ${HOTEL.checkOutTime}`);
  kv(doc, "Nights", String(d.nights));
  kv(doc, "Payment", d.paymentMode === "pay_now" ? "Paid online (Paystack)" : "Pay at hotel");
  kv(doc, "Status", d.status);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(555, doc.y).strokeColor("#e4dac6").lineWidth(1).stroke();
  doc.moveDown(0.8);

  const y = doc.y;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Total", 50, y);
  doc.fillColor(GOLD).fontSize(13).text(formatCurrencyCode(d.total), 250, y, {
    width: 305,
    align: "right",
  });

  // Booking QR — present at reception for check-in.
  if (d.qr) {
    doc.moveDown(2.5);
    const qrSize = 120;
    const qrX = (doc.page.width - qrSize) / 2;
    const qrY = doc.y;
    doc.image(d.qr, qrX, qrY, { width: qrSize, height: qrSize });
    doc
      .fillColor(GRAY)
      .font("Helvetica")
      .fontSize(8)
      .text("Present this QR code at reception for check-in.", 50, qrY + qrSize + 6, {
        align: "center",
        width: 505,
      });
  }

  doc.moveDown(3);
  doc
    .fillColor(GRAY)
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Thank you for choosing ${HOTEL.name}. This receipt was generated on ${formatDate(
        new Date()
      )}.`,
      50,
      doc.y,
      { align: "center", width: 505 }
    );

  return toBuffer(doc);
}

export interface ReportRow {
  date: string;
  roomNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  amountPaid: number;
  status: string;
}

export interface ReportData {
  title: string;
  periodLabel: string;
  rows: ReportRow[];
  totalBookings: number;
  revenue: number;
  occupancyRate: number;
}

export async function reportPdf(d: ReportData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  header(doc, d.title);
  doc.fillColor(GRAY).font("Helvetica").fontSize(10).text(d.periodLabel);
  doc.moveDown(1);

  // Summary cards row
  const summary = [
    ["Total Bookings", String(d.totalBookings)],
    ["Revenue", formatCurrencyCode(d.revenue)],
    ["Occupancy", `${d.occupancyRate.toFixed(1)}%`],
  ];
  const startY = doc.y;
  summary.forEach(([label, value], i) => {
    const x = 50 + i * 172;
    doc.roundedRect(x, startY, 160, 52, 6).fillColor("#f4ecdb").fill();
    doc.fillColor(GRAY).font("Helvetica").fontSize(8).text(label.toUpperCase(), x + 12, startY + 10);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(value, x + 12, startY + 24);
  });
  doc.y = startY + 70;
  doc.x = 50;

  // Table header
  const cols = [
    { label: "Date", w: 70 },
    { label: "Room", w: 50 },
    { label: "Guest", w: 130 },
    { label: "Check-in", w: 75 },
    { label: "Check-out", w: 75 },
    { label: "Amount", w: 105 },
  ];
  function row(values: string[], bold = false, color = NAVY) {
    const y = doc.y;
    let x = 50;
    values.forEach((v, i) => {
      doc
        .fillColor(color)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8.5)
        .text(v, x, y, { width: cols[i].w - 6, align: i === 5 ? "right" : "left" });
      x += cols[i].w;
    });
    doc.y = y + 16;
  }

  row(cols.map((c) => c.label), true, GRAY);
  doc.moveTo(50, doc.y - 2).lineTo(555, doc.y - 2).strokeColor("#e4dac6").stroke();

  d.rows.forEach((r) => {
    if (doc.y > 760) {
      doc.addPage();
      doc.y = 50;
    }
    row([
      formatDate(r.date),
      r.roomNumber,
      r.guestName,
      formatDate(r.checkIn),
      formatDate(r.checkOut),
      formatCurrencyCode(r.amountPaid),
    ]);
  });

  return toBuffer(doc);
}
