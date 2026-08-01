"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, Smartphone } from "lucide-react";
import { HOTEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Payment instructions for a guest who chose to pay the hotel's MoMo merchant
 * directly. Shown while the booking sits at "Awaiting Payment" — reception
 * marks it paid once the transfer lands.
 */
export function MomoPaymentPanel({
  amount,
  reference,
}: {
  amount: string;
  reference: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
      <div className="flex items-center gap-2">
        <Smartphone className="size-5 text-amber-600 dark:text-amber-400" />
        <h2 className="font-heading font-semibold">Complete your MoMo payment</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Send <strong className="text-foreground">{amount}</strong> to our MTN MoMo
        merchant, then quote your reference. Your room is held until we confirm it.
      </p>

      <dl className="mt-4 space-y-2">
        <CopyRow label="MoMo number" value={HOTEL.momo.number} />
        <CopyRow label="Your reference" value={reference} mono />
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-muted-foreground">Merchant</dt>
          <dd className="font-medium">
            {HOTEL.momo.merchantName} · ID {HOTEL.momo.merchantId}
          </dd>
        </div>
      </dl>

      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Dial *170# or open the MyMTN app and choose Pay Merchant.</li>
        <li>
          Enter merchant ID{" "}
          <strong className="text-foreground">{HOTEL.momo.merchantId}</strong> and
          the amount above.
        </li>
        <li>
          Put <strong className="text-foreground">{reference}</strong> as the
          reference so we can match your payment.
        </li>
      </ol>

      <p className="mt-4 text-xs text-muted-foreground">
        Already sent it? No need to do anything — reception confirms MoMo payments
        by hand, and you&apos;ll get an SMS once it&apos;s done. Call {HOTEL.phone}{" "}
        if it&apos;s urgent.
      </p>
    </div>
  );
}

function CopyRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked on insecure origins and some in-app browsers —
      // the value is on screen anyway, so just say so rather than failing mute.
      toast.error("Couldn't copy — please note it down manually.");
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className={cn("font-medium", mono && "font-mono")}>{value}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </dd>
    </div>
  );
}
