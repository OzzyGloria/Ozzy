"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Search, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/search", label: "Search Players" },
  { href: "/about", label: "About" },
];

interface NavUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  current_plan_slug: string;
  avatar_url: string | null;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("id, email, full_name, role, current_plan_slug, avatar_url")
          .eq("id", authUser.id)
          .single();
        if (data) setUser(data as NavUser);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null);
      if (event === "SIGNED_IN") fetchUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setDropdownOpen(false);
  };

  const getDashboardHref = () => {
    if (!user) return "/dashboard/player";
    if (user.role === "scout" || user.role === "agent" || user.role === "club") return "/dashboard/scout";
    if (user.role === "coach") return "/dashboard/coach";
    return "/dashboard/player";
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-navy/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-green flex items-center justify-center">
              <span className="font-display text-navy text-sm font-bold">SG</span>
            </div>
            <span className="font-display text-xl tracking-wider text-white group-hover:text-green transition-colors">
              SCOUT<span className="text-green">GRID</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-body transition-colors duration-200",
                  pathname === link.href
                    ? "text-green"
                    : "text-white/70 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons / user menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-green/20 border border-green/30 flex items-center justify-center text-green text-xs font-display">
                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 max-w-[100px] truncate">{user.full_name || user.email}</span>
                  <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card p-2 space-y-1">
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/search"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Search Players
                    </Link>
                    <div className="sg-divider my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm px-5 py-2 rounded-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="sg-divider my-2" />
            {user ? (
              <>
                <Link href={getDashboardHref()} onClick={() => setIsOpen(false)} className="block px-4 py-2 text-white/70 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="block px-4 py-2 text-red-400 w-full text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-white/70 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="btn-primary block text-center mx-4 py-2 text-sm rounded-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
