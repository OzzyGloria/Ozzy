"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  slug: string;
  role_target: string;
  price_monthly: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

interface MembershipCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  billingPeriod: "monthly" | "annual";
  isAuthenticated?: boolean;
}

const PLAN_HIGHLIGHTS: Record<string, { color: string; badge?: string }> = {
  free: { color: "border-white/10" },
  visible: { color: "border-white/20" },
  pro_athlete: { color: "border-green/30", badge: "Most Popular" },
  scout_basic: { color: "border-white/20" },
  scout_pro: { color: "border-gold/40", badge: "Recommended" },
  club_elite: { color: "border-gold/60" },
};

export function MembershipCard({ plan, isCurrentPlan, billingPeriod, isAuthenticated }: MembershipCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const highlight = PLAN_HIGHLIGHTS[plan.slug] ?? { color: "border-white/10" };
  const price = billingPeriod === "annual" ? plan.price_monthly * 0.8 : plan.price_monthly;
  const isFree = plan.price_monthly === 0;

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push(`/register?plan=${plan.slug}`);
      return;
    }
    if (isFree) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: plan.slug, billing_period: billingPeriod }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === "object"
    ? Object.values(plan.features as Record<string, string>)
    : [];

  return (
    <div className={cn(
      "glass-card p-6 relative flex flex-col border",
      highlight.color,
      isCurrentPlan && "ring-2 ring-green/40"
    )}>
      {highlight.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-green text-navy text-xs font-bold px-3 py-1 rounded-full font-display tracking-wider">
            {highlight.badge.toUpperCase()}
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-display text-xl text-white tracking-wider mb-1">{plan.name.toUpperCase()}</h3>
        <p className="text-xs text-white/40 uppercase tracking-wider">{plan.role_target}</p>
      </div>

      <div className="mb-6">
        {isFree ? (
          <div className="font-display text-4xl text-white">FREE</div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="font-display text-4xl text-white">€{price.toFixed(2)}</span>
            <span className="text-white/40 text-sm mb-1">/mo</span>
          </div>
        )}
        {billingPeriod === "annual" && !isFree && (
          <p className="text-xs text-green mt-1">Save 20% with annual billing</p>
        )}
      </div>

      <ul className="space-y-2 flex-1 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <CheckCircle className="w-4 h-4 text-green flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={loading || isCurrentPlan}
        className={cn(
          "w-full py-3 rounded-xl font-display tracking-wider text-sm transition-all",
          isCurrentPlan
            ? "bg-white/5 text-white/40 cursor-not-allowed"
            : isFree
            ? "bg-white/10 text-white hover:bg-white/20"
            : plan.slug === "scout_pro" || plan.slug === "pro_athlete"
            ? "btn-primary"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
        )}
      >
        {loading ? "Redirecting..." : isCurrentPlan ? "Current Plan" : isFree ? "Get Started" : `Get ${plan.name}`}
      </button>
    </div>
  );
}
