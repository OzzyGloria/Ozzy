"use client";

import Link from "next/link";
import { Trash2, Bell, BellOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, string>;
  alert_enabled: boolean;
  created_at: string;
}

interface SavedSearchCardProps {
  search: SavedSearch;
  onDelete: (id: string) => void;
}

export function SavedSearchCard({ search, onDelete }: SavedSearchCardProps) {
  const filterEntries = Object.entries(search.filters).filter(([k]) => k !== "sort_by");
  const searchUrl = `/search?${new URLSearchParams(search.filters).toString()}`;

  return (
    <div className="glass-card p-4 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Link href={searchUrl} className="font-medium text-white hover:text-green transition-colors truncate">
            {search.name}
          </Link>
          {search.alert_enabled && (
            <Bell className="w-3.5 h-3.5 text-gold flex-shrink-0" />
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {filterEntries.slice(0, 4).map(([key, value]) => (
            <span key={key} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">
              {key.replace("_", " ")}: {value}
            </span>
          ))}
          {filterEntries.length > 4 && (
            <span className="text-xs text-white/30">+{filterEntries.length - 4} more</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={searchUrl}
          className="p-1.5 text-white/40 hover:text-white transition-colors rounded"
          title="Open search"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onDelete(search.id)}
          className="p-1.5 text-white/40 hover:text-red-400 transition-colors rounded"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
