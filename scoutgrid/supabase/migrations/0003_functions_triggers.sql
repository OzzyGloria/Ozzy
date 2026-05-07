-- ─────────────────────────────────────────────────────────
-- Auto-create public.users row when auth.users row is created
-- ─────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'player')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────
-- Auto-update updated_at on modify
-- ─────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on users;
create trigger users_updated_at
  before update on users
  for each row execute procedure set_updated_at();

drop trigger if exists player_profiles_updated_at on player_profiles;
create trigger player_profiles_updated_at
  before update on player_profiles
  for each row execute procedure set_updated_at();

drop trigger if exists coach_profiles_updated_at on coach_profiles;
create trigger coach_profiles_updated_at
  before update on coach_profiles
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────────────────────
-- Profile completeness calculator (returns 0-100)
-- ─────────────────────────────────────────────────────────
create or replace function calculate_player_completeness(p_profile_id uuid)
returns int language plpgsql as $$
declare
  score int := 0;
  p player_profiles%rowtype;
  stats_count int;
  highlight_count int;
begin
  select * into p from player_profiles where id = p_profile_id;
  if not found then return 0; end if;

  -- Identity (40 pts)
  if p.date_of_birth is not null then score := score + 8; end if;
  if p.nationality is not null then score := score + 5; end if;
  if p.height_cm is not null then score := score + 5; end if;
  if p.weight_kg is not null then score := score + 5; end if;
  if p.preferred_foot is not null then score := score + 5; end if;
  if p.position is not null then score := score + 7; end if;
  if p.bio is not null and length(p.bio) > 50 then score := score + 5; end if;

  -- Club (20 pts)
  if p.current_club is not null then score := score + 10; end if;
  if p.league is not null then score := score + 10; end if;

  -- Stats (25 pts)
  select count(*) into stats_count
  from player_stats where player_profile_id = p_profile_id;
  if stats_count >= 1 then score := score + 15; end if;
  if stats_count >= 3 then score := score + 10; end if;

  -- Media (15 pts)
  if p.avatar_url is not null then score := score + 10; end if;
  select count(*) into highlight_count
  from highlights where owner_id = p.user_id and owner_type = 'player';
  if highlight_count >= 1 then score := score + 5; end if;

  return least(score, 100);
end;
$$;

-- ─────────────────────────────────────────────────────────
-- Profile view tracking helper
-- ─────────────────────────────────────────────────────────
create or replace function increment_highlight_views(p_highlight_id uuid)
returns void language plpgsql security definer as $$
begin
  update highlights set views = views + 1 where id = p_highlight_id;
end;
$$;

-- ─────────────────────────────────────────────────────────
-- Win percentage computed column helper
-- ─────────────────────────────────────────────────────────
create or replace function coach_win_pct(wins int, draws int, losses int)
returns numeric language plpgsql immutable as $$
declare
  total int;
begin
  total := coalesce(wins, 0) + coalesce(draws, 0) + coalesce(losses, 0);
  if total = 0 then return 0; end if;
  return round((coalesce(wins, 0)::numeric / total) * 100, 1);
end;
$$;
