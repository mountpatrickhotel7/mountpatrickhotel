import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

function request() {
  return new Request("https://mountpatrickhotel.invalid/api/auth/sms-hook", {
    method: "POST",
    body: JSON.stringify({ user: { phone: "+233200000000" }, sms: { otp: "123456" } }),
  });
}

afterEach(() => {
  delete process.env.SEND_SMS_HOOK_SECRET;
});

describe("Supabase SMS hook", () => {
  it("fails closed when its signing secret is missing", async () => {
    delete process.env.SEND_SMS_HOOK_SECRET;
    expect((await POST(request())).status).toBe(503);
  });

  it("rejects a placeholder signing secret", async () => {
    process.env.SEND_SMS_HOOK_SECRET =
      "v1,whsec_replace-with-the-supabase-hook-secret";
    expect((await POST(request())).status).toBe(503);
  });
});
