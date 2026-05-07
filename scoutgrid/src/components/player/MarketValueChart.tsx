"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Lock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { MarketValuation } from "@/types";

interface MarketValueChartProps {
  valuations: MarketValuation[];
  locked?: boolean;
}

export function MarketValueChart({ valuations, locked = false }: MarketValueChartProps) {
  const sorted = [...valuations].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const first = sorted[0]?.value_eur || 0;
  const last = sorted[sorted.length - 1]?.value_eur || 0;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = change >= 0;

  const chartData = sorted.map((v) => ({
    date: formatDate(v.recorded_at, { month: "short", year: "2-digit" }),
    value: v.value_eur,
    label: formatCurrency(v.value_eur),
  }));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-white tracking-wider">MARKET VALUE</h3>
        <div className="flex items-center gap-2">
          {!locked && (
            <div className={`flex items-center gap-1 text-sm font-display ${isUp ? "text-green" : "text-red-400"}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
          <div className="text-xl font-display text-white">
            {locked ? "—" : formatCurrency(last)}
          </div>
        </div>
      </div>

      {locked ? (
        <div className="relative h-48 flex flex-col items-center justify-center gap-3">
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-50" style={{ filter: "blur(4px)" }} />
          </div>
          <Lock className="w-8 h-8 text-white/30" />
          <p className="text-sm text-white/40 text-center">
            Market value history available on<br />
            <span className="text-gold">Scout Pro</span> and above
          </p>
          <a href="/pricing" className="btn-secondary text-xs px-4 py-1.5">
            Upgrade Plan
          </a>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "#0D1426",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(val: number) => [formatCurrency(val), "Market Value"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00FF87"
              strokeWidth={2}
              fill="url(#valueGradient)"
              dot={{ fill: "#00FF87", r: 3 }}
              activeDot={{ r: 5, fill: "#00FF87" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
