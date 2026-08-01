import { describe, it, expect, afterEach, vi } from "vitest";
import { sendSms } from "./sms";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ARKESEL_API_KEY;
});

describe("sendSms", () => {
  it("mocks (no network) without an API key", async () => {
    delete process.env.ARKESEL_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);
    const res = await sendSms("0241234567", "hello");
    expect(res).toEqual({ ok: true, mocked: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls Arkesel with a normalized recipient", async () => {
    process.env.ARKESEL_API_KEY = "ark_test";
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      text: async () => "",
    }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const res = await sendSms("0241234567", "hello");
    expect(res.mocked).toBe(false);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.recipients).toEqual(["233241234567"]);
    expect(body.message).toBe("hello");
  });
});
