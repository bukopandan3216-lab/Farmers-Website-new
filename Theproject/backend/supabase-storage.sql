insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true),
       ('farmer-covers', 'farmer-covers', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read product images"
on storage.objects for select
using (bucket_id in ('product-images', 'farmer-covers', 'avatars'));

create policy "Authenticated users can upload marketplace images"
on storage.objects for insert
to authenticated
with check (bucket_id in ('product-images', 'farmer-covers', 'avatars'));

create policy "Users can update their uploaded marketplace images"
on storage.objects for update
to authenticated
using (bucket_id in ('product-images', 'farmer-covers', 'avatars'));
