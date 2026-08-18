"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Phone, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { GoogleIcon } from "@/components/google-icon";
import { normalizeGhanaMsisdn } from "@/lib/phone";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const supabase = createClient();

  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const e164 = (p: string) => "+" + normalizeGhanaMsisdn(p);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164(phone) });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verification code sent");
    setStep("otp");
  }

  async function verifyOtp(token: string = code) {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(phone),
      token,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to Mount Patrick");
    router.push(next);
    router.refresh();
  }

  function handleCodeChange(value: string) {
    setCode(value);
    // Auto-submit once all six digits are entered.
    if (value.length === 6 && step === "otp" && !loading) {
      void verifyOtp(value);
    }
  }

  async function googleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          // Always let the guest choose an account instead of silently reusing
          // the Google account that is already active in their browser.
          prompt: "select_account",
        },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-float">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">
          {step === "phone" ? "Welcome back" : "Verify your number"}
        </CardTitle>
        <CardDescription>
          {step === "phone"
            ? "Sign in to manage your bookings and stay."
            : `We sent a 6-digit code to ${e164(phone)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <>
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="pl-9"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ghana numbers — we&apos;ll text you a one-time code.
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              onClick={googleSignIn}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon className="size-4" />
              )}
              Continue with Google
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <InputOTP maxLength={6} value={code} onChange={handleCodeChange}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button
              onClick={() => verifyOtp()}
              disabled={loading || code.length < 6}
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify & sign in"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Use a different number
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader2 className="size-6 animate-spin text-gold" />}>
      <LoginInner />
    </Suspense>
  );
}
