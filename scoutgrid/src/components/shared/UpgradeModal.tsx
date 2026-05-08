"use client";

import Link from "next/link";
import { X, Lock, Star, CheckCircle } from "lucide-react";

interface UpgradeModalProps {
  onClose: () => void;
  feature?: string;
  requiredPlan?: string;
}

const PLAN_FEATURES: Record<string, { name: string; features: string[]; price: string }> = {
  scout_pro: {
    name: "Scout Pro",
    price: "£129.99/mo",
    features: [
      "Unlimited player profiles",
      "Advanced filters & metrics",
      "Market value history",
      "PDF scouting reports",
      "Direct messaging",
      "Export data",
    ],
  },
  pro_athlete: {
    name: "Pro Athlete",
    price: "£24.99/mo",
    features: [
      "Searchable profile",
      "10 highlight videos",
      "Priority placement",
      "Full analytics",
      "Unlimited messages",
      "Scouting reports visible",
    ],
  },
};

export function UpgradeModal({ onClose, feature, requiredPlan = "scout_pro" }: UpgradeModalProps) {
  const plan = PLAN_FEATURES[requiredPlan] || PLAN_FEATURES.scout_pro;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-2xl text-white mb-2">UPGRADE REQUIRED</h2>
          {feature && (
            <p className="text-white/50 text-sm">
              <strong className="text-white">{feature}</strong> is available on {plan.name} and above.
            </p>
          )}
        </div>

        <div className="glass-card p-5 mb-6 border border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg text-white">{plan.name}</div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-gold fill-current" />
              <span className="text-gold font-display">{plan.price}</span>
            </div>
          </div>
          <ul className="space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle className="w-4 h-4 text-green flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href={`/pricing?plan=${requiredPlan}`}
            onClick={onClose}
            className="btn-primary w-full block text-center"
          >
            UPGRADE TO {plan.name.toUpperCase()} →
          </Link>
          <button
            onClick={onClose}
            className="w-full text-sm text-white/40 hover:text-white transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
