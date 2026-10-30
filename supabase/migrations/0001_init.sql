-- JASHN Postgres Migration: 0001_init.sql
-- PromptWars Challenge 5

create type event_type as enum ('wedding', 'birthday', 'community');
create type task_status as enum ('todo', 'doing', 'done');
create type vendor_status as enum ('to_contact', 'contacted', 'quoted', 'booked', 'rejected');

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  type event_type not null,
  title text not null,
  event_date date not null,
  city text not null,
  city_tier smallint not null default 2,
  guest_count int not null check (guest_count > 0),
  total_budget numeric(12,2) not null check (total_budget > 0),
  currency text not null default 'INR',
  vibe text[] default '{}',
  preferences jsonb not null default '{}',
  summary text,
  risks text[] default '{}',
  readiness_pct smallint default 15,
  created_at timestamptz default now()
);

create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  category text not null,
  label text not null,
  allocation_pct numeric(5,2) not null,
  planned numeric(12,2) not null,
  actual numeric(12,2) not null default 0,
  rationale text,
  ai_generated boolean default true,
  sort_order int default 0
);

create table if not exists timeline_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  phase text not null,
  due_offset_days int not null default 0,
  due_date date not null,
  status task_status not null default 'todo',
  category text,
  is_compressed boolean default false,
  ai_generated boolean default true,
  sort_order int default 0
);

create table if not exists vendor_checklist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  category text not null,
  why text,
  must_ask text[] default '{}',
  vendor_name text,
  contact text,
  quote numeric(12,2),
  status vendor_status not null default 'to_contact',
  notes text
);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  kind text not null,
  title text not null,
  description text not null,
  est_cost_min numeric(12,2),
  est_cost_max numeric(12,2),
  saved boolean default false
);

create table if not exists ai_runs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete set null,
  kind text not null,
  model text,
  latency_ms int,
  ok boolean,
  input jsonb,
  output jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_budget_event on budget_items(event_id);
create index if not exists idx_tasks_event_date on timeline_tasks(event_id, due_date);
create index if not exists idx_vendors_event on vendor_checklist(event_id);
create index if not exists idx_ideas_event on ideas(event_id);

-- Enable Row Level Security (RLS) on every table
alter table events enable row level security;
alter table budget_items enable row level security;
alter table timeline_tasks enable row level security;
alter table vendor_checklist enable row level security;
alter table ideas enable row level security;
alter table ai_runs enable row level security;

-- RLS Policies: isolation per user
create policy "Users can manage their own events" on events
  for all using (owner_id = auth.uid());

create policy "Users can manage budget items of their events" on budget_items
  for all using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "Users can manage timeline tasks of their events" on timeline_tasks
  for all using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "Users can manage vendors of their events" on vendor_checklist
  for all using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "Users can manage ideas of their events" on ideas
  for all using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "Users can view AI runs of their events" on ai_runs
  for select using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));
