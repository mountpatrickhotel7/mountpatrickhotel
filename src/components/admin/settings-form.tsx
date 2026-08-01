"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettings } from "@/app/admin/settings/actions";
import type { HotelSettings } from "@/lib/supabase/types";

export function SettingsForm({ settings }: { settings: HotelSettings }) {
  const router = useRouter();
  const [policy, setPolicy] = React.useState(settings.cancellation_policy ?? "flexible");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("cancellation_policy", policy);
    const res = await updateSettings(fd);
    setPending(false);
    if (res.ok) {
      toast.success("Settings saved");
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hotel name" name="name" defaultValue={settings.name} />
        <Field label="Email" name="email" type="email" defaultValue={settings.email ?? ""} />
        <Field label="Phone" name="phone" defaultValue={settings.phone ?? ""} />
        <Field label="Tax rate (%)" name="tax_rate" type="number" step="0.01" defaultValue={String(settings.tax_rate)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" rows={2} defaultValue={settings.address ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Check-in time" name="check_in_time" type="time" defaultValue={settings.check_in_time} />
        <Field label="Check-out time" name="check_out_time" type="time" defaultValue={settings.check_out_time} />
        <Field label="Reservation hold (hours)" name="reservation_hold_hours" type="number" defaultValue={String(settings.reservation_hold_hours)} />
        <Field label="No-show fee (GHS)" name="no_show_fee" type="number" step="0.01" defaultValue={String(settings.no_show_fee)} />
      </div>

      <div className="space-y-1.5">
        <Label>Cancellation policy</Label>
        <Select value={policy} onValueChange={setPolicy}>
          <SelectTrigger className="sm:w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flexible">Flexible — full refund</SelectItem>
            <SelectItem value="moderate">Moderate — partial refund</SelectItem>
            <SelectItem value="strict">Strict — no refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending} className="bg-gold text-gold-foreground hover:bg-gold/90">
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Save settings"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} step={step} defaultValue={defaultValue} />
    </div>
  );
}
