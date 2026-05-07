"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  User,
  Search,
  MessageSquare,
  BarChart3,
  Video,
  FileText,
  Settings,
  LogOut,
  Trophy,
  Bookmark,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
  planSlug: string;
  userName: string;
  userEmail: string;
}

const PLAYER_NAV = [
  { href: "/dashboard/player", icon: Home, label: "Overview" },
  { href: "/dashboard/player/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/player/stats", icon: BarChart3, label: "Stats" },
  { href: "/dashboard/player/highlights", icon: Video, label: "Highlights" },
  { href: "/dashboard/player/reports", icon: FileText, label: "Scout Reports" },
  { href: "/dashboard/player/messages", icon: MessageSquare, label: "Messages" },
];

const SCOUT_NAV = [
  { href: "/dashboard/scout", icon: Home, label: "Overview" },
  { href: "/search", icon: Search, label: "Search Players" },
  { href: "/dashboard/scout/reports", icon: FileText, label: "My Reports" },
  { href: "/dashboard/scout/saved", icon: Bookmark, label: "Saved Searches" },
  { href: "/dashboard/scout/messages", icon: MessageSquare, label: "Messages" },
];

const COACH_NAV = [
  { href: "/dashboard/coach", icon: Home, label: "Overview" },
  { href: "/dashboard/coach/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/coach/stats", icon: Trophy, label: "Career Stats" },
  { href: "/dashboard/coach/highlights", icon: Video, label: "Highlights" },
  { href: "/dashboard/coach/messages", icon: MessageSquare, label: "Messages" },
];

export function Sidebar({ role, planSlug, userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isScout = ["scout", "agent", "club"].includes(role);
  const isCoach = role === "coach";
  const navItems = isScout ? SCOUT_NAV : isCoach ? COACH_NAV : PLAYER_NAV;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const planColors: Record<string, string> = {
    free: "tag",
    visible: "tag-green",
    pro_athlete: "tag-gold",
    scout_basic: "tag",
    scout_pro: "tag-green",
    club_elite: "tag-gold",
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-navy-800 border-r border-white/10 transition-all duration-300 relative",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-navy-800 border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green flex-shrink-0 flex items-center justify-center">
            <span className="font-display text-navy text-xs font-bold">SG</span>
          </div>
          {!collapsed && (
            <span className="font-display text-base tracking-wider">
              SCOUT<span className="text-green">GRID</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-green/10 text-green border border-green/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-green")} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}

        {role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* User info + settings */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {!collapsed && (
          <div className="px-2 py-2">
            <p className="text-sm text-white/80 font-medium truncate">{userName}</p>
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
            <span className={cn("mt-1 inline-block text-xs", planColors[planSlug] || "tag")}>
              {planSlug.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        )}

        <Link
          href="/dashboard/player/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
