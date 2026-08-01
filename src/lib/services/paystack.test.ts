import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "node:crypto";
import {
  verifyWebhookSignature,
  initializeTransaction,
  verifyTransaction,
} from "./paystack";

const SECRET = "sk_test_dummy_secret";

beforeEach(() => {
  process.env.PAYSTACK_SECRET_KEY = SECRET;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ event: "charge.success", data: { reference: "MP-1" } });
  const validSig = crypto.createHmac("sha512", SECRET).update(body).digest("hex");

  it("accepts a correct signature", () => {
    expect(verifyWebhookSignature(body, validSig)).toBe(true);
  });
  it("rejects a tampered body", () => {
    expect(verifyWebhookSignature(body + "x", validSig)).toBe(false);
  });
  it("rejects a wrong signature", () => {
    expect(verifyWebhookSignature(body, "deadbeef")).toBe(false);
  });
  it("rejects a missing signature", () => {
    expect(verifyWebhookSignature(body, null)).toBe(false);
  });
});

describe("initializeTransaction", () => {
  it("sends amount in pesewas and GHS currency", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        status: true,
        data: { authorization_url: "https://paystack/pay/xyz", reference: "MP-1" },
      }),
    }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const res = await initializeTransaction({
      email: "g@example.com",
      amount: 1500,
      reference: "MP-1",
      callbackUrl: "https://site/cb",
    });

    expect(res.authorizationUrl).toContain("paystack");
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.amount).toBe(150000); // 1500 * 100
    expect(body.currency).toBe("GHS");
  });

  it("throws on a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ status: false, message: "boom" }),
      })) as unknown as typeof fetch
    );
    await expect(
      initializeTransaction({ email: "g@x.com", amount: 1, reference: "r", callbackUrl: "u" })
    ).rejects.toThrow("boom");
  });
});

describe("verifyTransaction", () => {
  it("reports success and converts amount back to major units", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ status: true, data: { status: "success", amount: 150000, reference: "MP-1" } }),
      })) as unknown as typeof fetch
    );
    const res = await verifyTransaction("MP-1");
    expect(res.success).toBe(true);
    expect(res.amount).toBe(1500);
  });

  it("reports failure for non-success status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ status: true, data: { status: "abandoned" } }),
      })) as unknown as typeof fetch
    );
    const res = await verifyTransaction("MP-2");
    expect(res.success).toBe(false);
  });
});
