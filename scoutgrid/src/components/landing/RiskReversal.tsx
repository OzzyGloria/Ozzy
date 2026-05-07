import { RefreshCw, Eye, Shield, Zap } from "lucide-react";
import Link from "next/link";

export function RiskReversal() {
  return (
    <section className="py-24 bg-navy">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-16 border border-green/20 max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-green/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green" />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wider mb-4">
            WE TAKE THE RISK
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
            Join ScoutGrid with complete confidence. If it doesn't deliver, we don't want your money.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-green" />
              </div>
              <h3 className="font-display text-white tracking-wider mb-2">14-DAY REFUND</h3>
              <p className="text-white/40 text-sm">
                Not happy in the first 14 days? Full refund. No forms, no waiting.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-white tracking-wider mb-2">SCOUT VIEW PROMISE</h3>
              <p className="text-white/40 text-sm">
                No verified scout views in 30 days? We'll give you a free month — automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green" />
              </div>
              <h3 className="font-display text-white tracking-wider mb-2">CANCEL ANYTIME</h3>
              <p className="text-white/40 text-sm">
                No lock-in contracts. Cancel from your dashboard in 30 seconds.
              </p>
            </div>
          </div>

          <Link href="/register" className="btn-primary text-base px-10 py-4 inline-block">
            Start Free — No Credit Card Required
          </Link>
        </div>
      </div>
    </section>
  );
}
