import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileText, TrendingUp, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type PlayerRow = Database["public"]["Tables"]["player_profiles"]["Row"];
type CoachRow = Database["public"]["Tables"]["coach_profiles"]["Row"];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!dbUser || (dbUser as UserRow).role !== "admin") redirect("/dashboard");

  const [usersResult, unverifiedPlayers, unverifiedCoaches, reportsResult] = await Promise.all([
    supabase.from("users").select("id, full_name, role, current_plan_slug, subscription_status, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("player_profiles").select("id, full_name, user_id, position, current_club, is_visible").eq("is_verified", false).eq("is_visible", true).limit(10),
    supabase.from("coach_profiles").select("id, full_name, user_id, current_club, current_role").eq("is_verified", false).eq("is_visible", true).limit(10),
    supabase.from("scouting_reports").select("id", { count: "exact", head: true }),
  ]);

  const users = (usersResult.data ?? []) as Pick<UserRow, "id" | "full_name" | "role" | "current_plan_slug" | "subscription_status" | "created_at">[];
  const players = (unverifiedPlayers.data ?? []) as Pick<PlayerRow, "id" | "full_name" | "user_id" | "position" | "current_club" | "is_visible">[];
  const coaches = (unverifiedCoaches.data ?? []) as Pick<CoachRow, "id" | "full_name" | "user_id" | "current_club" | "current_role">[];

  const activeSubs = users.filter((u) => u.subscription_status === "active").length;

  return (
    <div className="min-h-screen bg-navy pt-20 pb-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-white tracking-wider">ADMIN PANEL</h1>
          <p className="text-white/40 text-sm mt-1">Platform management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: <Users className="w-5 h-5 text-green" /> },
            { label: "Active Subscriptions", value: activeSubs, icon: <TrendingUp className="w-5 h-5 text-gold" /> },
            { label: "Scouting Reports", value: reportsResult.count ?? 0, icon: <FileText className="w-5 h-5 text-white/60" /> },
            { label: "Pending Verification", value: players.length + coaches.length, icon: <CheckCircle className="w-5 h-5 text-gold" /> },
          ].map((card) => (
            <div key={card.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">{card.label}</span>
                {card.icon}
              </div>
              <div className="font-display text-3xl text-white">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending verification */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg text-white tracking-wider mb-4">PENDING VERIFICATION</h2>
            {players.length === 0 && coaches.length === 0 ? (
              <p className="text-white/30 text-sm">No pending verifications.</p>
            ) : (
              <div className="space-y-3">
                {[
                  ...players.map((p) => ({ id: p.id, full_name: p.full_name, user_id: p.user_id, subtitle: `${p.position ?? "—"} · ${p.current_club ?? "—"}`, type: "player" as const })),
                  ...coaches.map((c) => ({ id: c.id, full_name: c.full_name, user_id: c.user_id, subtitle: `${c.current_role ?? "—"} · ${c.current_club ?? "—"}`, type: "coach" as const })),
                ].map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${profile.type === "player" ? "players" : "coaches"}/${profile.id}`}
                        className="text-white text-sm hover:text-green transition-colors truncate block"
                      >
                        {profile.full_name}
                      </Link>
                      <p className="text-white/40 text-xs truncate">
                        {profile.type.toUpperCase()} · {profile.subtitle}
                      </p>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await fetch("/api/admin/verify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ user_id: profile.user_id, profile_type: profile.type }),
                        });
                        window.location.reload();
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-green border border-green/30 px-3 py-1.5 rounded hover:bg-green/10 transition-colors flex-shrink-0"
                      >
                        Verify
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent users */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg text-white tracking-wider mb-4">RECENT USERS</h2>
            <div className="space-y-3">
              {users.slice(0, 10).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{u.full_name || "—"}</p>
                    <p className="text-white/40 text-xs">{u.role} · {u.current_plan_slug}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    u.subscription_status === "active"
                      ? "bg-green/10 text-green"
                      : "bg-white/5 text-white/30"
                  }`}>
                    {u.subscription_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
