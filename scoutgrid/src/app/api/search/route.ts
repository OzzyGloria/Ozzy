import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  let supabaseResponse = NextResponse.next({ request: req });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  // Get current user (optional) to determine what data to show
  const { data: { user: authUser } } = await supabase.auth.getUser();
  let isScout = false;
  let isSubscribed = false;

  if (authUser) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("role, subscription_status")
      .eq("id", authUser.id)
      .single();
    isScout = dbUser ? ["scout", "agent", "club", "admin"].includes((dbUser as { role: string }).role) : false;
    isSubscribed = (dbUser as { subscription_status: string } | null)?.subscription_status === "active";
  }

  // Parse filters
  const query = searchParams.get("q") || "";
  const position = searchParams.get("position") || "";
  const minAge = parseInt(searchParams.get("min_age") || "0");
  const maxAge = parseInt(searchParams.get("max_age") || "100");
  const nationality = searchParams.get("nationality") || "";
  const league = searchParams.get("league") || "";
  const preferredFoot = searchParams.get("foot") || "";
  const minMarketValue = parseInt(searchParams.get("min_value") || "0");
  const maxMarketValue = parseInt(searchParams.get("max_value") || "999999999");
  const availabilityStatus = searchParams.get("availability") || "";
  const sortBy = searchParams.get("sort_by") || "market_value_desc";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const cursor = searchParams.get("cursor") || null;

  // Build query
  const today = new Date();
  let dbQuery = supabase
    .from("player_profiles")
    .select(`
      id, user_id, full_name, date_of_birth, nationality, position,
      secondary_position, current_club, league, market_value_eur,
      overall_rating, availability_status, is_verified, is_visible,
      avatar_url, preferred_foot, height_cm, profile_completeness,
      player_stats!player_stats_player_profile_id_fkey(
        season, goals, assists, appearances, rating
      )
    `, { count: "exact" })
    .eq("is_visible", true);

  // Text search on full_name using trigram (if supported)
  if (query) {
    dbQuery = dbQuery.ilike("full_name", `%${query}%`);
  }

  if (position) {
    dbQuery = dbQuery.eq("position", position);
  }

  if (nationality) {
    dbQuery = dbQuery.eq("nationality", nationality);
  }

  if (league) {
    dbQuery = dbQuery.eq("league", league);
  }

  if (preferredFoot) {
    dbQuery = dbQuery.eq("preferred_foot", preferredFoot);
  }

  if (availabilityStatus) {
    dbQuery = dbQuery.eq("availability_status", availabilityStatus);
  }

  if (minMarketValue > 0) {
    dbQuery = dbQuery.gte("market_value_eur", minMarketValue);
  }

  if (maxMarketValue < 999999999) {
    dbQuery = dbQuery.lte("market_value_eur", maxMarketValue);
  }

  // Age filter (approximate via date_of_birth)
  if (minAge > 0) {
    const maxDob = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    dbQuery = dbQuery.lte("date_of_birth", maxDob.toISOString().split("T")[0]);
  }
  if (maxAge < 100) {
    const minDob = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
    dbQuery = dbQuery.gte("date_of_birth", minDob.toISOString().split("T")[0]);
  }

  // Cursor pagination
  if (cursor) {
    dbQuery = dbQuery.gt("id", cursor);
  }

  // Sorting
  switch (sortBy) {
    case "market_value_desc":
      dbQuery = dbQuery.order("market_value_eur", { ascending: false, nullsFirst: false });
      break;
    case "market_value_asc":
      dbQuery = dbQuery.order("market_value_eur", { ascending: true, nullsFirst: false });
      break;
    case "age_asc":
      dbQuery = dbQuery.order("date_of_birth", { ascending: false, nullsFirst: false });
      break;
    case "age_desc":
      dbQuery = dbQuery.order("date_of_birth", { ascending: true, nullsFirst: false });
      break;
    case "overall_rating_desc":
      dbQuery = dbQuery.order("overall_rating", { ascending: false, nullsFirst: false });
      break;
    case "name_asc":
      dbQuery = dbQuery.order("full_name", { ascending: true });
      break;
    default:
      dbQuery = dbQuery.order("market_value_eur", { ascending: false, nullsFirst: false });
  }

  dbQuery = dbQuery.limit(limit);

  const { data: players, error, count } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For non-scout free users, limit and blur some fields
  type PlayerRecord = (typeof players)[number];
  const processedPlayers = players?.map((p: PlayerRecord) => {
    if (!isScout || !isSubscribed) {
      return { ...(p as object), market_value_eur: null, agent_name: null } as PlayerRecord;
    }
    return p;
  });

  const nextCursor = players && players.length === limit
    ? (players[players.length - 1] as { id: string }).id
    : null;

  return NextResponse.json({
    players: processedPlayers,
    total: count,
    next_cursor: nextCursor,
    is_limited: !isScout || !isSubscribed,
  });
}
