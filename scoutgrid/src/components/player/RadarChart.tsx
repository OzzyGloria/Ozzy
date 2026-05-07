"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PlayerStats } from "@/types";

interface RadarChartProps {
  stats: PlayerStats;
  position?: string;
}

function deriveAttributes(stats: PlayerStats, position?: string) {
  const isGK = position === "GK";
  const isDF = ["CB", "LB", "RB", "LWB", "RWB"].includes(position || "");
  const isCDM = position === "CDM";

  if (isGK) {
    return [
      { attribute: "Reflexes", value: Math.min(99, Math.round(stats.save_pct || 65)) },
      { attribute: "Shot Stopping", value: Math.min(99, Math.round((stats.saves_per_90 / 5) * 99)) },
      { attribute: "Distribution", value: Math.min(99, Math.round(stats.pass_accuracy_pct || 65)) },
      { attribute: "Aerial Ability", value: Math.min(99, Math.round(stats.aerial_duels_won_pct || 60)) },
      { attribute: "Clean Sheets", value: Math.min(99, Math.round((stats.clean_sheets / 20) * 99)) },
      { attribute: "xG Prevention", value: Math.min(99, Math.round(50 + (stats.xg_prevented || 0) * 5)) },
    ];
  }

  return [
    {
      attribute: "Pace",
      value: Math.min(99, Math.round(
        isDF ? 65 + (stats.pressures_per_90 || 10) * 1.5 :
        60 + (stats.dribbles_per_90 || 2) * 8
      )),
    },
    {
      attribute: "Shooting",
      value: Math.min(99, Math.round(
        isDF || isCDM ? 40 + (stats.goals || 0) * 5 :
        50 + (stats.shot_accuracy_pct || 40) * 0.6 + (stats.xg_per_90 || 0) * 30
      )),
    },
    {
      attribute: "Passing",
      value: Math.min(99, Math.round(
        (stats.pass_accuracy_pct || 75) * 0.8 + (stats.key_passes_per_90 || 1) * 5
      )),
    },
    {
      attribute: "Dribbling",
      value: Math.min(99, Math.round(
        50 + (stats.dribble_success_pct || 50) * 0.5 + (stats.dribbles_per_90 || 2) * 4
      )),
    },
    {
      attribute: "Defending",
      value: Math.min(99, Math.round(
        isDF ? 60 + (stats.tackles_per_90 || 2) * 6 + (stats.interceptions_per_90 || 1) * 5 :
        isCDM ? 55 + (stats.tackles_per_90 || 2) * 6 :
        30 + (stats.tackles_per_90 || 1) * 4
      )),
    },
    {
      attribute: "Physical",
      value: Math.min(99, Math.round(
        55 + (stats.aerial_duels_won_pct || 50) * 0.5 + (stats.pressures_per_90 || 10) * 0.8
      )),
    },
  ];
}

export function PlayerRadarChart({ stats, position }: RadarChartProps) {
  const data = deriveAttributes(stats, position);

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-lg text-white mb-4 tracking-wider">ATTRIBUTE PROFILE</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="attribute"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "DM Sans" }}
          />
          <Radar
            name="Player"
            dataKey="value"
            stroke="#00FF87"
            fill="#00FF87"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ fill: "#00FF87", r: 3 }}
          />
          <Tooltip
            contentStyle={{
              background: "#0D1426",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(val: number) => [`${val}`, "Rating"]}
          />
        </RechartsRadar>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.attribute} className="text-center">
            <div className="font-display text-base text-white">{item.value}</div>
            <div className="text-xs text-white/40">{item.attribute}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
