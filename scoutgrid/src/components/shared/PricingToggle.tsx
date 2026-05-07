"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function PricingToggle() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="inline-flex items-center gap-4">
      <span className={cn("text-sm transition-colors", !annual ? "text-white" : "text-white/40")}>Monthly</span>
      <button
        onClick={() => setAnnual(!annual)}
        className={cn(
          "w-14 h-7 rounded-full transition-colors relative",
          annual ? "bg-green" : "bg-white/20"
        )}
      >
        <span className={cn(
          "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
          annual ? "translate-x-8" : "translate-x-1"
        )} />
      </button>
      <div className="flex items-center gap-2">
        <span className={cn("text-sm transition-colors", annual ? "text-white" : "text-white/40")}>Annual</span>
        {annual && (
          <span className="text-xs bg-green/20 text-green px-2 py-0.5 rounded-full font-medium">Save 20%</span>
        )}
      </div>
    </div>
  );
}
