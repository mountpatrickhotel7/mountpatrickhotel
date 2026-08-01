-- Prevent two active bookings for the same room on overlapping dates at the
-- database level (guards against race conditions the app-level check can miss).
-- Half-open ranges: a check-out day may be another guest's check-in.

alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('Reserved', 'Confirmed', 'Checked-In'));
