"use client";

import { useEffect, useRef, useState } from "react";
import { UserPlus, Eye, FileText, Star } from "lucide-react";

const INITIAL_EVENTS = [
  { icon: <UserPlus className="w-3.5 h-3.5 text-green" />, text: "New player from Brazil joined", time: "2m ago" },
  { icon: <Eye className="w-3.5 h-3.5 text-gold" />, text: "Scout viewed Rashid K.'s profile", time: "4m ago" },
  { icon: <FileText className="w-3.5 h-3.5 text-white/60" />, text: "Scouting report filed for midfielder", time: "7m ago" },
  { icon: <Star className="w-3.5 h-3.5 text-gold" />, text: "Player shortlisted by Serie A club", time: "9m ago" },
  { icon: <UserPlus className="w-3.5 h-3.5 text-green" />, text: "Scout from Bundesliga joined", time: "11m ago" },
  { icon: <Eye className="w-3.5 h-3.5 text-gold" />, text: "3 scouts viewed Luca M.'s profile", time: "13m ago" },
];

export function ActivityFeed() {
  const [events] = useState(INITIAL_EVENTS);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let pos = 0;
    const tick = () => {
      pos += 0.5;
      if (pos >= el.scrollHeight / 2) pos = 0;
      el.scrollTop = pos;
    };
    const id = setInterval(tick, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-card p-4 overflow-hidden h-48 relative">
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-navy/80 to-transparent z-10 pointer-events-none" />
      <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Live Activity</p>
      <ul ref={listRef} className="space-y-2 overflow-hidden">
        {[...events, ...events].map((e, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-white/50">
            {e.icon}
            <span className="flex-1 truncate">{e.text}</span>
            <span className="text-white/20 flex-shrink-0">{e.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
