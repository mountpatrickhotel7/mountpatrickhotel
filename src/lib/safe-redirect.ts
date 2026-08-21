const INTERNAL_ORIGIN = "https://mountpatrickhotel.invalid";
const UNSAFE_CHARACTERS = /[\\\u0000-\u001f\u007f]/;

/** Accept only same-site absolute paths for post-authentication navigation. */
export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/account"
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    decoded.startsWith("//") ||
    UNSAFE_CHARACTERS.test(value) ||
    UNSAFE_CHARACTERS.test(decoded)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
