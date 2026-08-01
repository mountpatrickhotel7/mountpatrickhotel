/** Arkesel expects msisdn like 233XXXXXXXXX (no plus). Safe for client + server. */
export function normalizeGhanaMsisdn(phone: string): string {
  let p = phone.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "233" + p.slice(1);
  if (!p.startsWith("233") && p.length === 9) p = "233" + p;
  return p;
}
