import "server-only";
import crypto from "node:crypto";
import { type BookingQrPayload } from "@/lib/qr";

/**
 * QR signing. The booking QR carries the reference plus an HMAC signature so
 * reception can verify the code was issued by us — a forged QR (crafted around a
 * guessed reference) won't have a valid signature and is rejected before any
 * database lookup. Note: this is signed, not encrypted — the reference is not a
 * secret (it's printed on receipts). The real anti-impersonation control remains
 * the DB lookup + ID verification + single-use status at check-in.
 */
function secret(): string {
  const value = process.env.QR_SECRET?.trim();
  if (
    !value ||
    value.length < 32 ||
    /^(change-me|replace-me|your-|insecure)/i.test(value)
  ) {
    throw new Error("QR_SECRET must be a dedicated random secret of at least 32 characters");
  }
  return value;
}

function sign(ref: string): string {
  return crypto.createHmac("sha256", secret()).update(ref).digest("base64url").slice(0, 24);
}

/** Build a signed QR payload string for a booking. */
export function signQrPayload(data: BookingQrPayload): string {
  return JSON.stringify({ ...data, sig: sign(data.ref) });
}

export interface VerifiedQr {
  ref: string | null;
  /** signature valid (scanned, signed QR) */
  valid: boolean;
  /** plain reference typed by staff (no signature to check) */
  manual: boolean;
}

/**
 * Verify a scanned QR payload or a manually-typed reference.
 * - JSON payload with a valid signature → { valid: true }
 * - JSON payload with a missing/bad signature → { valid: false } (likely forged)
 * - Plain text (staff typed the reference) → { manual: true, valid: true }
 */
export function verifyQrPayload(raw: string): VerifiedQr {
  const trimmed = raw.trim();
  let obj: unknown;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    // Not JSON → a reference typed in by trusted staff.
    return { ref: trimmed || null, valid: Boolean(trimmed), manual: true };
  }

  if (!obj || typeof obj !== "object" || typeof (obj as { ref?: unknown }).ref !== "string") {
    return { ref: null, valid: false, manual: false };
  }
  const ref = (obj as { ref: string }).ref;
  const sig = (obj as { sig?: unknown }).sig;
  const expected = sign(ref);

  let valid = false;
  if (typeof sig === "string" && sig.length === expected.length) {
    valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  }
  return { ref, valid, manual: false };
}
