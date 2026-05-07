"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  glow?: "green" | "gold" | null;
}

export function GlassCard({ children, className, hover = false, onClick, glow }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card",
        hover && "glass-card-hover cursor-pointer",
        glow === "green" && "glow-green",
        glow === "gold" && "glow-gold",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
