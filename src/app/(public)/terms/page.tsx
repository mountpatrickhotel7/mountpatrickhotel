import { PageHeader } from "@/components/page-header";
import { HOTEL } from "@/lib/constants";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="The terms that apply when you book a stay with Mount Patrick Hotel."
      />
      <section className="container-page max-w-3xl py-16 text-sm leading-7 text-muted-foreground">
        <p>
          Last updated: {new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">1. Acceptance of terms</h2>
        <p className="mt-2">By booking a room, creating an account, or using this website, you agree to these terms.</p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">2. Bookings</h2>
        <p className="mt-2">
          A booking is a request to reserve a room for the selected dates. Pay-at-hotel and direct
          MoMo bookings are held for a limited time and may be released if unconfirmed. Online
          bookings are confirmed once payment succeeds.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">3. Check-in and check-out</h2>
        <p className="mt-2">
          Standard check-in is from {HOTEL.checkInTime} and check-out is by {HOTEL.checkOutTime}. A
          valid Ghana Card, passport, or driver&apos;s license is required at check-in. Early check-in
          and late check-out are subject to availability and may attract a fee.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">4. Payments</h2>
        <p className="mt-2">
          Paystack processes online payments; we do not store full card details. Reception confirms
          direct MoMo payments manually. Rates are shown in Ghana Cedis and include applicable taxes
          unless stated otherwise.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">5. Cancellations</h2>
        <p className="mt-2">
          You may cancel eligible reservations from <span className="text-foreground">My bookings</span>.
          Refund eligibility depends on the cancellation policy applicable when you booked.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">6. Guest conduct</h2>
        <p className="mt-2">
          Guests must treat staff, other guests, and hotel property with respect. We may refuse
          service or end a stay for damage, illegal activity, or serious misconduct.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">7. Liability</h2>
        <p className="mt-2">
          {HOTEL.name} is not liable for loss or damage to personal belongings except where caused
          by our negligence. Nothing excludes liability that cannot be excluded under Ghanaian law.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">8. Changes to these terms</h2>
        <p className="mt-2">We may update these terms. The date above reflects the most recent change.</p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">9. Contact us</h2>
        <p className="mt-2">
          Questions can be sent to{" "}
          <a href={`mailto:${HOTEL.email}`} className="text-foreground underline underline-offset-2">{HOTEL.email}</a>{" "}
          or {HOTEL.phone}.
        </p>
      </section>
    </>
  );
}
