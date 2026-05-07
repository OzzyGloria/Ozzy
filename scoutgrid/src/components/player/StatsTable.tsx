"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerStats } from "@/types";

interface StatsTableProps {
  stats: PlayerStats[];
  position?: string;
}

type SortKey = keyof PlayerStats;

const BASE_COLUMNS = [
  { key: "season", label: "Season", sortable: false },
  { key: "club", label: "Club", sortable: false },
  { key: "competition", label: "Competition", sortable: false },
  { key: "appearances", label: "Apps", sortable: true },
  { key: "starts", label: "Starts", sortable: true },
  { key: "minutes_played", label: "Mins", sortable: true },
  { key: "goals", label: "Goals", sortable: true },
  { key: "assists", label: "Assists", sortable: true },
  { key: "rating", label: "Rating", sortable: true },
];

const GK_COLUMNS = [
  { key: "season", label: "Season", sortable: false },
  { key: "club", label: "Club", sortable: false },
  { key: "appearances", label: "Apps", sortable: true },
  { key: "minutes_played", label: "Mins", sortable: true },
  { key: "saves_per_90", label: "Saves/90", sortable: true },
  { key: "save_pct", label: "Save%", sortable: true },
  { key: "clean_sheets", label: "Clean Sheets", sortable: true },
  { key: "goals_against_per_90", label: "GA/90", sortable: true },
  { key: "rating", label: "Rating", sortable: true },
];

export function StatsTable({ stats, position }: StatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("season");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"summary" | "attacking" | "defending" | "passing">("summary");

  const isGK = position === "GK";
  const columns = isGK ? GK_COLUMNS : BASE_COLUMNS;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc"
      ? Number(aVal) - Number(bVal)
      : Number(bVal) - Number(aVal);
  });

  const ADVANCED_TABS = [
    {
      id: "attacking",
      label: "Attacking",
      cols: [
        { key: "shots_per_90", label: "Shots/90" },
        { key: "shot_accuracy_pct", label: "Shot Acc%" },
        { key: "xg_per_90", label: "xG/90" },
        { key: "dribbles_per_90", label: "Dribbles/90" },
        { key: "dribble_success_pct", label: "Dribble Succ%" },
        { key: "touches_per_90", label: "Touches/90" },
      ],
    },
    {
      id: "passing",
      label: "Passing",
      cols: [
        { key: "pass_accuracy_pct", label: "Pass Acc%" },
        { key: "key_passes_per_90", label: "KP/90" },
        { key: "xa_per_90", label: "xA/90" },
        { key: "progressive_passes_per_90", label: "Prog Pass/90" },
        { key: "crosses_per_90", label: "Crosses/90" },
        { key: "cross_accuracy_pct", label: "Cross Acc%" },
      ],
    },
    {
      id: "defending",
      label: "Defending",
      cols: [
        { key: "tackles_per_90", label: "Tackles/90" },
        { key: "tackle_success_pct", label: "Tackle Succ%" },
        { key: "interceptions_per_90", label: "Interceptions/90" },
        { key: "clearances_per_90", label: "Clearances/90" },
        { key: "aerial_duels_won_pct", label: "Aerial Won%" },
        { key: "pressures_per_90", label: "Pressures/90" },
      ],
    },
  ];

  const activeAdvanced = ADVANCED_TABS.find((t) => t.id === activeTab);

  const formatVal = (val: unknown): string => {
    if (val === null || val === undefined || val === "") return "—";
    if (typeof val === "number") return Number.isInteger(val) ? String(val) : val.toFixed(2);
    return String(val);
  };

  return (
    <div className="space-y-4">
      {!isGK && (
        <div className="flex gap-2 flex-wrap">
          {["summary", "attacking", "passing", "defending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-colors",
                activeTab === tab
                  ? "bg-green/10 text-green border border-green/30"
                  : "text-white/50 border border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {(activeTab === "summary" || isGK ? columns : [
                  { key: "season", label: "Season", sortable: false },
                  { key: "club", label: "Club", sortable: false },
                  ...(activeAdvanced?.cols.map((c) => ({ ...c, sortable: true })) || [])
                ]).map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key as SortKey)}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-display tracking-wider text-white/40 uppercase whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-white transition-colors select-none"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStats.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-white/30 text-sm">
                    No stats available
                  </td>
                </tr>
              ) : (
                sortedStats.map((row, i) => (
                  <tr key={row.id} className={cn("border-b border-white/5 hover:bg-white/2 transition-colors", i % 2 === 1 && "bg-white/[0.01]")}>
                    {(activeTab === "summary" || isGK ? columns : [
                      { key: "season" }, { key: "club" },
                      ...(activeAdvanced?.cols || [])
                    ]).map((col) => {
                      const val = row[col.key as keyof PlayerStats];
                      const isRating = col.key === "rating";
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3 text-sm whitespace-nowrap",
                            col.key === "season" ? "text-white font-medium" : "text-white/70",
                            isRating && typeof val === "number" && val >= 7.5 && "text-green font-medium",
                            isRating && typeof val === "number" && val < 6.5 && "text-red-400"
                          )}
                        >
                          {formatVal(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
