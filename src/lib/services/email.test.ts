import { describe, it, expect, afterEach, vi } from "vitest";
import { sendEmail } from "./email";

const msg = { to: "g@example.com", subject: "Hi", html: "<p>Hi</p>" };

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.RESEND_API_KEY;
});

describe("sendEmail", () => {
  it("mocks (no network) when no API key is set", async () => {
    delete process.env.RESEND_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);
    const res = await sendEmail(msg);
    expect(res).toEqual({ ok: true, mocked: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls Resend when an API key is set", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => "" }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const res = await sendEmail(msg);
    expect(res.mocked).toBe(false);
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns ok:false when Resend fails", async () => {
    process.env.RESEND_API_KEY = "re_test";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, text: async () => "bad" })) as unknown as typeof fetch
    );
    const res = await sendEmail(msg);
    expect(res.ok).toBe(false);
  });
});
