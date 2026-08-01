import { describe, it, expect } from "vitest";
import { periodRange } from "./report-period";

describe("periodRange", () => {
  it("daily covers a single day", () => {
    const r = periodRange("daily", "2026-06-21");
    expect(r.start).toBe("2026-06-21");
    expect(r.end).toBe("2026-06-21");
    expect(r.label).toContain("Daily");
  });

  it("weekly spans 7 days inclusive", () => {
    const r = periodRange("weekly", "2026-06-21");
    expect(r.start).toBe("2026-06-21");
    expect(r.end).toBe("2026-06-27");
  });

  it("monthly spans the whole month", () => {
    const r = periodRange("monthly", "2026-06-15");
    expect(r.start).toBe("2026-06-01");
    expect(r.end).toBe("2026-06-30");
    expect(r.label).toContain("June");
  });

  it("monthly handles February correctly", () => {
    const r = periodRange("monthly", "2026-02-10");
    expect(r.start).toBe("2026-02-01");
    expect(r.end).toBe("2026-02-28");
  });
});
