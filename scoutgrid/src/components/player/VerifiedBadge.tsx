import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({ size = "md", className }: VerifiedBadgeProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <span
      title="Verified Profile"
      className={cn("inline-flex items-center justify-center text-green", className)}
    >
      <BadgeCheck className={sizes[size]} fill="currentColor" />
    </span>
  );
}
