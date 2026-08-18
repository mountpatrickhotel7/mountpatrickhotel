import { PageHeader } from "@/components/page-header";
import { HOTEL } from "@/lib/constants";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How Mount Patrick Hotel collects, uses, and protects your information."
      />
      <section className="container-page max-w-3xl py-16 text-sm leading-7 text-muted-foreground">
        <p>
          Last updated: {new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">1. Who we are</h2>
        <p className="mt-2">
          {HOTEL.name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates this booking website and
          the physical hotel at {HOTEL.address}. This policy explains what information we collect
          when you book a room, sign in, or otherwise use this site, and how we use it.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">
          2. Information we collect
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li><strong className="text-foreground">Account information:</strong> your phone number for one-time-code sign-in, or your name, email address, and profile photo if you sign in with Google.</li>
          <li><strong className="text-foreground">Booking details:</strong> stay dates, room selection, number of guests, and any special requests you provide.</li>
          <li><strong className="text-foreground">Identification at check-in:</strong> we record the type and number of the ID you present at the front desk, as required for guest registration.</li>
          <li><strong className="text-foreground">Payment information:</strong> online payment details are processed by Paystack; we do not see or store your full card number. For direct MTN MoMo payments, we record the transaction reference you provide.</li>
          <li><strong className="text-foreground">Communications:</strong> messages you send through the contact form and delivery status for confirmations we send.</li>
        </ul>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">3. How we use your information</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>To create and manage your booking and check you in and out.</li>
          <li>To send booking confirmations, receipts, and OTP codes.</li>
          <li>To process payments and reconcile them against your reservation.</li>
          <li>To respond to enquiries sent through the contact page.</li>
          <li>To meet legal and regulatory guest-registration obligations.</li>
        </ul>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">4. Sharing your information</h2>
        <p className="mt-2">
          We share information only with providers needed to run the hotel and website, including
          Supabase, Paystack, and Arkesel. We do not sell personal information.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">5. Data retention</h2>
        <p className="mt-2">
          We retain booking and guest-registration records as needed for accounting, tax, and
          hospitality record-keeping requirements, after which they are deleted or anonymized.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">6. Your rights</h2>
        <p className="mt-2">
          You can review or update your account details from <span className="text-foreground">My account</span>,
          and request correction or deletion by contacting us at{" "}
          <a href={`mailto:${HOTEL.email}`} className="text-foreground underline underline-offset-2">{HOTEL.email}</a>.
          Some information may need to be retained where we have a legal obligation to keep it.
        </p>

        <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">7. Contact us</h2>
        <p className="mt-2">
          Questions about this policy can be sent to{" "}
          <a href={`mailto:${HOTEL.email}`} className="text-foreground underline underline-offset-2">{HOTEL.email}</a>{" "}
          or {HOTEL.phone}.
        </p>
      </section>
    </>
  );
}
