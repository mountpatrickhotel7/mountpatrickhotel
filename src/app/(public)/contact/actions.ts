"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/services/email";
import { escapeHtml } from "@/lib/html";
import { HOTEL } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please add a little more detail"),
});

export type ContactState = { ok: boolean; error?: string };

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const { name, email, phone, message } = parsed.data;
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: phone ? escapeHtml(phone) : "",
    message: escapeHtml(message),
  };

  await sendEmail({
    to: HOTEL.email,
    subject: `New enquiry from ${name}`,
    html: `<p><strong>${safe.name}</strong> (${safe.email}${safe.phone ? `, ${safe.phone}` : ""}) wrote:</p><p>${safe.message}</p>`,
    text: `${name} (${email}${phone ? `, ${phone}` : ""}): ${message}`,
  });

  return { ok: true };
}
