import Link from "next/link";
import { Target, Globe, Users, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ScoutGrid | Football Intelligence Platform",
  description: "ScoutGrid was built by football people for football people. Learn about our mission to connect talent with opportunity.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <p className="text-green font-display tracking-widest text-sm mb-4">OUR MISSION</p>
          <h1 className="font-display text-6xl text-white tracking-wider mb-6">
            FOOTBALL<br />INTELLIGENCE<br /><span className="text-green">DEMOCRATISED</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            We believe talent should be discovered, not overlooked. ScoutGrid was born from a simple observation:
            the tools that elite clubs use to scout talent were inaccessible to 99% of the football world.
            We're changing that.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: <Target className="w-6 h-6 text-green" />, title: "Talent First", desc: "Every feature is designed to give players a fair shot at being discovered." },
            { icon: <Globe className="w-6 h-6 text-gold" />, title: "Global Reach", desc: "47 countries. We bring local talent to global scouts." },
            { icon: <Users className="w-6 h-6 text-green" />, title: "Community", desc: "A platform where scouts, agents, clubs, and players speak the same language." },
            { icon: <Zap className="w-6 h-6 text-gold" />, title: "Transparency", desc: "Fair pricing, honest metrics, and no hidden pay-to-win mechanics." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="glass-card p-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">{icon}</div>
              <h3 className="font-display text-lg text-white tracking-wider mb-2">{title}</h3>
              <p className="text-white/50 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-4xl text-white tracking-wider mb-4">JOIN THE MOVEMENT</h2>
          <p className="text-white/50 mb-8">Be part of the platform that's changing how football works.</p>
          <Link href="/register" className="btn-primary px-8 py-4 text-base">
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
