"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green" />
        </div>
        <h2 className="text-2xl font-display text-white mb-2">CHECK YOUR EMAIL</h2>
        <p className="text-white/50 text-sm mb-6">
          We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>.
          Check your inbox and spam folder.
        </p>
        <Link href="/login" className="btn-outline inline-flex items-center gap-2 text-sm px-6 py-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-white mb-2">RESET PASSWORD</h1>
        <p className="text-white/50 text-sm">Enter your email and we&apos;ll send a reset link</p>
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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            "SEND RESET LINK"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
