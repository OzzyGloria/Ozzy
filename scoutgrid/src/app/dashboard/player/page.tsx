import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileCompleteness } from "@/components/player/ProfileCompleteness";
import { MarketValueChart } from "@/components/player/MarketValueChart";
import { HighlightGallery } from "@/components/player/HighlightGallery";
import { TrendingUp, Eye, MessageSquare, Star, Users, Video, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function PlayerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!dbUser || dbUser.role !== "player") redirect("/dashboard/coach");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const [statsResult, valuationsResult, highlightsResult] = await Promise.all([
    supabase.from("player_stats").select("*").eq("player_profile_id", profile?.id || "").order("season", { ascending: false }),
    supabase.from("market_valuations").select("*").eq("player_profile_id", profile?.id || "").order("recorded_at"),
    supabase.from("highlights").select("*").eq("owner_id", user.id).eq("owner_type", "player").order("sort_order"),
  ]);

  const stats = statsResult.data || [];
  const valuations = valuationsResult.data || [];
  const highlights = highlightsResult.data || [];
  const latestStats = stats[0];

  const planName = dbUser.current_plan_slug.replace(/_/g, " ").toUpperCase();
  const isPaidPlan = dbUser.current_plan_slug !== "free";

  const STAT_CARDS = [
    {
      label: "Goals This Season",
      value: latestStats?.goals ?? "—",
      icon: <Star className="w-5 h-5 text-gold" />,
      sub: `${latestStats?.assists ?? 0} assists`,
    },
    {
      label: "Appearances",
      value: latestStats?.appearances ?? "—",
      icon: <Users className="w-5 h-5 text-green" />,
      sub: `${latestStats?.minutes_played ?? 0} minutes`,
    },
    {
      label: "Market Value",
      value: profile?.market_value_eur ? formatCurrency(profile.market_value_eur) : "—",
      icon: <TrendingUp className="w-5 h-5 text-gold" />,
      sub: profile?.market_value_eur ? "Current estimate" : "Not set",
    },
    {
      label: "Profile Views",
      value: isPaidPlan ? "Coming soon" : "Upgrade",
      icon: <Eye className="w-5 h-5 text-white/40" />,
      sub: isPaidPlan ? "Last 30 days" : "Visible plan required",
      locked: !isPaidPlan,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wider">
            WELCOME BACK, {(profile?.full_name || dbUser.full_name).split(" ")[0].toUpperCase()}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {dbUser.current_plan_slug === "free"
              ? "You're on the free plan. Upgrade to get discovered."
              : `${planName} Plan · ${dbUser.subscription_status === "active" ? "Active" : "Inactive"}`}
          </p>
        </div>
        {dbUser.current_plan_slug === "free" && (
          <Link href="/pricing" className="btn-primary text-sm px-5 py-2.5">
            Upgrade Plan →
          </Link>
        )}
      </div>

      {/* Profile completeness */}
      {profile && (
        <ProfileCompleteness
          profile={profile}
          statsCount={stats.length}
          highlightsCount={highlights.length}
        />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <div className={`font-display text-2xl mb-1 ${card.locked ? "text-white/30" : "text-white"}`}>
              {card.value}
            </div>
            <div className="text-xs text-white/30">{card.sub}</div>
            {card.locked && (
              <Link href="/pricing" className="text-xs text-green hover:underline mt-2 block">
                Upgrade to see →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market value chart */}
        <div className="lg:col-span-2">
          {valuations.length > 0 ? (
            <MarketValueChart valuations={valuations} locked={false} />
          ) : (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg text-white mb-2 tracking-wider">MARKET VALUE</h3>
              <p className="text-sm text-white/40">
                Market value history will appear here once set by an admin or agent.
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="font-display text-lg text-white tracking-wider">QUICK ACTIONS</h3>
          <div className="space-y-2">
            <Link href="/dashboard/player/stats" className="glass-card-hover flex items-center gap-3 p-4">
              <BarChart3 className="w-5 h-5 text-green" />
              <div>
                <div className="text-sm text-white font-medium">Update Season Stats</div>
                <div className="text-xs text-white/40">{stats.length} season{stats.length !== 1 ? "s" : ""} added</div>
              </div>
            </Link>
            <Link href="/dashboard/player/highlights" className="glass-card-hover flex items-center gap-3 p-4">
              <Video className="w-5 h-5 text-gold" />
              <div>
                <div className="text-sm text-white font-medium">Manage Highlights</div>
                <div className="text-xs text-white/40">{highlights.length} video{highlights.length !== 1 ? "s" : ""} uploaded</div>
              </div>
            </Link>
            <Link href="/dashboard/player/messages" className="glass-card-hover flex items-center gap-3 p-4">
              <MessageSquare className="w-5 h-5 text-white/40" />
              <div>
                <div className="text-sm text-white font-medium">Messages</div>
                <div className="text-xs text-white/40">No new messages</div>
              </div>
            </Link>
            {profile?.id && (
              <Link href={`/players/${profile.id}`} className="glass-card-hover flex items-center gap-3 p-4">
                <Eye className="w-5 h-5 text-white/40" />
                <div>
                  <div className="text-sm text-white font-medium">View My Profile</div>
                  <div className="text-xs text-white/40">See how scouts see you</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-white tracking-wider">MY HIGHLIGHTS</h3>
          <Link href="/dashboard/player/highlights" className="text-sm text-green hover:text-green-dark transition-colors">
            Manage →
          </Link>
        </div>
        <HighlightGallery
          highlights={highlights}
          canUpload={dbUser.current_plan_slug !== "free"}
        />
      </div>
    </div>
  );
}
