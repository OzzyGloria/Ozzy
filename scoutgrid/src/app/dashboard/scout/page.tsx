import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavedSearchCard } from "@/components/scout/SavedSearchCard";
import { Search, FileText, Users, TrendingUp, Star, Eye, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function ScoutDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!dbUser || !["scout", "agent", "club", "admin"].includes(dbUser.role)) {
    redirect("/dashboard/player");
  }

  const isPro = ["scout_pro", "club_elite"].includes(dbUser.current_plan_slug);
  const isSubscribed = dbUser.subscription_status === "active";

  const [reportsResult, savedSearchesResult, recentPlayersResult] = await Promise.all([
    supabase
      .from("scouting_reports")
      .select("*, player_profiles(full_name, position, current_club, avatar_url)")
      .eq("scout_id", user.id)
      .order("report_date", { ascending: false })
      .limit(5),
    supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("player_profiles")
      .select("id, full_name, position, current_club, market_value_eur, overall_rating, is_verified, avatar_url, nationality, availability_status")
      .eq("is_visible", true)
      .order("market_value_eur", { ascending: false, nullsFirst: false })
      .limit(6),
  ]);

  const reports = reportsResult.data || [];
  const savedSearches = savedSearchesResult.data || [];
  const recentPlayers = recentPlayersResult.data || [];

  const STAT_CARDS = [
    {
      label: "Reports Written",
      value: reports.length,
      icon: <FileText className="w-5 h-5 text-gold" />,
      href: "/dashboard/scout/reports",
    },
    {
      label: "Saved Searches",
      value: savedSearches.length,
      icon: <Search className="w-5 h-5 text-green" />,
      href: "/search",
    },
    {
      label: "Players Scouted",
      value: new Set(reports.map((r) => r.player_profile_id).filter(Boolean)).size,
      icon: <Users className="w-5 h-5 text-white/60" />,
      href: "/dashboard/scout/reports",
    },
    {
      label: "Plan",
      value: dbUser.current_plan_slug.replace(/_/g, " ").toUpperCase(),
      icon: <TrendingUp className="w-5 h-5 text-gold" />,
      href: "/pricing",
      locked: !isSubscribed,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wider">
            SCOUT DASHBOARD
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {dbUser.full_name} · {dbUser.role.replace("_", " ").toUpperCase()}
            {!isSubscribed && (
              <span className="ml-2 text-gold">· Inactive subscription</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/search" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Players
          </Link>
        </div>
      </div>

      {/* Upgrade banner for non-pro */}
      {!isPro && isSubscribed && (
        <div className="glass-card p-4 border border-gold/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">Upgrade to Scout Pro</p>
            <p className="text-white/50 text-xs mt-0.5">
              Unlock unlimited searches, market value history, PDF export, and saved searches.
            </p>
          </div>
          <Link href="/pricing?plan=scout_pro" className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            Upgrade →
          </Link>
        </div>
      )}

      {!isSubscribed && (
        <div className="glass-card p-4 border border-red-400/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">Subscription Required</p>
            <p className="text-white/50 text-xs mt-0.5">
              Choose a Scout plan to access player profiles and write scouting reports.
            </p>
          </div>
          <Link href="/pricing" className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            View Plans →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} href={card.href} className="glass-card-hover p-5 block">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <div className="font-display text-2xl text-white">{card.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-white tracking-wider">RECENT REPORTS</h2>
            <Link href="/dashboard/scout/reports" className="text-sm text-green hover:text-green-dark transition-colors">
              View all →
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <FileText className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No reports yet.</p>
              <Link href="/search" className="text-green text-sm hover:underline mt-2 block">
                Search players to scout →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const player = report.player_profiles as { full_name: string; position: string; current_club: string; avatar_url: string | null } | null;
                const recColor = {
                  sign: "text-green", monitor: "text-gold", loan: "text-blue-400", reject: "text-red-400"
                }[report.recommendation] ?? "text-white/60";

                return (
                  <div key={report.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {player?.avatar_url ? (
                        <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/40 text-xs font-display">
                          {player?.full_name?.charAt(0) ?? "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {player?.full_name ?? "Unknown Player"}
                      </p>
                      <p className="text-white/40 text-xs">
                        {player?.position} · {player?.current_club ?? "—"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-lg text-white">{report.overall_rating}/10</div>
                      <div className={`text-xs capitalize ${recColor}`}>{report.recommendation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Saved searches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-white tracking-wider">SAVED SEARCHES</h2>
            <Link href="/search" className="text-sm text-green hover:text-green-dark transition-colors">
              + New
            </Link>
          </div>

          {savedSearches.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <Search className="w-6 h-6 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">
                {isPro ? "No saved searches yet." : "Scout Pro required."}
              </p>
              {!isPro && (
                <Link href="/pricing?plan=scout_pro" className="text-xs text-green hover:underline mt-1 block">
                  Upgrade →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((s) => (
                <SavedSearchCard
                  key={s.id}
                  search={s as {
                    id: string;
                    name: string;
                    filters: Record<string, string>;
                    alert_enabled: boolean;
                    created_at: string;
                  }}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top players section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-white tracking-wider">TOP PLAYERS BY VALUE</h2>
          <Link href="/search" className="text-sm text-green hover:text-green-dark transition-colors">
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPlayers.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`} className="glass-card-hover p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {player.avatar_url ? (
                  <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/40 font-display text-sm">{player.full_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{player.full_name}</p>
                <p className="text-white/40 text-xs">{player.position} · {player.current_club ?? "—"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {isSubscribed && player.market_value_eur ? (
                  <p className="text-gold text-sm font-display">{formatCurrency(player.market_value_eur)}</p>
                ) : (
                  <p className="text-white/20 text-sm">—</p>
                )}
                {player.overall_rating && (
                  <p className="text-white/40 text-xs">{player.overall_rating} OVR</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
