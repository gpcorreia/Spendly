-- drop table if exists conversation_contexts;
-- drop table if exists expenses;
-- drop table if exists users;

-- create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  email text,
  name text,
  number_id text,
  timestamp text,
  access_token text,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category text not null,
  amount numeric(12,2) not null,
  expense_date date not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index expenses_user_expense_date_idx
on expenses (user_id, expense_date desc);

create index expenses_user_created_at_idx
on expenses (user_id, created_at desc);



create table conversation_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  context_type text not null,
  context_summary text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index conversation_contexts_user_type_idx
on conversation_contexts (user_id, context_type);

create index conversation_contexts_user_expires_idx
on conversation_contexts (user_id, expires_at);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_conversation_contexts_updated_at
before update on conversation_contexts
for each row
execute function set_updated_at();