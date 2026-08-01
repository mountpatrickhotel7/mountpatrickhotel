import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock, Download } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { MomoPaymentPanel } from "@/components/momo-payment-panel";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { qrDataUrl } from "@/lib/qr";
import { signQrPayload } from "@/lib/qr-sign";

export const metadata = { title: "Booking confirmed" };

type Params = Promise<{ reference: string }>;

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { reference } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, rooms(room_number, room_type)")
    .eq("reference", reference)
    .maybeSingle();

  if (!data) notFound();

  type B = {
    reference: string;
    status: string;
    payment_mode: string;
    guest_name: string | null;
    check_in: string;
    check_out: string;
    total_amount: number;
    qr_payload: string | null;
    rooms?: { room_number: string; room_type: string } | null;
  };
  const b = data as unknown as B;

  const payload =
    b.qr_payload ??
    signQrPayload({
      ref: b.reference,
      guest: b.guest_name ?? "Guest",
      room: b.rooms ? `${b.rooms.room_type} · ${b.rooms.room_number}` : "",
      checkIn: b.check_in,
      checkOut: b.check_out,
    });
  const qr = await qrDataUrl(payload);

  const paid = ["Confirmed", "Checked-In", "Checked-Out"].includes(b.status);
  const reserved = b.status === "Reserved";
  const momoDue = b.payment_mode === "momo_direct" && !paid;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-sidebar">
        <div className="container-page max-w-3xl py-12">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft md:p-10">
            <div className="flex flex-col items-center text-center">
              {paid || reserved ? (
                <CheckCircle2 className="size-14 text-emerald-500" />
              ) : (
                <Clock className="size-14 text-amber-500" />
              )}
              <h1 className="mt-4 font-heading text-3xl font-semibold">
                {paid
                  ? "Booking Confirmed"
                  : momoDue
                    ? "Room Held — One Step Left"
                    : reserved
                      ? "Room Reserved"
                      : "Awaiting Payment Confirmation"}
              </h1>
              <p className="mt-2 max-w-md text-muted-foreground">
                {paid
                  ? "Thank you — your payment was received. We can't wait to host you."
                  : momoDue
                    ? "Your room is held. Send the payment below and we'll confirm it shortly."
                    : reserved
                      ? "Your room is held. Please pay on arrival within the hold window."
                      : "We're confirming your payment. This page will reflect the final status shortly."}
              </p>
              <div className="mt-4">
                <StatusBadge status={b.status} />
              </div>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <dl className="space-y-3 text-sm">
                <Row label="Reference" value={b.reference} mono />
                <Row label="Guest" value={b.guest_name ?? "—"} />
                <Row
                  label="Room"
                  value={
                    b.rooms ? `${b.rooms.room_type} · Room ${b.rooms.room_number}` : "—"
                  }
                />
                <Row
                  label="Stay"
                  value={`${formatDate(b.check_in)} → ${formatDate(b.check_out)}`}
                />
                <Row label="Total" value={formatCurrency(b.total_amount)} />
                <Row
                  label="Payment"
                  value={
                    b.payment_mode === "pay_now"
                      ? "Paid online"
                      : b.payment_mode === "momo_direct"
                        ? "MTN MoMo (direct)"
                        : "Pay at hotel"
                  }
                />
              </dl>

              <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
                <Image src={qr} alt="Booking QR code" width={160} height={160} />
                <p className="text-xs text-muted-foreground">Show at reception</p>
              </div>
            </div>

            {momoDue && (
              <MomoPaymentPanel
                amount={formatCurrency(b.total_amount)}
                reference={b.reference}
              />
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href="/account/bookings">View my bookings</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={`/api/bookings/${b.reference}/receipt`} target="_blank" rel="noreferrer">
                  <Download className="size-4" /> Download receipt
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border/60 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono font-medium" : "font-medium"}>{value}</dd>
    </div>
  );
}
