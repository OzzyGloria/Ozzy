import { HeroSection } from "@/components/landing/HeroSection";
import { ScarcityBanner } from "@/components/landing/ScarcityBanner";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CountdownTimer } from "@/components/landing/CountdownTimer";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { RiskReversal } from "@/components/landing/RiskReversal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ScoutGrid — Football Intelligence Platform",
  description: "The platform where rising football talent meets elite scouts. Build your profile, get discovered, and take your career to the next level.",
  openGraph: {
    title: "ScoutGrid — Football Intelligence Platform",
    description: "Transfermarkt × Wyscout × Hudl. Build your profile. Get discovered.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ScarcityBanner />
      <FeaturesGrid />
      <CountdownTimer />
      <TestimonialCarousel />
      <RiskReversal />

      {/* Final CTA */}
      <section className="py-24 bg-navy">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-5xl sm:text-6xl text-white tracking-wider mb-6">
            YOUR CAREER<br /><span className="text-green">STARTS NOW</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Join 2,400+ players and 380+ scouts already on the platform.
            Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register?role=player" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
              I'm a Player
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register?role=scout" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
              I'm a Scout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
