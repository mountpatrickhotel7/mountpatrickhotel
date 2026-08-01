import "server-only";
import crypto from "crypto";

const BASE = "https://api.paystack.co";

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export interface InitParams {
  email: string;
  amount: number; // major units (GHS)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export async function initializeTransaction(
  params: InitParams
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // pesewas
      currency: "GHS",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? "Paystack initialize failed");
  }
  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{
  success: boolean;
  amount: number; // major units
  reference: string;
  raw: unknown;
}> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  });
  const json = await res.json();
  const ok = res.ok && json.status && json.data?.status === "success";
  return {
    success: !!ok,
    amount: json.data?.amount ? json.data.amount / 100 : 0,
    reference: json.data?.reference ?? reference,
    raw: json.data,
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha512", secret())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
