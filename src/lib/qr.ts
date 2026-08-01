import QRCode from "qrcode";

export interface BookingQrPayload {
  ref: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
}

export function buildQrPayload(p: BookingQrPayload): string {
  return JSON.stringify(p);
}

export async function qrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#1b2233", light: "#ffffff" },
  });
}

/** PNG buffer of the QR — for embedding in PDFs. */
export async function qrPngBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#1b2233", light: "#ffffff" },
  });
}
