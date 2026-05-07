"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/player";
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Get role to redirect appropriately
      const { data: dbUser } = await supabase
        .from("users")
        .select("role, is_onboarded")
        .eq("id", data.user.id)
        .single();

      if (dbUser && !dbUser.is_onboarded) {
        router.push("/onboarding/1");
      } else {
        const roleRoutes: Record<string, string> = {
          scout: "/dashboard/scout",
          agent: "/dashboard/scout",
          club: "/dashboard/scout",
          coach: "/dashboard/coach",
          admin: "/admin",
        };
        const dest = roleRoutes[dbUser?.role || "player"] || redirectTo;
        router.push(dest);
      }
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-white mb-2">WELCOME BACK</h1>
        <p className="text-white/50 text-sm">Sign in to your ScoutGrid account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-body text-white/60 mb-2 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sg-input"
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs font-body text-white/60 mb-2 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sg-input pr-12"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-right mt-2">
            <Link href="/forgot-password" className="text-xs text-white/40 hover:text-green transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "SIGN IN"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-green hover:text-green-dark transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
