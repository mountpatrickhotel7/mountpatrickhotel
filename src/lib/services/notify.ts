import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/services/sms";
import { sendEmail } from "@/lib/services/email";
import { formatCurrency, formatCurrencyCode, formatDate } from "@/lib/format";
import { escapeHtml } from "@/lib/html";
import { HOTEL } from "@/lib/constants";

export interface BookingNotice {
  userId?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  reference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  total: number;
  payAtHotel: boolean;
  /** Guest chose to pay the hotel's MoMo merchant directly; money not in yet. */
  momoDue?: boolean;
}

async function record(
  channel: "sms" | "email",
  type: string,
  recipient: string | null | undefined,
  userId: string | null | undefined,
  ok: boolean,
  payload: Record<string, unknown>
) {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: userId ?? null,
      channel,
      type,
      recipient: recipient ?? null,
      payload,
      status: ok ? "sent" : "failed",
      sent_at: ok ? new Date().toISOString() : null,
    } as never);
  } catch (err) {
    console.error("notify:record failed", err);
  }
}

export async function sendBookingConfirmation(n: BookingNotice) {
  const dates = `${formatDate(n.checkIn)} → ${formatDate(n.checkOut)}`;
  const status = n.momoDue
    ? "Held — awaiting your MoMo payment"
    : n.payAtHotel
      ? "Reserved — pay on arrival"
      : "Confirmed & paid";

  // The MoMo guest needs the merchant number and their reference in hand, so
  // their SMS carries the payment instruction rather than the QR line.
  const smsBody = n.momoDue
    ? `Mount Patrick Hotel: Booking ${n.reference} held. ${n.roomName}, ${dates}. Send ${formatCurrencyCode(n.total)} to MoMo ${HOTEL.momo.number} (${HOTEL.momo.merchantName}) and quote ${n.reference}.`
    : `Mount Patrick Hotel: Booking ${n.reference} ${
        n.payAtHotel ? "reserved" : "confirmed"
      }. ${n.roomName}, ${dates}. Total ${formatCurrencyCode(n.total)}. Show your QR at reception.`;

  if (n.phone) {
    const r = await sendSms(n.phone, smsBody);
    await record("sms", "booking_confirmation", n.phone, n.userId, r.ok, {
      reference: n.reference,
    });
  }

  if (n.email) {
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
        <h2 style="font-family:Georgia,serif;color:#1b2233">Your reservation at ${HOTEL.name}</h2>
        <p>Dear ${escapeHtml(n.name)},</p>
        <p>Thank you for booking with us. Here are your details:</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#6e6553">Reference</td><td style="text-align:right"><strong>${escapeHtml(n.reference)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#6e6553">Room</td><td style="text-align:right">${escapeHtml(n.roomName)}</td></tr>
          <tr><td style="padding:6px 0;color:#6e6553">Stay</td><td style="text-align:right">${dates}</td></tr>
          <tr><td style="padding:6px 0;color:#6e6553">Total</td><td style="text-align:right">${formatCurrency(n.total)}</td></tr>
          <tr><td style="padding:6px 0;color:#6e6553">Status</td><td style="text-align:right">${status}</td></tr>
        </table>
        <p>We look forward to welcoming you to Kumasi.</p>
        <p style="color:#6e6553;font-size:13px">${HOTEL.name} · ${HOTEL.address}</p>
      </div>`;
    const r = await sendEmail({
      to: n.email,
      subject: `Booking ${n.reference} — ${HOTEL.name}`,
      html,
      text: smsBody,
    });
    await record("email", "booking_confirmation", n.email, n.userId, r.ok, {
      reference: n.reference,
    });
  }
}
