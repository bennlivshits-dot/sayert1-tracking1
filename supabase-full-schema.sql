-- Clean slate: drops these tables entirely first, so no leftover column names
-- or types from earlier in this project can conflict with what's defined below.
-- This deletes any existing data in them.
drop table if exists public.event_attendance cascade;
drop table if exists public.individual_attendance cascade;
drop table if exists public.attendance_reports cascade;
drop table if exists public.training_feedback cascade;
drop table if exists public.personal_logs cascade;
drop table if exists public.official_events cascade;
drop table if exists public.app_content cascade;
drop table if exists public.system_settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.teams cascade;
drop table if exists public.networks cascade;

create extension if not exists pgcrypto;

-- NETWORKS & TEAMS
create table public.networks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique
);

create table public.teams (
  id int primary key,
  code text not null
);

alter table public.networks enable row level security;
alter table public.teams enable row level security;

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text not null default 'trainee' check (role in ('trainee','team_leader','admin')),
  network uuid references public.networks(id),
  team_id int references public.teams(id),
  full_name text,
  age int,
  height numeric,
  weight numeric,
  is_healthy boolean default true,
  health_issues text,
  target_unit text,
  fitness_level text,
  onboarded boolean default false,
  gibush_date date,
  gibush_type text,
  war_mode boolean default false,
  light_mode boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- HELPER FUNCTIONS
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_leader()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'team_leader');
$$;

create or replace function public.my_team_id()
returns int language sql security definer stable as $$
  select team_id from public.profiles where id = auth.uid();
$$;

create policy "admins_read_networks" on public.networks for select using (is_admin());
create policy "admins_read_teams" on public.teams for select using (is_admin());

-- PROFILES RLS
create policy "read_own_profile" on public.profiles for select using (id = auth.uid());
create policy "admins_read_all_profiles" on public.profiles for select using (is_admin());
create policy "leaders_read_own_team_profiles" on public.profiles for select using (is_leader() and team_id = my_team_id());
create policy "update_own_profile" on public.profiles for update using (id = auth.uid());
create policy "admins_update_any_profile" on public.profiles for update using (is_admin());

-- SIGNUP TRIGGER
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create function public.handle_new_user()
returns trigger as $$
begin
  -- coach_code grants admin to anyone who enters it correctly, no usage limit.
  insert into public.profiles (id, email, role, network, onboarded)
  values (
    new.id,
    new.email,
    case when (new.raw_user_meta_data ->> 'coach_code') = '12345123' then 'admin' else 'trainee' end,
    (new.raw_user_meta_data ->> 'network')::uuid,
    (new.raw_user_meta_data ->> 'coach_code') = '12345123'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- VERIFICATION RPCS
drop function if exists public.verify_network_code(text);
create function public.verify_network_code(p_code text)
returns uuid language sql security definer stable as $$
  select id from public.networks where code = p_code;
$$;

drop function if exists public.verify_team_code(int, text);
create function public.verify_team_code(p_team_id int, p_code text)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.teams where id = p_team_id and code = p_code);
$$;

-- APP CONTENT
create table public.app_content (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  subcategory text,
  title text not null,
  body text,
  image_url text,
  date_label text,
  created_at timestamptz default now()
);

alter table public.app_content enable row level security;
create policy "content_read_authenticated" on public.app_content for select using (auth.role() = 'authenticated');
create policy "content_insert_admin" on public.app_content for insert with check (is_admin());
create policy "content_update_admin" on public.app_content for update using (is_admin());
create policy "content_delete_admin" on public.app_content for delete using (is_admin());

-- OFFICIAL EVENTS
create table public.official_events (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  title text not null,
  time text,
  end_time text,
  location text,
  created_at timestamptz default now()
);

alter table public.official_events enable row level security;
create policy "events_read_authenticated" on public.official_events for select using (auth.role() = 'authenticated');
create policy "events_insert_admin" on public.official_events for insert with check (is_admin());

-- PERSONAL LOGS
create table public.personal_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  time text,
  title text not null,
  detail text,
  created_at timestamptz default now()
);

alter table public.personal_logs enable row level security;
create policy "logs_own_full_access" on public.personal_logs for all using (user_id = auth.uid());
create policy "logs_read_admin" on public.personal_logs for select using (is_admin());
create policy "logs_read_leader_team" on public.personal_logs for select using (
  is_leader() and user_id in (select id from public.profiles where team_id = my_team_id())
);

-- TRAINING FEEDBACK
create table public.training_feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  event_id text,
  event_title text,
  first_name text,
  team_id int,
  coach text,
  value_rating int,
  recommend_rating int,
  opinion text,
  kind_word_team int,
  kind_word_value text,
  kind_word_text text,
  how_are_you text,
  message_to_yuval text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.training_feedback enable row level security;
