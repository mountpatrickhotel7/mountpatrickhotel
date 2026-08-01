import "server-only";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends transactional email. If RESEND_API_KEY is configured it sends via Resend;
 * otherwise it logs to the console (mock) so flows work in development.
 */
export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; mocked: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Mount Patrick Hotel <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("📧 [email:mock]", { to: msg.to, subject: msg.subject });
    return { ok: true, mocked: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    if (!res.ok) {
      console.error("email:resend failed", await res.text());
      return { ok: false, mocked: false };
    }
    return { ok: true, mocked: false };
  } catch (err) {
    console.error("email:resend error", err);
    return { ok: false, mocked: false };
  }
}
