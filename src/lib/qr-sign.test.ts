import { describe, it, expect, beforeEach } from "vitest";
import { signQrPayload, verifyQrPayload } from "./qr-sign";

beforeEach(() => {
  process.env.QR_SECRET = "test-only-qr-secret-that-is-long-enough";
});

const data = {
  ref: "MP-7K2P9Q",
  guest: "Ama Owusu",
  room: "Suite · 401",
  checkIn: "2026-07-10",
  checkOut: "2026-07-12",
};

describe("signQrPayload / verifyQrPayload", () => {
  it("verifies a genuine signed payload", () => {
    const payload = signQrPayload(data);
    const v = verifyQrPayload(payload);
    expect(v.ref).toBe("MP-7K2P9Q");
    expect(v.valid).toBe(true);
    expect(v.manual).toBe(false);
  });

  it("rejects a forged payload (no signature)", () => {
    const forged = JSON.stringify({ ref: "MP-FORGED", guest: "Imposter" });
    const v = verifyQrPayload(forged);
    expect(v.ref).toBe("MP-FORGED");
    expect(v.valid).toBe(false);
    expect(v.manual).toBe(false);
  });

  it("rejects a tampered reference (signature no longer matches)", () => {
    const payload = JSON.parse(signQrPayload(data));
    payload.ref = "MP-OTHER"; // keep old signature
    const v = verifyQrPayload(JSON.stringify(payload));
    expect(v.valid).toBe(false);
  });

  it("rejects a bad signature of wrong length", () => {
    const v = verifyQrPayload(JSON.stringify({ ref: "MP-7K2P9Q", sig: "short" }));
    expect(v.valid).toBe(false);
  });

  it("treats a plain typed reference as manual (trusted staff entry)", () => {
    const v = verifyQrPayload("MP-7K2P9Q");
    expect(v.ref).toBe("MP-7K2P9Q");
    expect(v.manual).toBe(true);
    expect(v.valid).toBe(true);
  });

  it("refuses to sign when QR_SECRET is missing", () => {
    delete process.env.QR_SECRET;
    expect(() => signQrPayload(data)).toThrow(/QR_SECRET/);
  });

  it("refuses to reuse the Supabase service role key", () => {
    delete process.env.QR_SECRET;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-that-would-previously-have-been-used";
    expect(() => signQrPayload(data)).toThrow(/QR_SECRET/);
  });
});
