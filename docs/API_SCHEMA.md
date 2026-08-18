# Mount Patrick Hotel — API Schema

Version: Week 3 MVP contract  
Base URL: `/api`  
Format: JSON unless a download endpoint states otherwise. Errors use `{ "error": "machine-readable-code", "message": "optional human-readable detail" }`.

Authentication is provided by the Supabase session cookie unless marked public or webhook. Authorization is enforced by server-side role checks and database RLS.

## Implemented endpoints

| Method | Path | Access | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/reports?type=daily\|weekly\|monthly&date=YYYY-MM-DD&format=pdf\|csv\|excel` | Admin/Owner | Query parameters | PDF, CSV, or XLSX file download |
| GET | `/api/bookings/{reference}/receipt` | Booking owner or staff | Path parameter `reference` | PDF receipt (`application/pdf`) |
| POST | `/api/payments/paystack/webhook` | Paystack signature | Raw Paystack event body; `x-paystack-signature` header | `{ "received": true }` |
| GET | `/api/payments/paystack/callback?reference=...` | Paystack redirect | Query parameter `reference` | Redirect to booking confirmation or error page |
| POST | `/api/auth/sms-hook` | Supabase signed hook | Supabase Send SMS hook payload; signed request headers | Supabase hook response with SMS delivery data |
| GET | `/api/cron/keep-alive` | Vercel Cron secret | `Authorization: Bearer <CRON_SECRET>` | `{ "ok": true }` |

## Planned application endpoints

These endpoints describe the next implementation slice. Existing server actions may provide equivalent behavior before a public Route Handler is needed.

| Method | Path | Access | Request body | Response shape |
| --- | --- | --- | --- | --- |
| GET | `/api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=1&roomType=...` | Public | Query parameters | `{ "rooms": Room[] }` |
| POST | `/api/bookings` | Guest or public checkout | `{ "roomId": string, "checkIn": string, "checkOut": string, "guestsCount": number, "guest": { "name": string, "phone": string, "email": string }, "paymentMode": "pay_now"\|"pay_at_hotel" }` | `{ "booking": Booking, "paymentUrl": string|null }` |
| GET | `/api/bookings/{reference}` | Booking owner or staff | Path parameter | `{ "booking": Booking, "room": Room, "payments": Payment[] }` |
| PATCH | `/api/bookings/{reference}` | Booking owner or staff | `{ "status"?: BookingStatus, "notes"?: string }` | `{ "booking": Booking }` |
| POST | `/api/bookings/{reference}/cancel` | Booking owner or staff | `{ "reason"?: string }` | `{ "booking": Booking }` |
| POST | `/api/reception/bookings/{reference}/check-in` | Receptionist/Admin/Owner | `{ "identification": { "fullName": string, "phone"?: string, "idType": IdType, "idNumber": string } }` | `{ "booking": Booking, "identification": GuestIdentification }` |
| POST | `/api/reception/bookings/{reference}/check-out` | Receptionist/Admin/Owner | `{ "paymentMethod"?: PaymentMethod, "amount"?: number }` | `{ "booking": Booking, "payment": Payment|null }` |
| PATCH | `/api/admin/rooms/{id}` | Admin/Owner | Room fields to update | `{ "room": Room }` |
| POST | `/api/admin/rooms` | Admin/Owner | `{ "roomNumber": string, "roomType": RoomType, "capacity": number, "pricePerNight": number, "amenities": string[] }` | `{ "room": Room }` |
| GET | `/api/admin/audit-logs?from=...&to=...` | Admin/Owner | Query parameters | `{ "logs": AuditLog[] }` |

## Shared response models

The canonical field names are the database names used by Supabase (`snake_case`) at the persistence boundary. UI adapters may map them to camelCase.

```ts
type Room = { id: string; room_number: string; room_type: string; capacity: number; price_per_night: number; status: string; is_active: boolean };
type Booking = { id: string; reference: string; room_id: string; guest_id: string | null; check_in: string; check_out: string; guests_count: number; total_amount: number; currency: string; payment_mode: string; status: string; source: string };
type Payment = { id: string; booking_id: string; method: string; amount: number; status: string; provider_reference: string | null; paid_at: string | null };
type GuestIdentification = { id: string; booking_id: string; full_name: string; phone: string | null; id_type: string; id_number: string };
```

## Contract rules

- Dates are ISO calendar dates (`YYYY-MM-DD`); currency is GHS for the MVP.
- Booking creation must re-check availability inside the database transaction/RPC and must be safe to retry with an idempotency key.
- Payment webhooks must verify the provider signature and be idempotent by provider reference.
- Error responses must not expose service-role keys, raw provider secrets, or sensitive identification images.
- Every staff mutation and report generation records an audit event.
