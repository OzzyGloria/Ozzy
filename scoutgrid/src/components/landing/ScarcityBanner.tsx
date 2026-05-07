"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Zap } from "lucide-react";

const MAX_SPOTS = 200;

export function ScarcityBanner() {
  const [spotsLeft, setSpotsLeft] = useState(47);

  // Simulate live counter decreasing
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft((prev) => Math.max(prev - 1, 12));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.round(((MAX_SPOTS - spotsLeft) / MAX_SPOTS) * 100);

  return (
    <div className="bg-navy border-y border-gold/20 py-4">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-gold flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">
                Founding Member Pricing — Only <span className="text-gold font-display">{spotsLeft}</span> spots left
              </p>
              <p className="text-white/40 text-xs">
                Scout Pro at €129.99/mo (normally €199.99). Lock in founding rate forever.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green to-gold rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-white/40 text-xs">{pct}% full</span>
            </div>
            <Link href="/pricing" className="btn-primary text-xs px-4 py-2 flex-shrink-0">
              Claim Spot →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
