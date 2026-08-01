import { describe, it, expect } from "vitest";
import { buildQrPayload, qrDataUrl } from "./qr";

const payload = {
  ref: "MP-7K2P9Q",
  guest: "Ama Owusu",
  room: "Suite · 401",
  checkIn: "2026-07-10",
  checkOut: "2026-07-13",
};

describe("buildQrPayload", () => {
  it("round-trips through JSON", () => {
    const str = buildQrPayload(payload);
    expect(JSON.parse(str)).toEqual(payload);
  });
});

describe("qrDataUrl", () => {
  it("produces a PNG data URL", async () => {
    const url = await qrDataUrl(buildQrPayload(payload));
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    expect(url.length).toBeGreaterThan(100);
  });
});
