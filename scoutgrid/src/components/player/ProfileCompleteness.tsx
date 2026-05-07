"use client";

import Link from "next/link";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import type { PlayerProfile } from "@/types";

interface ProfileCompletenessProps {
  profile: PlayerProfile;
  statsCount?: number;
  highlightsCount?: number;
}

export function ProfileCompleteness({ profile, statsCount = 0, highlightsCount = 0 }: ProfileCompletenessProps) {
  const items = [
    { key: "date_of_birth", label: "Date of birth", done: !!profile.date_of_birth, points: 8 },
    { key: "nationality", label: "Nationality", done: !!profile.nationality, points: 5 },
    { key: "height_cm", label: "Height & weight", done: !!profile.height_cm, points: 10 },
    { key: "preferred_foot", label: "Preferred foot", done: !!profile.preferred_foot, points: 5 },
    { key: "position", label: "Playing position", done: !!profile.position, points: 7 },
    { key: "bio", label: "Player bio (50+ chars)", done: !!(profile.bio && profile.bio.length >= 50), points: 5 },
    { key: "current_club", label: "Current club", done: !!profile.current_club, points: 10 },
    { key: "league", label: "Current league", done: !!profile.league, points: 10 },
    { key: "stats", label: "Season stats added", done: statsCount > 0, points: 15 },
    { key: "avatar_url", label: "Profile photo", done: !!profile.avatar_url, points: 10 },
    { key: "highlights", label: "At least 1 highlight", done: highlightsCount > 0, points: 5 },
  ];

  const totalPoints = items.reduce((s, i) => s + i.points, 0);
  const completedPoints = items.filter((i) => i.done).reduce((s, i) => s + i.points, 0);
  const pct = Math.round((completedPoints / totalPoints) * 100);

  const incomplete = items.filter((i) => !i.done);
  const nextSteps = incomplete.slice(0, 3);

  const strokeDasharray = 2 * Math.PI * 36;
  const strokeDashoffset = strokeDasharray * (1 - pct / 100);

  return (
    <div className="glass-card p-5">
      <h3 className="font-display text-lg text-white mb-4 tracking-wider">PROFILE STRENGTH</h3>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle
              cx="44"
              cy="44"
              r="36"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            <circle
              cx="44"
              cy="44"
              r="36"
              fill="none"
              stroke={pct >= 80 ? "#00FF87" : pct >= 50 ? "#F5A623" : "#ef4444"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl text-white">{pct}%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/70 mb-3">
            {pct >= 80 ? "Great profile! You're highly visible." :
             pct >= 50 ? "Good start. Add more details to boost visibility." :
             "Complete your profile to get discovered by scouts."}
          </p>

          {nextSteps.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Next steps</p>
              {nextSteps.map((item) => (
                <Link
                  key={item.key}
                  href="/dashboard/player/profile"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <Circle className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs text-white/30">+{item.points}pts</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}

          {pct === 100 && (
            <div className="flex items-center gap-2 text-green text-sm">
              <CheckCircle className="w-4 h-4" />
              Profile complete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
