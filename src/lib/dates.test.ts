import { describe, it, expect } from "vitest";
import { datesOverlap } from "./dates";

describe("datesOverlap", () => {
  it("detects a clear overlap", () => {
    expect(datesOverlap("2026-07-10", "2026-07-15", "2026-07-12", "2026-07-14")).toBe(true);
  });
  it("treats checkout day as free for next check-in (half-open)", () => {
    expect(datesOverlap("2026-07-10", "2026-07-12", "2026-07-12", "2026-07-14")).toBe(false);
  });
  it("returns false for fully separate ranges", () => {
    expect(datesOverlap("2026-07-10", "2026-07-12", "2026-07-20", "2026-07-22")).toBe(false);
  });
  it("detects partial overlap at the edges", () => {
    expect(datesOverlap("2026-07-10", "2026-07-13", "2026-07-12", "2026-07-20")).toBe(true);
  });
  it("detects an enclosed range", () => {
    expect(datesOverlap("2026-07-10", "2026-07-20", "2026-07-12", "2026-07-14")).toBe(true);
  });
});
