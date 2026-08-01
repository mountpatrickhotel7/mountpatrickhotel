-- Direct MTN MoMo payments (guest sends money to the hotel's merchant number,
-- skipping Paystack and its fee; staff confirm receipt in Reception).
--
-- Such a booking sits at 'Awaiting Payment' while the guest transfers. That
-- status previously did NOT hold the room — only Reserved/Confirmed/Checked-In
-- did — so a second guest could take the room while the first was mid-transfer,
-- leaving the hotel to refund a MoMo payment by hand. Adding it to the overlap
-- constraint (and to the availability re-check in src/app/book/actions.ts)
-- closes that window.

alter type payment_mode add value if not exists 'momo_direct';

alter table bookings drop constraint if exists bookings_no_overlap;

alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('Awaiting Payment', 'Reserved', 'Confirmed', 'Checked-In'));
