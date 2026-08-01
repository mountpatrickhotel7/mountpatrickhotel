import { describe, it, expect } from "vitest";
import { normalizeGhanaMsisdn } from "./phone";

describe("normalizeGhanaMsisdn", () => {
  it("converts local 0-prefixed numbers", () => {
    expect(normalizeGhanaMsisdn("024 123 4567")).toBe("233241234567");
  });
  it("strips a leading +", () => {
    expect(normalizeGhanaMsisdn("+233241234567")).toBe("233241234567");
  });
  it("prefixes a bare 9-digit number", () => {
    expect(normalizeGhanaMsisdn("241234567")).toBe("233241234567");
  });
  it("leaves an already-normalized number", () => {
    expect(normalizeGhanaMsisdn("233241234567")).toBe("233241234567");
  });
  it("ignores spaces and dashes", () => {
    expect(normalizeGhanaMsisdn("024-123-4567")).toBe("233241234567");
  });
});
