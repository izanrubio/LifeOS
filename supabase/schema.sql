-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- Crear tipo enum para energy_level
create type energy_level as enum ('low', 'medium', 'high');

-- Tabla: daily_entries
create table daily_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  energy_level energy_level,
  note text,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Tabla: tasks
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- Índices
create index idx_daily_entries_user_date on daily_entries(user_id, date);
create index idx_tasks_user_date on tasks(user_id, date);

-- RLS para daily_entries
alter table daily_entries enable row level security;

create policy "Users can view their own entries"
  on daily_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on daily_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on daily_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on daily_entries for delete
  using (auth.uid() = user_id);

-- RLS para tasks
alter table tasks enable row level security;

create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);
