-- Enable RLS on all tables
alter table users enable row level security;
alter table player_profiles enable row level security;
alter table player_stats enable row level security;
alter table market_valuations enable row level security;
alter table coach_profiles enable row level security;
alter table coach_stats enable row level security;
alter table highlights enable row level security;
alter table scouting_reports enable row level security;
alter table saved_searches enable row level security;
alter table messages enable row level security;
alter table membership_plans enable row level security;

-- ── users ──────────────────────────────────────────────────────────────
create policy "users_public_read" on users
  for select using (true);

create policy "users_own_insert" on users
  for insert with check (auth.uid() = id);

create policy "users_own_update" on users
  for update using (auth.uid() = id);

-- ── player_profiles ────────────────────────────────────────────────────
create policy "player_profiles_public_read_visible" on player_profiles
  for select using (is_visible = true);

create policy "player_profiles_own_read" on player_profiles
  for select using (user_id = auth.uid());

create policy "player_profiles_admin_read" on player_profiles
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "player_profiles_own_insert" on player_profiles
  for insert with check (user_id = auth.uid());

create policy "player_profiles_own_update" on player_profiles
  for update using (user_id = auth.uid());

-- ── player_stats ───────────────────────────────────────────────────────
create policy "player_stats_read_via_profile" on player_stats
  for select using (
    exists (
      select 1 from player_profiles pp
      where pp.id = player_stats.player_profile_id
      and (pp.is_visible = true or pp.user_id = auth.uid())
    )
  );

create policy "player_stats_own_all" on player_stats
  for all using (
    exists (
      select 1 from player_profiles pp
      where pp.id = player_stats.player_profile_id
      and pp.user_id = auth.uid()
    )
  );

-- ── market_valuations ──────────────────────────────────────────────────
-- Players can see own; Scout Pro+ / Club Elite can see all
create policy "market_valuations_own_read" on market_valuations
  for select using (
    exists (
      select 1 from player_profiles pp
      where pp.id = market_valuations.player_profile_id
      and pp.user_id = auth.uid()
    )
  );

create policy "market_valuations_scout_pro_read" on market_valuations
  for select using (
    exists (
      select 1 from users u
      where u.id = auth.uid()
      and u.role in ('scout','agent','club','admin')
      and u.subscription_status = 'active'
      and u.current_plan_slug in ('scout_pro','club_elite')
    )
  );

create policy "market_valuations_own_write" on market_valuations
  for all using (
    exists (
      select 1 from player_profiles pp
      where pp.id = market_valuations.player_profile_id
      and pp.user_id = auth.uid()
    )
  );

create policy "market_valuations_admin_all" on market_valuations
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- ── coach_profiles ─────────────────────────────────────────────────────
create policy "coach_profiles_public_read" on coach_profiles
  for select using (is_visible = true);

create policy "coach_profiles_own_read" on coach_profiles
  for select using (user_id = auth.uid());

create policy "coach_profiles_own_write" on coach_profiles
  for all using (user_id = auth.uid());

-- ── coach_stats ────────────────────────────────────────────────────────
create policy "coach_stats_read_via_profile" on coach_stats
  for select using (
    exists (
      select 1 from coach_profiles cp
      where cp.id = coach_stats.coach_profile_id
      and (cp.is_visible = true or cp.user_id = auth.uid())
    )
  );

create policy "coach_stats_own_write" on coach_stats
  for all using (
    exists (
      select 1 from coach_profiles cp
      where cp.id = coach_stats.coach_profile_id
      and cp.user_id = auth.uid()
    )
  );

-- ── highlights ─────────────────────────────────────────────────────────
create policy "highlights_public_read" on highlights
  for select using (true);

create policy "highlights_own_write" on highlights
  for all using (owner_id = auth.uid());

-- ── scouting_reports ───────────────────────────────────────────────────
create policy "scouting_reports_own_read" on scouting_reports
  for select using (
    scout_id = auth.uid()
    or exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "scouting_reports_scout_insert" on scouting_reports
  for insert with check (
    scout_id = auth.uid()
    and exists (
      select 1 from users u
      where u.id = auth.uid()
      and u.role in ('scout','agent','club')
      and u.subscription_status = 'active'
    )
  );

create policy "scouting_reports_own_update" on scouting_reports
  for update using (scout_id = auth.uid());

create policy "scouting_reports_own_delete" on scouting_reports
  for delete using (scout_id = auth.uid());

-- ── saved_searches ─────────────────────────────────────────────────────
create policy "saved_searches_own_all" on saved_searches
  for all using (user_id = auth.uid());

-- ── messages ───────────────────────────────────────────────────────────
create policy "messages_participant_read" on messages
  for select using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "messages_authenticated_send" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from users u
      where u.id = auth.uid()
      and u.subscription_status = 'active'
    )
  );

create policy "messages_receiver_update" on messages
  for update using (receiver_id = auth.uid());

-- ── membership_plans ───────────────────────────────────────────────────
create policy "membership_plans_public_read" on membership_plans
  for select using (is_active = true);

create policy "membership_plans_admin_all" on membership_plans
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
