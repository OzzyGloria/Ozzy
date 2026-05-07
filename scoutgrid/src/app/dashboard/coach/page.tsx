import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BarChart3, Users, MessageSquare, Eye, Video, TrendingUp } from "lucide-react";

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!dbUser) redirect("/login");
  if (dbUser.role === "player") redirect("/dashboard/player");
  if (["scout", "agent", "club"].includes(dbUser.role)) redirect("/dashboard/scout");

  const { data: profile } = await supabase
    .from("coach_profiles")
    .select("*, coach_stats(*)")
    .eq("user_id", user.id)
    .single();

  const stats = (profile?.coach_stats as Array<{ wins: number; draws: number; losses: number; matches_managed: number }> | null) ?? [];
  const totalMatches = stats.reduce((s, r) => s + (r.matches_managed || 0), 0);
  const totalWins = stats.reduce((s, r) => s + (r.wins || 0), 0);
  const winPct = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wider">
            COACH DASHBOARD
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {dbUser.full_name} · Coach
          </p>
        </div>
        {profile?.id && (
          <Link href={`/coaches/${profile.id}`} className="btn-primary text-sm px-5 py-2.5">
            View Profile →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Career Matches", value: totalMatches, icon: <BarChart3 className="w-5 h-5 text-gold" /> },
          { label: "Career Wins", value: totalWins, icon: <TrendingUp className="w-5 h-5 text-green" /> },
          { label: "Win Rate", value: `${winPct}%`, icon: <Users className="w-5 h-5 text-white/60" /> },
          { label: "Profile Views", value: "—", icon: <Eye className="w-5 h-5 text-white/40" /> },
        ].map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <div className="font-display text-2xl text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/coach/career" className="glass-card-hover flex items-center gap-3 p-4">
          <BarChart3 className="w-5 h-5 text-gold" />
          <div>
            <div className="text-sm text-white font-medium">Update Career History</div>
            <div className="text-xs text-white/40">{stats.length} roles recorded</div>
          </div>
        </Link>
        <Link href="/dashboard/coach/highlights" className="glass-card-hover flex items-center gap-3 p-4">
          <Video className="w-5 h-5 text-green" />
          <div>
            <div className="text-sm text-white font-medium">Manage Highlights</div>
            <div className="text-xs text-white/40">Showcase your work</div>
          </div>
        </Link>
        <Link href="/dashboard/coach/messages" className="glass-card-hover flex items-center gap-3 p-4">
          <MessageSquare className="w-5 h-5 text-white/40" />
          <div>
            <div className="text-sm text-white font-medium">Messages</div>
            <div className="text-xs text-white/40">No new messages</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
