import { createClient } from "@/lib/supabase/server";
import { MembershipCard } from "@/components/shared/MembershipCard";
import { PricingToggle } from "@/components/shared/PricingToggle";
import { CheckCircle, Shield, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import type { Database } from "@/types/database";

type PlanRow = Database["public"]["Tables"]["membership_plans"]["Row"];

export const metadata: Metadata = {
  title: "Pricing | ScoutGrid",
  description: "Choose the plan that fits your football ambitions. From free discovery to elite scouting.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentPlanSlug = "free";
  if (user) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("current_plan_slug")
      .eq("id", user.id)
      .single();
    if (dbUser) currentPlanSlug = (dbUser as { current_plan_slug: string }).current_plan_slug;
  }

  const { data: plansData } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const plans = (plansData ?? []) as PlanRow[];
  const playerPlans = plans.filter((p) => ["player", "both"].includes(p.role_target));
  const scoutPlans = plans.filter((p) => ["scout", "both"].includes(p.role_target));

  const planForCard = (p: PlanRow) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    role_target: p.role_target,
    price_monthly: p.price_monthly,
    features: Array.isArray(p.features) ? p.features as string[] : Object.values(p.features as Record<string, string>),
    is_active: p.is_active,
    sort_order: p.sort_order,
  });

  return (
    <div className="min-h-screen bg-navy py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-green font-display tracking-widest text-sm mb-4">TRANSPARENT PRICING</p>
          <h1 className="font-display text-5xl sm:text-6xl text-white mb-6 tracking-wider">
            YOUR NEXT MOVE<br />STARTS HERE
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Whether you're a player seeking discovery or a scout building the next great team,
            ScoutGrid has a plan that fits.
          </p>
          <div className="mt-8">
            <PricingToggle />
          </div>
        </div>

        {playerPlans.length > 0 && (
          <div className="mb-20">
            <h2 className="font-display text-2xl text-white tracking-wider mb-2">FOR PLAYERS</h2>
            <p className="text-white/40 text-sm mb-8">Get discovered by scouts and clubs worldwide</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerPlans.map((plan) => (
                <MembershipCard
                  key={plan.id}
                  plan={planForCard(plan)}
                  isCurrentPlan={plan.slug === currentPlanSlug}
                  billingPeriod="monthly"
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          </div>
        )}

        {scoutPlans.length > 0 && (
          <div className="mb-20">
            <h2 className="font-display text-2xl text-white tracking-wider mb-2">FOR SCOUTS & CLUBS</h2>
            <p className="text-white/40 text-sm mb-8">Access the complete database and build your shortlist</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scoutPlans.map((plan) => (
                <MembershipCard
                  key={plan.id}
                  plan={planForCard(plan)}
                  isCurrentPlan={plan.slug === currentPlanSlug}
                  billingPeriod="monthly"
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          </div>
        )}

        {/* Risk reversal */}
        <div className="glass-card p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <h3 className="font-display text-3xl text-white mb-4 tracking-wider">ZERO RISK GUARANTEE</h3>
          <p className="text-white/60 mb-8">
            We're confident ScoutGrid will change your football career. If you're not satisfied,
            we'll refund you completely — no questions asked.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <RefreshCw className="w-6 h-6 text-green" />, title: "14-Day Money Back", desc: "Full refund within 14 days, no questions" },
              { icon: <Shield className="w-6 h-6 text-gold" />, title: "Cancel Anytime", desc: "No lock-ins, cancel with one click" },
              { icon: <CheckCircle className="w-6 h-6 text-green" />, title: "Scout View Promise", desc: "No views in 30 days → free month" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-white/40 text-xs text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="font-display text-2xl text-white tracking-wider mb-8 text-center">COMMON QUESTIONS</h3>
          <div className="space-y-4">
            {[
              { q: "Can I switch plans?", a: "Yes. Upgrade or downgrade anytime. Upgrades take effect immediately; downgrades at the end of your billing period." },
              { q: "Is my payment information secure?", a: "All payments are processed by Stripe, the world's leading payment infrastructure. We never store your card details." },
              { q: "What counts as a 'scout view'?", a: "Any verified Scout or Club account viewing your player profile counts as a scout view." },
              { q: "Do scouts pay per player profile?", a: "No. Scout plans give unlimited access to the player database with no per-profile charges." },
            ].map(({ q, a }) => (
              <div key={q} className="glass-card p-5">
                <p className="font-medium text-white mb-2">{q}</p>
                <p className="text-white/50 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
