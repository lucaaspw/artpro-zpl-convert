-- zpl-convert: schema esperado pelo app (NextAuth + /api/convert).
-- Execute no Supabase: SQL Editor → New query → Run (ou `supabase db push` se usar CLI).

-- Usuarios espelhados do Google (JWT usa users.id como session.user.id)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  google_id text not null,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint users_google_id_key unique (google_id)
);

create index if not exists users_email_idx on public.users (email);

-- Historico de conversoes ZPL → PDF
create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  original_filename text not null,
  label_count integer not null default 0,
  format text not null default 'pdf',
  pdf_url text,
  status text not null default 'processing',
  processing_time_ms integer,
  created_at timestamptz not null default now(),
  constraint conversions_status_check check (
    status in ('processing', 'ready', 'error')
  )
);

create index if not exists conversions_user_id_created_at_idx
  on public.conversions (user_id, created_at desc);

-- Bucket usado em app/api/convert/route.ts (upload + signed URL)
insert into storage.buckets (id, name, public)
values ('pdf-outputs', 'pdf-outputs', false)
on conflict (id) do update set name = excluded.name;
