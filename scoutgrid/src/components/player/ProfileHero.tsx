"use client";

import Image from "next/image";
import { MapPin, Calendar, Ruler, Weight, Footprints, Star, TrendingUp, Clock, Share2, Bookmark, MessageSquare } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { cn, formatCurrency, formatAge, getFlagEmoji, getPositionColor } from "@/lib/utils";
import type { PlayerProfile } from "@/types";

interface ProfileHeroProps {
  player: PlayerProfile;
  canContact?: boolean;
  canSave?: boolean;
}

export function ProfileHero({ player, canContact = false, canSave = false }: ProfileHeroProps) {
  const age = player.date_of_birth ? formatAge(player.date_of_birth) : null;
  const positionClass = getPositionColor(player.position || "");

  const availabilityConfig = {
    available: { label: "Available", className: "badge-available" },
    loan_only: { label: "Available on Loan", className: "badge-loan" },
    not_available: { label: "Not Available", className: "badge-unavailable" },
  };
  const avail = availabilityConfig[player.availability_status || "available"];

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
        {player.banner_url ? (
          <Image src={player.banner_url} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy/80" />
            {/* Decorative elements */}
            <div className="absolute top-8 right-16 w-32 h-32 bg-green/5 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-16 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/60" />
      </div>

      {/* Profile section (overlapping banner) */}
      <div className="px-4 md:px-8 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Avatar + name */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {player.avatar_url ? (
                <div className="relative w-24 h-24 md:w-32 md:h-32">
                  <Image
                    src={player.avatar_url}
                    alt={player.full_name}
                    fill
                    className="object-cover rounded-2xl ring-4 ring-navy"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 ring-4 ring-navy flex items-center justify-center text-4xl font-display text-white/50">
                  {player.full_name?.[0]}
                </div>
              )}
              {player.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-navy rounded-full p-0.5">
                  <VerifiedBadge size="md" />
                </div>
              )}
            </div>

            {/* Name + quick info */}
            <div className="pb-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-2xl md:text-3xl text-white">{player.full_name}</h1>
                <span className={cn("text-xs font-display tracking-widest px-2.5 py-1 rounded-lg border", positionClass)}>
                  {player.position}
                </span>
                {player.secondary_position && (
                  <span className="text-xs font-display tracking-widest px-2 py-0.5 rounded-lg border border-white/20 text-white/50">
                    {player.secondary_position}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60 flex-wrap">
                {player.nationality && (
                  <span className="flex items-center gap-1">
                    {getFlagEmoji(player.nationality)}
                    {player.nationality}
                  </span>
                )}
                {age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {age} years
                  </span>
                )}
                {player.current_club && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {player.current_club}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-2">
            <span className={avail.className}>{avail.label}</span>
            {canSave && (
              <button className="btn-outline flex items-center gap-2 text-sm px-4 py-2">
                <Bookmark className="w-4 h-4" />
                Save
              </button>
            )}
            {canContact && (
              <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                Contact
              </button>
            )}
            <button className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Attribute summary row */}
      <div className="px-4 md:px-8 mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {player.height_cm && (
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-white/40">
              <Ruler className="w-3 h-3" />
              <span className="text-xs">Height</span>
            </div>
            <div className="font-display text-base text-white">{player.height_cm}cm</div>
          </div>
        )}
        {player.weight_kg && (
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-white/40">
              <Weight className="w-3 h-3" />
              <span className="text-xs">Weight</span>
            </div>
            <div className="font-display text-base text-white">{player.weight_kg}kg</div>
          </div>
        )}
        {player.preferred_foot && (
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-white/40">
              <Footprints className="w-3 h-3" />
              <span className="text-xs">Foot</span>
            </div>
            <div className="font-display text-base text-white">{player.preferred_foot}</div>
          </div>
        )}
        {player.overall_rating && (
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-white/40">
              <Star className="w-3 h-3" />
              <span className="text-xs">Overall</span>
            </div>
            <div className="font-display text-base text-white">{player.overall_rating}</div>
          </div>
        )}
        {player.market_value_eur && (
          <div className="glass-card p-3 text-center col-span-1 sm:col-span-2">
            <div className="flex items-center justify-center gap-1 mb-1 text-white/40">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Market Value</span>
            </div>
            <div className="font-display text-base text-green">{formatCurrency(player.market_value_eur)}</div>
          </div>
        )}
        {player.contract_until && (
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-white/40">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Contract</span>
            </div>
            <div className="font-display text-base text-white">Until {player.contract_until}</div>
          </div>
        )}
      </div>
    </div>
  );
}
