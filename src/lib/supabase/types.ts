// Hand-maintained types mirroring supabase/migrations.
// Regenerate with `npx supabase gen types typescript` once the project is linked.

export type UserRole = "guest" | "receptionist" | "housekeeper" | "admin" | "owner";
export type RoomTypeEnum = "Standard" | "Deluxe" | "Executive" | "Suite" | "Presidential Suite";
export type RoomStatusEnum =
  | "Available" | "Reserved" | "Occupied" | "Cleaning" | "Maintenance" | "Out of Service";
export type BookingStatusEnum =
  | "Pending" | "Awaiting Payment" | "Reserved" | "Confirmed"
  | "Checked-In" | "Checked-Out" | "Cancelled" | "No Show";
export type PaymentModeEnum = "pay_now" | "momo_direct" | "pay_at_hotel";
export type PaymentMethodEnum = "paystack" | "cash" | "momo" | "card" | "bank";
export type PaymentStatusEnum = "pending" | "success" | "failed";
export type IdTypeEnum = "Ghana Card" | "Passport" | "Driver's License";
export type BookingSourceEnum = "online" | "walk_in";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  room_type: RoomTypeEnum;
  capacity: number;
  description: string | null;
  amenities: string[];
  price_per_night: number;
  status: RoomStatusEnum;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomImage {
  id: string;
  room_id: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  reference: string;
  guest_id: string | null;
  room_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_amount: number;
  currency: string;
  payment_mode: PaymentModeEnum;
  status: BookingStatusEnum;
  source: BookingSourceEnum;
  hold_expires_at: string | null;
  qr_payload: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: string;
  booking_id: string;
  method: PaymentMethodEnum;
  amount: number;
  status: PaymentStatusEnum;
  provider_reference: string | null;
  paid_at: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface GuestIdentification {
  id: string;
  booking_id: string | null;
  full_name: string;
  phone: string | null;
  id_type: IdTypeEnum;
  id_number: string;
  id_image_path: string | null;
  created_by: string | null;
  created_at: string;
}

export interface HotelSettings {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  check_in_time: string;
  check_out_time: string;
  reservation_hold_hours: number;
  no_show_fee: number;
  currency: string;
  tax_rate: number;
  cancellation_policy: string;
  updated_at: string;
}

type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

interface TableShape<R> {
  Row: Row<R>;
  Insert: Insert<R>;
  Update: Update<R>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<Profile>;
      rooms: TableShape<Room>;
      room_images: TableShape<RoomImage>;
      bookings: TableShape<Booking>;
      booking_payments: TableShape<BookingPayment>;
      guest_identifications: TableShape<GuestIdentification>;
      hotel_settings: TableShape<HotelSettings>;
      room_status_history: TableShape<Record<string, unknown>>;
      notifications: TableShape<Record<string, unknown>>;
      audit_logs: TableShape<Record<string, unknown>>;
      reports: TableShape<Record<string, unknown>>;
    };
    Views: Record<string, never>;
    Functions: {
      search_available_rooms: {
        Args: {
          p_check_in: string;
          p_check_out: string;
          p_guests?: number;
          p_room_type?: RoomTypeEnum | null;
        };
        Returns: Room[];
      };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_role: { Args: Record<string, never>; Returns: UserRole };
    };
    Enums: {
      user_role: UserRole;
      room_type: RoomTypeEnum;
      room_status: RoomStatusEnum;
      booking_status: BookingStatusEnum;
      payment_mode: PaymentModeEnum;
      payment_method: PaymentMethodEnum;
      payment_status: PaymentStatusEnum;
      id_type: IdTypeEnum;
      booking_source: BookingSourceEnum;
    };
  };
}
