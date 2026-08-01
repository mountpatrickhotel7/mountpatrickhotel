import type { UserRole } from "@/lib/supabase/types";

export type IconName =
  | "dashboard"
  | "bed"
  | "calendar"
  | "calendarGrid"
  | "users"
  | "scan"
  | "walkin"
  | "settings"
  | "chart"
  | "report"
  | "concierge";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const RECEPTION_NAV: NavItem[] = [
  { href: "/reception", label: "Today", icon: "dashboard" },
  { href: "/reception/checkin", label: "Check-in / QR", icon: "scan" },
  { href: "/reception/walkin", label: "Walk-in", icon: "walkin" },
  { href: "/reception/bookings", label: "Reservations", icon: "calendar" },
  { href: "/reception/calendar", label: "Calendar", icon: "calendarGrid" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/rooms", label: "Rooms", icon: "bed" },
  { href: "/admin/bookings", label: "Reservations", icon: "calendar" },
  { href: "/admin/calendar", label: "Calendar", icon: "calendarGrid" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export const OWNER_NAV: NavItem[] = [
  { href: "/owner", label: "Analytics", icon: "chart" },
  { href: "/owner/reports", label: "Reports", icon: "report" },
];

export function navForArea(area: "reception" | "admin" | "owner"): NavItem[] {
  if (area === "reception") return RECEPTION_NAV;
  if (area === "admin") return ADMIN_NAV;
  return OWNER_NAV;
}

/** Cross-links shown to admins/owners to hop between areas. */
export function areaSwitcher(role: UserRole) {
  const links: { href: string; label: string }[] = [];
  if (role === "receptionist" || role === "admin" || role === "owner")
    links.push({ href: "/reception", label: "Reception" });
  if (role === "admin" || role === "owner")
    links.push({ href: "/admin", label: "Admin" });
  if (role === "admin" || role === "owner")
    links.push({ href: "/owner", label: "Owner" });
  return links;
}
