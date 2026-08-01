import { describe, it, expect, beforeAll } from "vitest";
import { signQrPayload, verifyQrPayload } from "./qr-sign";

beforeAll(() => {
  process.env.QR_SECRET = "test-secret-key";
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
});
