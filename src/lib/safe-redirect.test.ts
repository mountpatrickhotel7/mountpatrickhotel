import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./safe-redirect";

describe("safeInternalPath", () => {
  it("keeps an internal path, query, and hash", () => {
    expect(safeInternalPath("/account/bookings?tab=upcoming#next")).toBe(
      "/account/bookings?tab=upcoming#next"
    );
  });

  it.each([
    "https://example.com",
    "//example.com",
    "/%2f%2fexample.com",
    "/\\example.com",
    "javascript:alert(1)",
    "/%5cexample.com",
    "/account%0d%0aLocation:%20https://example.com",
  ])("rejects unsafe redirect value %s", (value) => {
    expect(safeInternalPath(value)).toBe("/account");
  });

  it("uses a caller-provided fallback", () => {
    expect(safeInternalPath(null, "/dashboard")).toBe("/dashboard");
  });
});
