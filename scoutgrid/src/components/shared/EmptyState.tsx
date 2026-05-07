import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-8 text-center", className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/30">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display text-white/60 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/40 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
