import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHero } from "@/components/player/ProfileHero";
import { StatsTable } from "@/components/player/StatsTable";
import { PlayerRadarChart } from "@/components/player/RadarChart";
import { MarketValueChart } from "@/components/player/MarketValueChart";
import { HighlightGallery } from "@/components/player/HighlightGallery";
import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";
import type { PlayerProfile, PlayerStats, MarketValuation, Highlight } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: player } = await supabase
    .from("player_profiles")
    .select("full_name, position, nationality, current_club")
    .eq("id", id)
    .single();

  if (!player) return { title: "Player Not Found — ScoutGrid" };

  return {
    title: `${player.full_name} — ${player.position} | ScoutGrid`,
    description: `${player.full_name} is a ${player.position} from ${player.nationality}${player.current_club ? ` playing for ${player.current_club}` : ""}. View stats, highlights and scouting reports on ScoutGrid.`,
  };
}

export const revalidate = 3600;

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user (optional — affects what's visible)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  let dbUser = null;
  let canContact = false;
  let canSave = false;
  let canViewMarketValue = false;

  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("id, role, current_plan_slug, subscription_status")
      .eq("id", authUser.id)
      .single();
    dbUser = data;

    const isScout = dbUser && ["scout", "agent", "club"].includes(dbUser.role);
    const hasActiveSub = dbUser?.subscription_status === "active";
    canContact = isScout && hasActiveSub && ["scout_pro", "club_elite"].includes(dbUser.current_plan_slug);
    canSave = isScout && hasActiveSub;
    canViewMarketValue = isScout && hasActiveSub && ["scout_pro", "club_elite"].includes(dbUser.current_plan_slug);
  }

  // Fetch player profile
  const { data: player } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("id", id)
    .eq("is_visible", true)
    .single();

  if (!player) notFound();

  // Fetch related data in parallel
  const [statsResult, valuationsResult, highlightsResult] = await Promise.all([
    supabase
      .from("player_stats")
      .select("*")
      .eq("player_profile_id", id)
      .order("season", { ascending: false }),
    supabase
      .from("market_valuations")
      .select("*")
      .eq("player_profile_id", id)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("highlights")
      .select("*")
      .eq("owner_id", player.user_id)
      .eq("owner_type", "player")
      .order("sort_order", { ascending: true }),
  ]);

  const stats: PlayerStats[] = statsResult.data || [];
  const valuations: MarketValuation[] = valuationsResult.data || [];
  const highlights: Highlight[] = highlightsResult.data || [];
  const latestStats = stats[0] || null;

  return (
    <div className="min-h-screen bg-navy">
      <Navbar />

      <div className="pt-20 pb-16 section-container">
        {/* Hero */}
        <div className="mb-8">
          <ProfileHero
            player={player as PlayerProfile}
            canContact={canContact}
            canSave={canSave}
          />
        </div>

        {/* Bio */}
        {player.bio && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display text-lg text-white mb-3 tracking-wider">ABOUT</h3>
            <p className="text-white/70 text-sm leading-relaxed">{player.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Radar + Market Value */}
          <div className="space-y-6">
            {latestStats && (
              <PlayerRadarChart stats={latestStats as PlayerStats} position={player.position || undefined} />
            )}
            {valuations.length > 0 && (
              <MarketValueChart
                valuations={valuations as MarketValuation[]}
                locked={!canViewMarketValue}
              />
            )}
          </div>

          {/* Right column: Stats + Highlights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats table */}
            {stats.length > 0 ? (
              <div>
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">SEASON STATISTICS</h3>
                <StatsTable stats={stats as PlayerStats[]} position={player.position || undefined} />
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-white/30 text-sm">
                No season statistics available
              </div>
            )}

            {/* Highlights */}
            <div>
              <h3 className="font-display text-xl text-white mb-4 tracking-wider">HIGHLIGHTS</h3>
              <HighlightGallery highlights={highlights as Highlight[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
