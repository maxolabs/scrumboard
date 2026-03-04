-- ============================================
-- ScrumBoard — Initial Schema
-- ============================================

-- Custom types
create type match_status as enum ('pending', 'first_half', 'half_time', 'second_half', 'finished');
create type match_half as enum ('first', 'second');
create type event_team as enum ('ours', 'theirs');
create type event_category as enum (
  'try', 'conversion', 'penalty_kick', 'drop_goal',
  'penalty_for', 'penalty_against',
  'scrum', 'lineout', 'ruck', 'maul', 'kickoff', 'kick',
  'obs_attack', 'obs_defense',
  'obs_skills_catch_pass', 'obs_skills_duel', 'obs_skills_tackle', 'obs_skills_ruck',
  'obs_general', 'obs_player'
);
create type event_outcome as enum ('won', 'lost', 'penalty_for', 'penalty_against', 'neutral');

-- ============================================
-- Profiles
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  club_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Teams
-- ============================================
create table teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text not null default '',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table teams enable row level security;

create policy "Users can manage own teams"
  on teams for all using (auth.uid() = user_id);

-- ============================================
-- Matches
-- ============================================
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  opponent_name text not null default '',
  is_home boolean not null default true,
  match_date date not null default current_date,
  status match_status not null default 'pending',
  home_score integer not null default 0,
  away_score integer not null default 0,
  first_half_seconds integer not null default 0,
  second_half_seconds integer not null default 0,
  current_half match_half not null default 'first',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table matches enable row level security;

create policy "Users can manage own matches"
  on matches for all using (auth.uid() = user_id);

-- ============================================
-- Match Events
-- ============================================
create table match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  category event_category not null,
  team event_team,
  outcome event_outcome,
  half match_half not null default 'first',
  match_minute integer not null default 0,
  points integer not null default 0,
  player_number integer,
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table match_events enable row level security;

create policy "Users can manage own match events"
  on match_events for all
  using (
    exists (
      select 1 from matches where matches.id = match_events.match_id and matches.user_id = auth.uid()
    )
  );

-- ============================================
-- Score recalculation trigger
-- ============================================
create or replace function public.recalculate_match_score()
returns trigger as $$
declare
  v_match_id uuid;
  v_home_score integer;
  v_away_score integer;
  v_is_home boolean;
begin
  v_match_id := coalesce(new.match_id, old.match_id);

  select is_home into v_is_home from matches where id = v_match_id;

  -- "ours" team points go to home if is_home, away otherwise
  select
    coalesce(sum(case
      when (team = 'ours' and v_is_home) or (team = 'theirs' and not v_is_home)
      then points else 0 end), 0),
    coalesce(sum(case
      when (team = 'theirs' and v_is_home) or (team = 'ours' and not v_is_home)
      then points else 0 end), 0)
  into v_home_score, v_away_score
  from match_events
  where match_id = v_match_id and points > 0;

  update matches
  set home_score = v_home_score, away_score = v_away_score, updated_at = now()
  where id = v_match_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_match_event_change
  after insert or update or delete on match_events
  for each row execute function public.recalculate_match_score();

-- ============================================
-- Button Layouts
-- ============================================
create table button_layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'Default',
  layout jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table button_layouts enable row level security;

create policy "Users can manage own button layouts"
  on button_layouts for all using (auth.uid() = user_id);
