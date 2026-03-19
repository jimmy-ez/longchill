create table public.users (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  provider text not null,
  phone text null,
  provider_uid text not null,
  updated_at timestamp with time zone null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;