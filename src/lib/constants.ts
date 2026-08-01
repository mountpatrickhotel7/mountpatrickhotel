export const HOTEL = {
  name: "Mount Patrick Hotel",
  shortName: "Mount Patrick",
  tagline: "Quiet Luxury in the Heart of Kumasi",
  description:
    "A sanctuary of calm and refined comfort. Elegant rooms, attentive service, and warm Ashanti hospitality.",
  // Interim contact details until the custom domain (and its mailbox) is bought.
  email: "mtpatrickhotel@gmail.com",
  phone: "+233 53 636 1082",
  address: "Atonsu Prabon, Kumasi, Ashanti Region, Ghana",
  // Used for the static map embed (no API key required)
  mapQuery: "Atonsu, Kumasi, Ghana",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  currency: "GHS",
  currencySymbol: "GHS",
  // MTN MoMo merchant account, shown to guests who pay directly instead of
  // going through Paystack. Displayed publicly by design — it is the same
  // detail printed on the merchant card at reception.
  momo: {
    number: "0559637516",
    merchantName: "MOUNT PATRICK HOTEL",
    merchantId: "489243",
  },
  social: {
    instagram: "#",
    facebook: "#",
    twitter: "#",
  },
} as const;

// Tiers the hotel currently offers. The DB enum still allows Suite / Presidential
// Suite, so more tiers can be re-added here later without a migration.
export const ROOM_TYPES = ["Standard", "Deluxe", "Executive"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_STATUSES = [
  "Available",
  "Reserved",
  "Occupied",
  "Cleaning",
  "Maintenance",
  "Out of Service",
] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const BOOKING_STATUSES = [
  "Pending",
  "Awaiting Payment",
  "Reserved",
  "Confirmed",
  "Checked-In",
  "Checked-Out",
  "Cancelled",
  "No Show",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_MODES = ["pay_now", "momo_direct", "pay_at_hotel"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const PAYMENT_METHODS = [
  "paystack",
  "cash",
  "momo",
  "card",
  "bank",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ROLES = [
  "guest",
  "receptionist",
  "housekeeper",
  "admin",
  "owner",
] as const;
export type Role = (typeof ROLES)[number];

export const ID_TYPES = [
  "Ghana Card",
  "Passport",
  "Driver's License",
] as const;

export const COMMON_AMENITIES = [
  "Free WiFi",
  "Air Conditioning",
  "Flat-screen TV",
  "Mini Bar",
  "Room Service",
  "Private Bathroom",
  "Balcony",
  "Work Desk",
  "Safe",
  "Coffee Maker",
  "Hair Dryer",
  "City View",
] as const;

export const STATUS_TINTS: Record<string, string> = {
  Available: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Reserved: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Occupied: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  Cleaning: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Maintenance: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "Out of Service": "bg-gray-500/15 text-gray-700 dark:text-gray-300",
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Awaiting Payment": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "Checked-In": "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "Checked-Out": "bg-gray-500/15 text-gray-700 dark:text-gray-300",
  Cancelled: "bg-red-500/15 text-red-700 dark:text-red-300",
  "No Show": "bg-red-500/15 text-red-700 dark:text-red-300",
};

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];
