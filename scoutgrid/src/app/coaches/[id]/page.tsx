import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifiedBadge } from "@/components/player/VerifiedBadge";
import { formatAge } from "@/lib/utils";
import { Trophy, Users, Star, MapPin, Globe, Flag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase.from("coach_profiles").select("full_name, current_club").eq("id", params.id).single();
  if (!data) return { title: "Coach Not Found | ScoutGrid" };
  return {
    title: `${data.full_name} | ScoutGrid`,
    description: `${data.full_name} coaching profile on ScoutGrid. ${data.current_club ? `Currently at ${data.current_club}.` : ""}`,
  };
}

export default async function CoachProfilePage({ params }: Props) {
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from("coach_profiles")
    .select("*, coach_stats(*)")
    .eq("id", params.id)
    .eq("is_visible", true)
    .single();

  if (!coach) notFound();

  const careerStats = (coach.coach_stats as Array<{
    club: string;
    role: string;
    season_start: number;
    season_end: number | null;
    matches_managed: number;
    wins: number;
    draws: number;
    losses: number;
    trophies: string[];
  }> | null) ?? [];

  const totalMatches = careerStats.reduce((s, r) => s + (r.matches_managed || 0), 0);
  const totalWins = careerStats.reduce((s, r) => s + (r.wins || 0), 0);
  const winPct = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="min-h-screen bg-navy py-8">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="glass-card p-8 mb-6 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {coach.avatar_url ? (
              <img src={coach.avatar_url} alt={coach.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-white/60">{coach.full_name.charAt(0)}</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-white tracking-wider">{coach.full_name.toUpperCase()}</h1>
              {coach.is_verified && <VerifiedBadge size="md" />}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-4">
              {coach.current_role && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />{coach.current_role}
                </span>
              )}
              {coach.current_club && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />{coach.current_club}
                </span>
              )}
              {coach.nationality && (
                <span className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />{coach.nationality}
                </span>
              )}
              {coach.date_of_birth && (
                <span>{formatAge(coach.date_of_birth)} years old</span>
              )}
            </div>

            {coach.bio && (
              <p className="text-white/60 text-sm leading-relaxed">{coach.bio}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Career stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-display text-xl text-white tracking-wider mb-4">CAREER RECORD</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-display text-3xl text-white">{totalMatches}</div>
                  <div className="text-xs text-white/40 mt-1">Matches</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl text-green">{totalWins}</div>
                  <div className="text-xs text-white/40 mt-1">Wins</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl text-gold">{winPct}%</div>
                  <div className="text-xs text-white/40 mt-1">Win Rate</div>
                </div>
              </div>

              {careerStats.length > 0 && (
                <div className="space-y-3">
                  {careerStats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-t border-white/5">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{stat.club}</p>
                        <p className="text-white/40 text-xs">
                          {stat.role} · {stat.season_start}
                          {stat.season_end ? ` – ${stat.season_end}` : " – Present"}
                        </p>
                      </div>
                      <div className="text-right text-sm text-white/60">
                        <span className="text-green">{stat.wins}</span>
                        <span className="text-white/30 mx-1">/</span>
                        <span>{stat.draws}</span>
                        <span className="text-white/30 mx-1">/</span>
                        <span className="text-red-400">{stat.losses}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile details */}
          <div className="space-y-4">
            {coach.preferred_formation && (
              <div className="glass-card p-5">
                <h3 className="font-display text-sm text-white/60 tracking-wider mb-3">PREFERRED SYSTEM</h3>
                <p className="font-display text-2xl text-white">{coach.preferred_formation}</p>
              </div>
            )}

            {(coach.licenses as string[] | null)?.length ? (
              <div className="glass-card p-5">
                <h3 className="font-display text-sm text-white/60 tracking-wider mb-3">LICENSES</h3>
                <div className="flex flex-wrap gap-2">
                  {(coach.licenses as string[]).map((l) => (
                    <span key={l} className="text-xs border border-gold/40 text-gold px-2 py-1 rounded">{l}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {(coach.languages as string[] | null)?.length ? (
              <div className="glass-card p-5">
                <h3 className="font-display text-sm text-white/60 tracking-wider mb-3">LANGUAGES</h3>
                <div className="flex flex-wrap gap-2">
                  {(coach.languages as string[]).map((l) => (
                    <span key={l} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded">{l}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
