/**
 * Two date ranges overlap when each starts before the other ends.
 * Ranges are half-open [start, end) — a checkout day can be another guest's check-in.
 * This is the same rule enforced in SQL (`search_available_rooms`) and by the
 * `bookings_no_overlap` exclusion constraint.
 */
export function datesOverlap(
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date
): boolean {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && ae > bs;
}
