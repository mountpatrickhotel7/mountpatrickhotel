"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard, Building2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createBooking } from "@/app/book/actions";

type Mode = "pay_now" | "momo_direct" | "pay_at_hotel";

export function BookForm({
  roomId,
  checkIn,
  checkOut,
  guests,
  defaultName,
  defaultPhone,
  defaultEmail,
}: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("pay_now");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("paymentMode", mode);
    const result = await createBooking(fd);
    if (!result.ok) {
      setPending(false);
      toast.error(result.error);
      return;
    }
    if (result.external) {
      window.location.href = result.redirect;
    } else {
      router.push(result.redirect);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      <input type="hidden" name="guests" value={guests} />

      <div>
        <h2 className="font-heading text-lg font-semibold">Guest details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="guestName">Full name</Label>
            <Input id="guestName" name="guestName" defaultValue={defaultName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guestPhone">Phone</Label>
            <Input id="guestPhone" name="guestPhone" defaultValue={defaultPhone} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="guestEmail">Email (for your receipt)</Label>
            <Input
              id="guestEmail"
              name="guestEmail"
              type="email"
              defaultValue={defaultEmail}
              placeholder="you@example.com"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold">Payment</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PaymentOption
            active={mode === "pay_now"}
            onClick={() => setMode("pay_now")}
            icon={CreditCard}
            title="Pay now"
            body="Card or MoMo via Paystack. Instantly confirmed."
          />
          <PaymentOption
            active={mode === "momo_direct"}
            onClick={() => setMode("momo_direct")}
            icon={Smartphone}
            title="Pay by MoMo"
            body="Send straight to our MTN MoMo merchant. We confirm by hand."
          />
          <PaymentOption
            active={mode === "pay_at_hotel"}
            onClick={() => setMode("pay_at_hotel")}
            icon={Building2}
            title="Pay at hotel"
            body="Reserve now, settle on arrival. Held until your hold window."
          />
        </div>
        {mode === "momo_direct" && (
          <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            We&apos;ll show you our MoMo number and your booking reference on the
            next screen. Your room is held while you transfer.
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : mode === "pay_now" ? (
          "Continue to payment"
        ) : mode === "momo_direct" ? (
          "Reserve & show MoMo details"
        ) : (
          "Reserve room"
        )}
      </Button>
    </form>
  );
}

function PaymentOption({
  active,
  onClick,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-gold bg-gold/10 ring-1 ring-gold"
          : "border-border hover:border-gold/50"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-gold" />
        <span className="font-heading font-semibold">{title}</span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </button>
  );
}
