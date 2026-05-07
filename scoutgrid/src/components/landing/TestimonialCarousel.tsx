"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Within 3 weeks of joining ScoutGrid, I had 4 scout inquiries. Signed a professional contract 2 months later.",
    name: "Marco Fernández",
    role: "Midfielder, now at FC Groningen",
    rating: 5,
  },
  {
    quote: "I scout 6 leagues simultaneously. The filter system saves me 15 hours a week compared to my old workflow.",
    name: "James Whitfield",
    role: "Scout, Premier League Club",
    rating: 5,
  },
  {
    quote: "The market value history alone is worth the subscription. I identified three undervalued players who were later signed for 3x their value.",
    name: "Aleksander Novak",
    role: "Agent, Warsaw",
    rating: 5,
  },
  {
    quote: "As a coach, having a professional profile that clubs can view has opened doors I didn't know existed.",
    name: "Carlos Mendoza",
    role: "Head Coach, Liga MX",
    rating: 5,
  },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-24 bg-navy">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-green font-display tracking-widest text-sm mb-3">SOCIAL PROOF</p>
          <h2 className="font-display text-5xl text-white tracking-wider">REAL RESULTS</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 sm:p-12 text-center relative">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-current" />
              ))}
            </div>

            <blockquote className="font-display text-xl sm:text-2xl text-white leading-relaxed mb-8 tracking-wide">
              "{t.quote}"
            </blockquote>

            <div>
              <p className="text-white font-medium">{t.name}</p>
              <p className="text-white/40 text-sm">{t.role}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-green" : "bg-white/20"}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
