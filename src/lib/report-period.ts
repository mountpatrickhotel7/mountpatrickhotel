import { toISODate } from "@/lib/format";

export type ReportType = "daily" | "weekly" | "monthly";

export function periodRange(
  type: ReportType,
  dateStr: string
): { start: string; end: string; label: string } {
  const date = new Date(dateStr + "T00:00:00");
  if (type === "daily") {
    const s = toISODate(date);
    return { start: s, end: s, label: `Daily report · ${s}` };
  }
  if (type === "weekly") {
    const end = new Date(date.getTime() + 6 * 86400_000);
    return {
      start: toISODate(date),
      end: toISODate(end),
      label: `Weekly report · ${toISODate(date)} → ${toISODate(end)}`,
    };
  }
  // monthly
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: toISODate(first),
    end: toISODate(last),
    label: `Monthly report · ${first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`,
  };
}
