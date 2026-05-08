"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  User, MapPin, Loader2, CheckCircle, ChevronRight, ArrowLeft,
  Ruler, Weight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { POSITIONS, NATIONALITIES, PREFERRED_FOOT, COACHING_LICENSES, FORMATIONS, LEAGUES } from "@/lib/constants";

interface OnboardingUser {
  id: string;
  role: string;
  full_name: string;
  email: string;
  current_plan_slug: string;
}

interface OnboardingStepProps {
  step: number;
  user: OnboardingUser;
}

export function OnboardingStep({ step, user }: OnboardingStepProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user.full_name || "",
    nationality: "",
    dateOfBirth: "",
    heightCm: "",
    weightKg: "",
    preferredFoot: "Right",
    position: "",
    secondaryPosition: "",
    currentClub: "",
    league: "",
    contractUntil: "",
    bio: "",
    coachingLicense: "",
    preferredFormation: "",
    coachRole: "",
  });

  const update = (key: string, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const goNext = () => router.push(`/onboarding/${step + 1}`);
  const goBack = () => step > 1 && router.push(`/onboarding/${step - 1}`);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create profile based on role
      if (user.role === "player") {
        const { error } = await supabase.from("player_profiles").upsert({
          user_id: user.id,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth || null,
          nationality: formData.nationality || null,
          height_cm: formData.heightCm ? parseInt(formData.heightCm) : null,
          weight_kg: formData.weightKg ? parseInt(formData.weightKg) : null,
          preferred_foot: (formData.preferredFoot as "Left" | "Right" | "Both") || "Right",
          position: formData.position || null,
          secondary_position: formData.secondaryPosition || null,
          current_club: formData.currentClub || null,
          league: formData.league || null,
          contract_until: formData.contractUntil ? parseInt(formData.contractUntil) : null,
          bio: formData.bio || null,
          is_visible: true,
        }, { onConflict: "user_id" });
        if (error) throw error;
      } else if (user.role === "coach") {
        const { error } = await supabase.from("coach_profiles").upsert({
          user_id: user.id,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth || null,
          nationality: formData.nationality || null,
          current_club: formData.currentClub || null,
          current_role: formData.coachRole || null,
          preferred_formation: formData.preferredFormation || null,
          licenses: formData.coachingLicense ? [formData.coachingLicense] : [],
          bio: formData.bio || null,
          is_visible: true,
        }, { onConflict: "user_id" });
        if (error) throw error;
      }

      // Mark onboarding complete
      await supabase.from("users").update({ is_onboarded: true, full_name: formData.fullName }).eq("id", user.id);

      toast.success("Profile created! Welcome to ScoutGrid.");
      const roleRoutes: Record<string, string> = {
        scout: "/dashboard/scout",
        agent: "/dashboard/scout",
        club: "/dashboard/scout",
        coach: "/dashboard/coach",
      };
      router.push(roleRoutes[user.role] || "/dashboard/player");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isPlayer = user.role === "player";
  const isCoach = user.role === "coach";
  const isScout = ["scout", "agent", "club"].includes(user.role);

  const SelectField = ({ label, value, onChange, options, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    options: readonly string[]; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sg-input appearance-none"
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const TextField = ({ label, value, onChange, placeholder, type = "text", required = false }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
        {label}{required && <span className="text-green ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sg-input"
        placeholder={placeholder}
      />
    </div>
  );

  const StepNav = ({ onNext, nextLabel = "Continue", disabled = false }: {
    onNext?: () => void; nextLabel?: string; disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between pt-6 border-t border-white/10">
      {step > 1 ? (
        <button onClick={goBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      ) : <div />}
      <button
        onClick={onNext || goNext}
        disabled={disabled || loading}
        className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {nextLabel}
        {!loading && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );

  // ── STEP 1: Role confirmation ──────────────────────────────
  if (step === 1) {
    const roleIcons: Record<string, string> = {
      player: "⚽",
      coach: "🏆",
      scout: "🔭",
      agent: "🤝",
      club: "🏟️",
    };
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display text-white mb-2">CONFIRM YOUR ROLE</h2>
          <p className="text-white/50">We&apos;ll personalise ScoutGrid based on your role.</p>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="text-4xl">{roleIcons[user.role] || "👤"}</div>
          <div>
            <div className="font-display text-xl text-white capitalize">{user.role}</div>
            <div className="text-sm text-white/50">
              {user.role === "player" && "Create a profile to get discovered by clubs worldwide."}
              {user.role === "coach" && "Showcase your coaching career and get noticed."}
              {(user.role === "scout" || user.role === "agent") && "Access the global talent database."}
              {user.role === "club" && "Find and recruit talent for your club or academy."}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 text-sm text-white/60">
          <strong className="text-white">Not right?</strong> You can change your role in settings after setup.
        </div>

        <StepNav />
      </div>
    );
  }

  // ── STEP 2: Basic Info ──────────────────────────────────────
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display text-white mb-2">BASIC INFORMATION</h2>
          <p className="text-white/50">Tell us about yourself.</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <TextField label="Full Name" value={formData.fullName} onChange={(v) => update("fullName", v)} placeholder="Your full name" required />
          <TextField label="Date of Birth" value={formData.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} type="date" />
          <SelectField label="Nationality" value={formData.nationality} onChange={(v) => update("nationality", v)} options={NATIONALITIES} />
          {(isPlayer || isCoach) && (
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => update("bio", e.target.value)}
                className="sg-input min-h-[100px] resize-none"
                placeholder="A short description about yourself (50+ characters recommended)"
                rows={4}
              />
            </div>
          )}
        </div>

        <StepNav disabled={!formData.fullName} />
      </div>
    );
  }

  // ── STEP 3: Football-specific details ──────────────────────
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display text-white mb-2">
            {isPlayer ? "PLAYER DETAILS" : isCoach ? "COACHING DETAILS" : "ORGANISATION DETAILS"}
          </h2>
          <p className="text-white/50">
            {isPlayer ? "Your playing profile." : isCoach ? "Your coaching profile." : "Your organisation."}
          </p>
        </div>

        <div className="glass-card p-6 space-y-4">
          {isPlayer && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Primary Position" value={formData.position} onChange={(v) => update("position", v)} options={POSITIONS} />
                <SelectField label="Secondary Position" value={formData.secondaryPosition} onChange={(v) => update("secondaryPosition", v)} options={POSITIONS} placeholder="Optional" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField label="Preferred Foot" value={formData.preferredFoot} onChange={(v) => update("preferredFoot", v)} options={PREFERRED_FOOT} />
                <TextField label="Height (cm)" value={formData.heightCm} onChange={(v) => update("heightCm", v)} type="number" placeholder="180" />
                <TextField label="Weight (kg)" value={formData.weightKg} onChange={(v) => update("weightKg", v)} type="number" placeholder="75" />
              </div>
              <TextField label="Current Club" value={formData.currentClub} onChange={(v) => update("currentClub", v)} placeholder="Club name" />
              <SelectField label="League / Competition" value={formData.league} onChange={(v) => update("league", v)} options={LEAGUES} />
              <TextField label="Contract Until (year)" value={formData.contractUntil} onChange={(v) => update("contractUntil", v)} type="number" placeholder="2026" />
            </>
          )}

          {isCoach && (
            <>
              <SelectField label="Highest Coaching License" value={formData.coachingLicense} onChange={(v) => update("coachingLicense", v)} options={COACHING_LICENSES} />
              <SelectField label="Preferred Formation" value={formData.preferredFormation} onChange={(v) => update("preferredFormation", v)} options={FORMATIONS} />
              <TextField label="Current Role" value={formData.coachRole} onChange={(v) => update("coachRole", v)} placeholder="Head Coach, Assistant Coach, etc." />
              <TextField label="Current Club" value={formData.currentClub} onChange={(v) => update("currentClub", v)} placeholder="Club name" />
            </>
          )}

          {isScout && (
            <>
              <TextField label="Organisation / Club Name" value={formData.currentClub} onChange={(v) => update("currentClub", v)} placeholder="Your organisation" />
              <TextField label="Your Role / Title" value={formData.coachRole} onChange={(v) => update("coachRole", v)} placeholder="Chief Scout, Technical Director, etc." />
            </>
          )}
        </div>

        <StepNav />
      </div>
    );
  }

  // ── STEP 4: Upload photo ────────────────────────────────────
  if (step === 4) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display text-white mb-2">ADD YOUR PHOTO</h2>
          <p className="text-white/50">Profiles with photos get 3× more views.</p>
        </div>

        <div className="glass-card p-8 flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-2xl bg-white/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green/50 transition-colors">
            <User className="w-10 h-10 text-white/20" />
            <span className="text-xs text-white/30">Upload photo</span>
          </div>
          <p className="text-sm text-white/40 text-center">
            JPG, PNG, or WEBP. Max 5MB.<br />
            You can also upload after completing setup.
          </p>
        </div>

        <div className="text-center">
          <button onClick={goNext} className="text-sm text-white/40 hover:text-green transition-colors underline">
            Skip for now →
          </button>
        </div>

        <StepNav />
      </div>
    );
  }

  // ── STEP 5: Choose membership plan ─────────────────────────
  if (step === 5) {
    const plans = isScout
      ? [
          { slug: "scout_basic", name: "Scout Basic", price: "£49.99/mo", features: ["50 profile views/mo", "Save searches", "Write reports"] },
          { slug: "scout_pro", name: "Scout Pro", price: "£129.99/mo", features: ["Unlimited views", "Advanced filters", "PDF export", "Direct messaging"], popular: true },
          { slug: "club_elite", name: "Club Elite", price: "£299.99/mo", features: ["5 user seats", "Team dashboard", "API access", "Market value analytics"] },
        ]
      : [
          { slug: "free", name: "Free Starter", price: "£0", features: ["Basic profile", "Not searchable"] },
          { slug: "visible", name: "Visible", price: "£9.99/mo", features: ["Searchable profile", "2 highlights", "See who viewed you"] },
          { slug: "pro_athlete", name: "Pro Athlete", price: "£24.99/mo", features: ["10 highlights", "Priority placement", "Full analytics", "Direct messages"], popular: true },
        ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display text-white mb-2">CHOOSE YOUR PLAN</h2>
          <p className="text-white/50">You can upgrade or downgrade anytime.</p>
        </div>

        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                "glass-card p-5 border-2 transition-all cursor-pointer relative",
                plan.popular ? "border-green/50" : "border-transparent hover:border-white/20"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-4">
                  <span className="tag-green text-xs font-display tracking-wider px-3 py-1">MOST POPULAR</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="font-display text-xl text-white">{plan.name}</div>
                <div className="text-green font-display text-lg">{plan.price}</div>
              </div>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-3.5 h-3.5 text-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.slug !== "free" && (
                <div className="mt-4">
                  <button className={cn("text-sm w-full py-2 rounded-xl border transition-colors",
                    plan.popular ? "border-green/50 text-green bg-green/10 hover:bg-green/20" : "border-white/20 text-white/60 hover:border-white/40")}>
                    Select Plan →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <StepNav nextLabel="Continue with Free →" />
      </div>
    );
  }

  // ── STEP 6: Review & complete ───────────────────────────────
  if (step === 6) {
    const fields: { label: string; value: string }[] = [
      { label: "Name", value: formData.fullName || user.full_name },
      { label: "Role", value: user.role },
      { label: "Nationality", value: formData.nationality || "—" },
      ...(isPlayer ? [
        { label: "Position", value: formData.position || "—" },
        { label: "Club", value: formData.currentClub || "—" },
        { label: "Preferred Foot", value: formData.preferredFoot },
      ] : []),
      ...(isCoach ? [
        { label: "License", value: formData.coachingLicense || "—" },
        { label: "Formation", value: formData.preferredFormation || "—" },
      ] : []),
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display text-white mb-2">READY TO LAUNCH</h2>
          <p className="text-white/50">Review your profile and complete setup.</p>
        </div>

        <div className="glass-card p-6 space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between text-sm">
              <span className="text-white/50">{f.label}</span>
              <span className="text-white font-medium capitalize">{f.value}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 flex items-start gap-3 border border-green/20 bg-green/5">
          <Star className="w-5 h-5 text-green flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/70">
            <strong className="text-white">You can always edit your profile</strong> from the dashboard after setup.
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={goBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm px-4 py-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleFinish}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {loading ? "Creating Profile..." : "COMPLETE SETUP →"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
