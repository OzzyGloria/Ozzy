import { cn } from "@/lib/utils";

interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: "green" | "gold" | "white" | "red";
  size?: "sm" | "md";
}

export function StatBadge({ label, value, color = "white", size = "md" }: StatBadgeProps) {
  const colorClass = {
    green: "text-green",
    gold: "text-gold",
    white: "text-white",
    red: "text-red-400",
  }[color];

  return (
    <div className="text-center">
      <div className={cn("font-display tabular-nums", colorClass, size === "md" ? "text-2xl" : "text-lg")}>
        {value}
      </div>
      <div className="text-xs text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
