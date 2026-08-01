import { describe, it, expect } from "vitest";
import { resolveImageUrl, PLACEHOLDER_ROOM } from "./images";

describe("resolveImageUrl", () => {
  it("returns the placeholder for empty input", () => {
    expect(resolveImageUrl(null)).toBe(PLACEHOLDER_ROOM);
    expect(resolveImageUrl(undefined)).toBe(PLACEHOLDER_ROOM);
    expect(resolveImageUrl("")).toBe(PLACEHOLDER_ROOM);
  });
  it("passes through absolute URLs", () => {
    const url = "https://images.unsplash.com/photo-123?w=1200";
    expect(resolveImageUrl(url)).toBe(url);
  });
  it("builds a public storage URL for keys", () => {
    const out = resolveImageUrl("room-1/abc.jpg");
    expect(out).toContain("/storage/v1/object/public/room-images/room-1/abc.jpg");
  });
  it("respects a custom bucket", () => {
    const out = resolveImageUrl("u1/avatar.png", "avatars");
    expect(out).toContain("/storage/v1/object/public/avatars/u1/avatar.png");
  });
});
