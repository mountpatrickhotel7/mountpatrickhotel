import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { sendSms } from "@/lib/services/sms";

/**
 * Supabase "Send SMS Hook" endpoint. Configure in Auth → Hooks → Send SMS,
 * pointing at this URL. Supabase posts the user phone + generated OTP, signed
 * with the Standard Webhooks scheme; we verify the signature (so the endpoint
 * can't be abused to send SMS) then deliver the code via Arkesel.
 *
 * SEND_SMS_HOOK_SECRET is the secret shown in the Supabase hook config,
 * formatted "v1,whsec_<base64>".
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.SEND_SMS_HOOK_SECRET;

  if (secret) {
    try {
      const wh = new Webhook(secret.replace("v1,whsec_", ""));
      wh.verify(raw, {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? "",
      });
    } catch {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  let body: { user?: { phone?: string }; sms?: { otp?: string } };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const phone = body.user?.phone;
  const otp = body.sms?.otp;
  if (!phone || !otp) {
    return NextResponse.json({ error: "missing phone or otp" }, { status: 400 });
  }

  const result = await sendSms(
    phone,
    `Your Mount Patrick Hotel verification code is ${otp}. It expires in 10 minutes.`
  );

  if (!result.ok) {
    return NextResponse.json({ error: "sms failed" }, { status: 502 });
  }
  return NextResponse.json({});
}
