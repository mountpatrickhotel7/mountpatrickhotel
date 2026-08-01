-- Mount Patrick Hotel — seed data (rooms + images).
-- Rooms use real gen_random_uuid() ids (RFC-valid). Images are linked by room_number.
-- Room photos live in the public `room-images` storage bucket under tier prefixes
-- (standard/…, deluxe/…, executive/…). The source photos are in docs/Images; on a
-- fresh project upload them to that bucket first, then run this seed. The app's image
-- helper resolves these storage keys to public URLs (and passes absolute URLs through).
--
-- The hotel currently offers one room per tier; add more room_numbers per tier later.

with new_rooms as (
  insert into rooms (room_number, room_type, capacity, price_per_night, description, amenities, status)
  values
    ('101','Standard',2,180,
     'A comfortable, breezy room with a double bed, ceiling fan, flat-screen TV, and a private en-suite bathroom. Simple, clean, and restful.',
     array['Free WiFi','Ceiling Fan','Flat-screen TV','Private Bathroom','Wardrobe'],'Available'),
    ('201','Deluxe',2,290,
     'A cool, air-conditioned room with a lounge sofa, mini fridge, flat-screen TV, and a private tiled bathroom. Extra comfort for a relaxed stay.',
     array['Free WiFi','Air Conditioning','Flat-screen TV','Lounge Sofa','Mini Fridge','Private Bathroom','Wardrobe'],'Available'),
    ('301','Executive',3,450,
     'Our most spacious room: a king bed, private lounge seating, air-conditioning, and a modern en-suite with hot water. Room to truly unwind.',
     array['Free WiFi','Air Conditioning','Flat-screen TV','Lounge Seating','Work Desk','Hot Water','Mini Fridge','Private Bathroom','Wardrobe'],'Available')
  on conflict (room_number) do nothing
  returning id, room_number
)
insert into room_images (room_id, storage_path, is_primary, sort_order)
select nr.id, v.storage_path, v.is_primary, v.sort_order
from new_rooms nr
join (values
  ('101','standard/01.jpg',  true,  0),
  ('101','standard/02.jpg',  false, 1),
  ('101','standard/03.jpg',  false, 2),
  ('101','standard/04.jpg',  false, 3),
  ('101','standard/05.jpg',  false, 4),
  ('201','deluxe/01.jpg',    true,  0),
  ('201','deluxe/02.jpg',    false, 1),
  ('201','deluxe/03.jpg',    false, 2),
  ('201','deluxe/04.jpg',    false, 3),
  ('201','deluxe/05.jpg',    false, 4),
  ('201','deluxe/06.jpg',    false, 5),
  ('201','deluxe/07.jpg',    false, 6),
  ('201','deluxe/08.jpg',    false, 7),
  ('201','deluxe/09.jpg',    false, 8),
  ('301','executive/01.jpg', true,  0),
  ('301','executive/02.jpg', false, 1),
  ('301','executive/03.jpg', false, 2),
  ('301','executive/04.jpg', false, 3),
  ('301','executive/05.jpg', false, 4),
  ('301','executive/06.jpg', false, 5),
  ('301','executive/07.jpg', false, 6),
  ('301','executive/08.jpg', false, 7),
  ('301','executive/09.jpg', false, 8),
  ('301','executive/10.jpg', false, 9)
) as v(room_number, storage_path, is_primary, sort_order) on v.room_number = nr.room_number;
