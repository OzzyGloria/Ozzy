-- Create storage buckets (run via Supabase Dashboard > Storage or via CLI)
-- supabase storage create avatars --public
-- supabase storage create banners --public
-- supabase storage create highlights --public

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/jpg','image/png','image/webp']),
  ('banners', 'banners', true, 10485760, array['image/jpeg','image/jpg','image/png','image/webp']),
  ('highlights', 'highlights', true, 524288000, array['video/mp4','video/quicktime','video/webm','video/x-msvideo'])
on conflict (id) do nothing;

-- Storage RLS policies
-- Avatars
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_authenticated_upload" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_own_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Banners
create policy "banners_public_read" on storage.objects
  for select using (bucket_id = 'banners');

create policy "banners_authenticated_upload" on storage.objects
  for insert with check (
    bucket_id = 'banners'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Highlights
create policy "highlights_public_read" on storage.objects
  for select using (bucket_id = 'highlights');

create policy "highlights_subscriber_upload" on storage.objects
  for insert with check (
    bucket_id = 'highlights'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
      and u.subscription_status = 'active'
    )
  );

create policy "highlights_own_delete" on storage.objects
  for delete using (
    bucket_id = 'highlights'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
