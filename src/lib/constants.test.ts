import { describe, it, expect } from "vitest";
import {
  ROOM_STATUSES,
  BOOKING_STATUSES,
  STATUS_TINTS,
  PAYMENT_METHODS,
  ROLES,
} from "./constants";

describe("status tints", () => {
  it("has a tint for every room status", () => {
    for (const s of ROOM_STATUSES) expect(STATUS_TINTS[s]).toBeTruthy();
  });
  it("has a tint for every booking status", () => {
    for (const s of BOOKING_STATUSES) expect(STATUS_TINTS[s]).toBeTruthy();
  });
});

describe("enums", () => {
  it("payment methods include online and offline channels", () => {
    expect(PAYMENT_METHODS).toContain("paystack");
    expect(PAYMENT_METHODS).toContain("cash");
    expect(PAYMENT_METHODS).toContain("momo");
  });
  it("roles cover the access model", () => {
    expect([...ROLES]).toEqual(["guest", "receptionist", "housekeeper", "admin", "owner"]);
  });
});
