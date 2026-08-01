-- Mount Patrick Hotel — storage buckets & policies

insert into storage.buckets (id, name, public)
values
  ('room-images', 'room-images', true),
  ('avatars', 'avatars', true),
  ('guest-ids', 'guest-ids', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

-- Public read for room images & avatars
create policy "public read room-images" on storage.objects
  for select using (bucket_id = 'room-images');
create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

-- Admins manage room images
create policy "admin write room-images" on storage.objects
  for all using (bucket_id = 'room-images' and public.is_admin())
  with check (bucket_id = 'room-images' and public.is_admin());

-- Users manage their own avatar (path prefixed with their uid)
create policy "user write own avatar" on storage.objects
  for all using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Staff manage private guest ID images
create policy "staff manage guest-ids" on storage.objects
  for all using (bucket_id = 'guest-ids' and public.is_staff())
  with check (bucket_id = 'guest-ids' and public.is_staff());

-- Admins read/write reports
create policy "admin manage reports" on storage.objects
  for all using (bucket_id = 'reports' and public.is_admin())
  with check (bucket_id = 'reports' and public.is_admin());
