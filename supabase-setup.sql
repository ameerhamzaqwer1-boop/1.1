-- Kitchen Craft PK — Supabase setup
-- 1) Neeche YOUR_EMAIL_HERE ko apni email se badal dein (jis email se admin.html mein login karengi).
--    Poori file mein "Find & Replace" use karein — sirf wohi email products badal sakti hai.
-- 2) Phir Supabase > SQL Editor > New query mein paste karke "Run" dabayein.

-- ---------- Products table ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  subtitle    text,
  category    text not null default 'Other',
  brand       text,
  price       numeric,
  image       text,
  details     text[] not null default '{}',
  in_stock    boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Sab log products dekh sakte hain
create policy "Anyone can view products" on public.products
  for select using (true);

-- Sirf owner add / edit / delete kar sakta hai
create policy "Owner can add products" on public.products
  for insert to authenticated
  with check (lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'));

create policy "Owner can edit products" on public.products
  for update to authenticated
  using (lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'))
  with check (lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'));

create policy "Owner can delete products" on public.products
  for delete to authenticated
  using (lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'));

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Anyone can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Owner can upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'));

create policy "Owner can change product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'));

create policy "Owner can delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('YOUR_EMAIL_HERE'));
