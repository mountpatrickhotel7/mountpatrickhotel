import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HOTEL } from "@/lib/constants";

export const metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "What are the check-in and check-out times?",
    a: `Check-in is from ${HOTEL.checkInTime} and check-out is by ${HOTEL.checkOutTime}. Early check-in and late check-out can be arranged on request, subject to availability and a possible fee.`,
  },
  {
    q: "How do I pay for my booking?",
    a: "You can pay online securely via Paystack (card, mobile money, or bank) at the time of booking, or choose 'Pay at Hotel' to settle on arrival. Reservations held for pay-at-hotel expire if not honoured within the hold window.",
  },
  {
    q: "Can I cancel or modify my reservation?",
    a: "Yes. You can cancel from your account under 'My Bookings'. Refund eligibility depends on the cancellation policy applied to your booking. Contact reception to modify dates or extend your stay.",
  },
  {
    q: "Do you offer airport or city transfers?",
    a: "Our concierge can arrange private transfers on request. Please reach out at least 24 hours before arrival so we can confirm your pickup.",
  },
  {
    q: "Is Wi-Fi available?",
    a: "Complimentary high-speed Wi-Fi is available throughout the hotel and in every room.",
  },
  {
    q: "What identification do I need at check-in?",
    a: "Please bring a valid Ghana Card, passport, or driver's license. We record this securely at check-in for your safety and ours.",
  },
  {
    q: "Are children welcome?",
    a: "Absolutely. Families are warmly welcomed. Let us know your party size and we'll recommend the most comfortable room or suite.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Good to Know"
        title="Frequently Asked Questions"
        description="Everything you need to plan a seamless stay. Can't find an answer? We're a message away."
      />
      <section className="container-page max-w-3xl py-16">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-heading text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-2xl border border-border bg-sidebar p-8 text-center">
          <h3 className="font-heading text-xl font-semibold">Still have questions?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team is happy to help you plan the perfect stay.
          </p>
          <Button asChild className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
