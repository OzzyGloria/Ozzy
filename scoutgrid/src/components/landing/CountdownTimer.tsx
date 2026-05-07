"use client";

import { useEffect, useState } from "react";

// Founding pricing ends 30 days from a fixed reference date
const TARGET_DATE = new Date("2026-06-06T23:59:59Z");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, TARGET_DATE.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="py-16 bg-navy">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-display">
          Founding member pricing ends in
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="glass-card px-4 sm:px-6 py-3 sm:py-4 mb-2">
                <span className="font-display text-4xl sm:text-5xl text-white tabular-nums">
                  {pad(value)}
                </span>
              </div>
              <p className="text-white/30 text-xs uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
