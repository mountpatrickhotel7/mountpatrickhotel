# Mount Patrick Hotel — Entity Relationship Diagram

Generated from the live Supabase database schema on 18 August 2026. The diagram includes the
application tables in the `public` schema and the external relationship to Supabase Auth's
`auth.users` table. Supabase internal schemas and Storage system tables are intentionally omitted.

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
    }

    PROFILES {
        uuid id PK, FK
        text full_name
        text phone
        text email
        user_role role
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    ROOMS {
        uuid id PK
        text room_number
        room_type room_type
        integer capacity
        text description
        text_array amenities
        numeric price_per_night
        room_status status
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    ROOM_IMAGES {
        uuid id PK
        uuid room_id FK
        text storage_path
        boolean is_primary
        integer sort_order
        timestamptz created_at
    }

    ROOM_STATUS_HISTORY {
        uuid id PK
        uuid room_id FK
        room_status from_status
        room_status to_status
        uuid changed_by FK
        text reason
        timestamptz created_at
    }

    BOOKINGS {
        uuid id PK
        text reference
        uuid guest_id FK
        uuid room_id FK
        date check_in
        date check_out
        integer guests_count
        numeric total_amount
        text currency
        payment_mode payment_mode
        booking_status status
        booking_source source
        timestamptz hold_expires_at
        text qr_payload
        text guest_name
        text guest_phone
        text guest_email
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    BOOKING_PAYMENTS {
        uuid id PK
        uuid booking_id FK
        payment_method method
        numeric amount
        payment_status status
        text provider_reference
        timestamptz paid_at
        uuid recorded_by FK
        timestamptz created_at
    }

    GUEST_IDENTIFICATIONS {
        uuid id PK
        uuid booking_id FK
        text full_name
        text phone
        id_type id_type
        text id_number
        text id_image_path
        uuid created_by FK
        timestamptz created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        notification_channel channel
        text type
        text recipient
        jsonb payload
        notification_status status
        text error
        timestamptz sent_at
        timestamptz created_at
    }

    REPORTS {
        uuid id PK
        text type
        date period_start
        date period_end
        text format
        text storage_path
        uuid generated_by FK
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        text action
        text entity
        text entity_id
        jsonb metadata
        timestamptz created_at
    }

    HOTEL_SETTINGS {
        integer id PK
        text name
        text email
        text phone
        text address
        text check_in_time
        text check_out_time
        integer reservation_hold_hours
        numeric no_show_fee
        text currency
        numeric tax_rate
        text cancellation_policy
        timestamptz updated_at
    }

    AUTH_USERS ||--o| PROFILES : "owns profile"
    PROFILES o|--o{ BOOKINGS : "books as guest"
    ROOMS ||--o{ BOOKINGS : "is reserved in"
    BOOKINGS ||--o{ BOOKING_PAYMENTS : "receives payments"
    BOOKINGS o|--o{ GUEST_IDENTIFICATIONS : "has identification"
    ROOMS ||--o{ ROOM_IMAGES : "has images"
    ROOMS ||--o{ ROOM_STATUS_HISTORY : "has status history"
    PROFILES o|--o{ BOOKING_PAYMENTS : "records"
    PROFILES o|--o{ GUEST_IDENTIFICATIONS : "creates"
    PROFILES o|--o{ ROOM_STATUS_HISTORY : "changes"
    PROFILES o|--o{ NOTIFICATIONS : "receives"
    PROFILES o|--o{ REPORTS : "generates"
    PROFILES o|--o{ AUDIT_LOGS : "performs"
```

## Relationship summary

- A Supabase Auth user may have one application profile.
- A profile may make many bookings; walk-in bookings may have no linked profile.
- A room may have many bookings, images, and status-history entries.
- A booking may have many payments and guest-identification records.
- Staff profiles may record payments, create identification records, change room statuses,
  generate reports, receive notifications, and appear in audit logs.
- `hotel_settings` is a standalone singleton-style configuration table.

Nullable foreign keys are shown as optional relationships. Primary and foreign key labels reflect
the constraints found in the live database at generation time.