create policy "feedback_insert_own" on public.training_feedback for insert with check (user_id = auth.uid());
create policy "feedback_read_own" on public.training_feedback for select using (user_id = auth.uid());
create policy "feedback_read_admin" on public.training_feedback for select using (is_admin());
create policy "feedback_update_admin" on public.training_feedback for update using (is_admin());

-- ATTENDANCE REPORTS
create table public.attendance_reports (
  id uuid default gen_random_uuid() primary key,
  team_id int,
  event_id text,
  date date not null,
  attendance_percentage int,
  created_at timestamptz default now()
);

alter table public.attendance_reports enable row level security;
create policy "attendance_insert_leader" on public.attendance_reports for insert with check (is_leader() and team_id = my_team_id());
create policy "attendance_read_admin" on public.attendance_reports for select using (is_admin());
create policy "attendance_read_leader" on public.attendance_reports for select using (is_leader() and team_id = my_team_id());

-- INDIVIDUAL ATTENDANCE
create table public.individual_attendance (
  id uuid default gen_random_uuid() primary key,
  event_id text,
  date date not null,
  team_id int,
  user_id uuid references public.profiles(id) on delete cascade,
  present boolean not null default false,
  created_at timestamptz default now()
);

alter table public.individual_attendance enable row level security;
create policy "individual_attendance_insert_leader" on public.individual_attendance for insert with check (is_leader() and team_id = my_team_id());
create policy "individual_attendance_read_admin" on public.individual_attendance for select using (is_admin());
create policy "individual_attendance_read_leader" on public.individual_attendance for select using (is_leader() and team_id = my_team_id());

-- EVENT RSVP
create table public.event_attendance (
  id uuid default gen_random_uuid() primary key,
  event_id text,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('coming','not_coming')),
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.event_attendance enable row level security;
create policy "rsvp_own_full_access" on public.event_attendance for all using (user_id = auth.uid());
create policy "rsvp_read_admin" on public.event_attendance for select using (is_admin());

-- SYSTEM SETTINGS + GEMINI KEY
create table public.system_settings (
  key text primary key,
  value text
);

alter table public.system_settings enable row level security;

insert into public.system_settings (key, value) values ('gemini_api_key', 'PASTE_YOUR_KEY_HERE')
  on conflict (key) do update set value = excluded.value;

-- SEED DATA
insert into public.networks (name, code) values ('SayertTracking', '12131415');

insert into public.teams (id, code) values
  (1,'12121212'), (2,'23412345'), (3,'12351235'), (4,'99899989'),
  (5,'05405454'), (6,'67676767'), (7,'57473727'), (8,'11188818'),
  (9,'45945945'), (10,'34873487'), (11,'52135213'), (12,'12131412');

-- Sign up once through the app, then run to make yourself admin:
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';

-- STORAGE (real image uploads for unit badges/pins - not external URLs)
insert into storage.buckets (id, name, public)
values ('unit-images', 'unit-images', true)
on conflict (id) do nothing;

drop policy if exists "unit_images_public_read" on storage.objects;
create policy "unit_images_public_read" on storage.objects
  for select using (bucket_id = 'unit-images');

drop policy if exists "unit_images_admin_upload" on storage.objects;
create policy "unit_images_admin_upload" on storage.objects
  for insert with check (bucket_id = 'unit-images' and is_admin());

drop policy if exists "unit_images_admin_update" on storage.objects;
create policy "unit_images_admin_update" on storage.objects
  for update using (bucket_id = 'unit-images' and is_admin());

-- TRAINING REFLECTIONS (permanent keep/improve history with AI feedback)
create table if not exists public.training_reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  training_ref_id text not null,
  training_title text,
  training_date date,
  is_group boolean default false,
  keep1 text,
  keep2 text,
  improve1 text,
  improve2 text,
  ai_tips text,
  created_at timestamptz default now()
);

alter table public.training_reflections enable row level security;
drop policy if exists "reflections_own_full_access" on public.training_reflections;
create policy "reflections_own_full_access" on public.training_reflections for all using (user_id = auth.uid());
drop policy if exists "reflections_read_admin" on public.training_reflections;
create policy "reflections_read_admin" on public.training_reflections for select using (is_admin());

-- FITNESS TESTS (running times, pull-ups, push-ups, dips - tracked over time with a graph)
create table if not exists public.fitness_tests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  test_type text not null,
  value numeric not null,
  test_date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.fitness_tests enable row level security;
drop policy if exists "fitness_tests_own_full_access" on public.fitness_tests;
create policy "fitness_tests_own_full_access" on public.fitness_tests for all using (user_id = auth.uid());
drop policy if exists "fitness_tests_read_admin" on public.fitness_tests;
create policy "fitness_tests_read_admin" on public.fitness_tests for select using (is_admin());
create index if not exists fitness_tests_user_type_idx on public.fitness_tests(user_id, test_type, test_date);
