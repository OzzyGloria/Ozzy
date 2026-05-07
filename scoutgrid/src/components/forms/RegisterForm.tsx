"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, User, Users, Search, Shield, Building, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "player" | "coach" | "scout" | "agent" | "club";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "player",
    label: "Player",
    description: "I want to get discovered by clubs",
    icon: <User className="w-5 h-5" />,
  },
  {
    value: "coach",
    label: "Coach",
    description: "I want visibility as a coaching professional",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    value: "scout",
    label: "Scout",
    description: "I scout talent for clubs and organisations",
    icon: <Search className="w-5 h-5" />,
  },
  {
    value: "agent",
    label: "Agent",
    description: "I represent players and coaches",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    value: "club",
    label: "Club / Academy",
    description: "I recruit talent for a club or academy",
    icon: <Building className="w-5 h-5" />,
  },
];

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("player");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") as UserRole | null;

  if (defaultRole && defaultRole !== role) {
    setRole(defaultRole);
  }

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/onboarding/1`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Account created! Complete your profile.");
      router.push("/onboarding/1");
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-white mb-2">JOIN SCOUTGRID</h1>
        <p className="text-white/50 text-sm">Create your account — it&apos;s free to start</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role selection */}
        <div>
          <label className="block text-xs font-body text-white/60 mb-3 uppercase tracking-wider">
            I am a...
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
                  role === option.value
                    ? "border-green/50 bg-green/10 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                )}
              >
                <div className={cn("flex-shrink-0", role === option.value ? "text-green" : "text-white/40")}>
                  {option.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-white/40">{option.description}</div>
                </div>
                {role === option.value && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-green flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-navy" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-body text-white/60 mb-2 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="sg-input"
            placeholder="Your full name"
            required
          />
        </div>

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
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
              Creating Account...
            </>
          ) : (
            "CREATE FREE ACCOUNT"
          )}
        </button>

        <p className="text-xs text-white/30 text-center">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-white/50 hover:text-green transition-colors">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/50 hover:text-green transition-colors">Privacy Policy</Link>.
        </p>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="text-green hover:text-green-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
