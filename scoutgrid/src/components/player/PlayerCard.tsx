"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, TrendingUp, Clock, Eye } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { cn, formatCurrency, getPositionColor, getFlagEmoji, formatAge } from "@/lib/utils";
import type { PlayerProfile } from "@/types";

interface PlayerCardProps {
  player: PlayerProfile & {
    player_stats?: Array<{
      season: string;
      goals: number;
      assists: number;
      appearances: number;
      rating: number | null;
    }>;
  };
  variant?: "grid" | "list";
  locked?: boolean;
}

export function PlayerCard({ player, variant = "grid", locked = false }: PlayerCardProps) {
  const latestStats = player.player_stats?.[0];
  const age = player.date_of_birth ? formatAge(player.date_of_birth) : null;
  const positionClass = getPositionColor(player.position || "");

  const availabilityConfig = {
    available: { label: "Available", className: "badge-available" },
    loan_only: { label: "Loan", className: "badge-loan" },
    not_available: { label: "Contracted", className: "badge-unavailable" },
  };
  const avail = availabilityConfig[player.availability_status || "available"];

  if (variant === "list") {
    return (
      <Link
        href={locked ? "/pricing" : `/players/${player.id}`}
        className={cn(
          "glass-card-hover flex items-center gap-4 p-4",
          locked && "cursor-default"
        )}
      >
        {/* Avatar */}
        <div className="relative w-14 h-14 flex-shrink-0">
          {player.avatar_url ? (
            <Image
              src={player.avatar_url}
              alt={player.full_name}
              fill
              className="object-cover rounded-xl"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl font-display text-white/50">
              {player.full_name?.[0]}
            </div>
          )}
          {player.is_verified && (
            <div className="absolute -top-1 -right-1">
              <VerifiedBadge size="sm" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display text-base text-white truncate">{player.full_name}</span>
            {locked && <span className="tag text-xs">Premium</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span className="flex items-center gap-1">
              {player.nationality && getFlagEmoji(player.nationality)}
              {player.nationality}
            </span>
            {age && <span>• {age}y</span>}
            {player.current_club && <span className="truncate">• {player.current_club}</span>}
          </div>
        </div>

        {/* Position + availability */}
        <div className="hidden sm:flex flex-col items-end gap-1.5">
          <span className={cn("text-xs font-display tracking-widest px-2 py-0.5 rounded border", positionClass)}>
            {player.position || "—"}
          </span>
          <span className={avail.className}>{avail.label}</span>
        </div>

        {/* Stats */}
        {latestStats && (
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-white font-display text-base">{latestStats.goals}</div>
              <div className="text-white/30 text-xs">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-white font-display text-base">{latestStats.assists}</div>
              <div className="text-white/30 text-xs">Assists</div>
            </div>
            <div className="text-center">
              <div className="text-white font-display text-base">{latestStats.appearances}</div>
              <div className="text-white/30 text-xs">Apps</div>
            </div>
          </div>
        )}

        {/* Market value */}
        {player.market_value_eur && (
          <div className="hidden lg:block text-right">
            <div className="text-green font-display text-sm">{formatCurrency(player.market_value_eur)}</div>
            <div className="text-white/30 text-xs">Market Value</div>
          </div>
        )}
      </Link>
    );
  }

  // Grid variant
  return (
    <Link
      href={locked ? "/pricing" : `/players/${player.id}`}
      className={cn("glass-card-hover block group", locked && "cursor-default")}
    >
      {/* Header with gradient background */}
      <div className="relative p-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            {player.avatar_url ? (
              <div className="relative w-16 h-16">
                <Image
                  src={player.avatar_url}
                  alt={player.full_name}
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-display text-white/50">
                {player.full_name?.[0]}
              </div>
            )}
            {player.is_verified && (
              <div className="absolute -bottom-1 -right-1">
                <VerifiedBadge size="sm" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={cn("text-xs font-display tracking-widest px-2.5 py-1 rounded-lg border", positionClass)}>
              {player.position || "—"}
            </span>
            <span className={avail.className}>{avail.label}</span>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="font-display text-lg text-white leading-tight mb-1 group-hover:text-green transition-colors">
            {player.full_name}
            {locked && <span className="tag text-xs ml-2">Premium</span>}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/50">
            {player.nationality && (
              <span className="flex items-center gap-1">
                {getFlagEmoji(player.nationality)}
                {player.nationality}
              </span>
            )}
            {age && <span>• {age}</span>}
          </div>
          {player.current_club && (
            <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
              <MapPin className="w-3 h-3" />
              {player.current_club}
              {player.league && ` • ${player.league}`}
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      {latestStats ? (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="stat-badge bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-green font-display text-lg">{latestStats.goals}</div>
              <div className="text-white/30 text-xs">Goals</div>
            </div>
            <div className="stat-badge bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-white font-display text-lg">{latestStats.assists}</div>
              <div className="text-white/30 text-xs">Assists</div>
            </div>
            <div className="stat-badge bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-white font-display text-lg">{latestStats.appearances}</div>
              <div className="text-white/30 text-xs">Apps</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-4 text-xs text-white/30 py-2">No stats yet</div>
      )}

      {/* Footer */}
      <div className="px-5 pb-5 border-t border-white/5 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {latestStats?.rating && (
            <>
              <Star className="w-3 h-3 text-gold" />
              <span className="text-sm font-display text-white">{latestStats.rating.toFixed(1)}</span>
            </>
          )}
        </div>
        {player.market_value_eur ? (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-green" />
            <span className="text-sm font-display text-green">{formatCurrency(player.market_value_eur)}</span>
          </div>
        ) : (
          player.contract_until && (
            <div className="flex items-center gap-1 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              Contract until {player.contract_until}
            </div>
          )
        )}
      </div>
    </Link>
  );
}
