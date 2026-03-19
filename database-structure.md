create table public.users (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  provider text not null,
  phone text null,
  provider_uid text not null,
  updated_at timestamp with time zone null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;

create table public.reservations (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  customer_name text not null,
  phone text not null,
  date date not null,
  time time with time zone not null,
  party_size numeric not null,
  status text not null,
  uid uuid not null,
  constraint reservations_pkey primary key (id),
  constraint reservations_id_key unique (id),
  constraint reservations_uid_fkey foreign KEY (uid) references users (id)
) TABLESPACE pg_default;