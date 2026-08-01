import "server-only";
import { normalizeGhanaMsisdn } from "@/lib/phone";

/**
 * Sends SMS via Arkesel. If ARKESEL_API_KEY is not set, logs a mock message so
 * booking and notification flows work in development.
 * Docs: https://developers.arkesel.com
 */
export async function sendSms(
  to: string,
  message: string
): Promise<{ ok: boolean; mocked: boolean }> {
  const apiKey = process.env.ARKESEL_API_KEY;
  const sender = process.env.ARKESEL_SENDER_ID ?? "MountPatrick";

  if (!apiKey) {
    console.log("📱 [sms:mock]", { to, message });
    return { ok: true, mocked: true };
  }

  const startedAt = Date.now();
  try {
    const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        message,
        recipients: [normalizeGhanaMsisdn(to)],
      }),
      // Supabase's auth hook gives us a short budget, and an unbounded fetch
      // here would hang the caller's OTP request rather than fail cleanly.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("sms:arkesel failed", await res.text());
      return { ok: false, mocked: false };
    }
    console.log(`sms:arkesel sent in ${Date.now() - startedAt}ms`);
    return { ok: true, mocked: false };
  } catch (err) {
    console.error(`sms:arkesel error after ${Date.now() - startedAt}ms`, err);
    return { ok: false, mocked: false };
  }
}
