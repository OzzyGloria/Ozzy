"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(rgba(0,255,135,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60 mb-8 font-display tracking-wider">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
          FOUNDING MEMBER PRICING · LIMITED SPOTS REMAINING
        </div>

        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-white leading-none tracking-wider mb-6">
          FROM UNKNOWN<br />
          <span className="text-green">TO UNSTOPPABLE</span>
        </h1>

        <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The platform where rising football talent meets elite scouts.
          Build your profile, get discovered, and take the next step in your career.
        </p>

        {/* Before / After */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <div className="glass-card px-6 py-4 text-center">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Before ScoutGrid</p>
            <p className="text-white/60 text-sm">Unnoticed talent, no platform, endless tryouts</p>
          </div>
          <ArrowRight className="w-6 h-6 text-green rotate-90 sm:rotate-0 flex-shrink-0" />
          <div className="glass-card px-6 py-4 text-center border border-green/20">
            <p className="text-green text-xs uppercase tracking-wider mb-1">After ScoutGrid</p>
            <p className="text-white text-sm font-medium">Discovered by 200+ scouts, contract signed</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
            Start Free Today
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/search" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <Play className="w-4 h-4" />
            Browse players
          </Link>
        </div>

        {/* Social proof numbers */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/5">
          {[
            { value: "2,400+", label: "Player Profiles" },
            { value: "380+", label: "Active Scouts" },
            { value: "47", label: "Countries" },
            { value: "£1.2B+", label: "Total Player Value" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl text-white mb-1">{value}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
