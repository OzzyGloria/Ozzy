"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Star, Send, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  report_date: z.string(),
  technical_rating: z.number().int().min(1).max(10),
  physical_rating: z.number().int().min(1).max(10),
  mental_rating: z.number().int().min(1).max(10),
  overall_rating: z.number().int().min(1).max(10),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  summary: z.string().optional(),
  recommendation: z.enum(["sign", "monitor", "reject", "loan"]),
  is_private: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface ScoutingReportFormProps {
  playerProfileId?: string;
  coachProfileId?: string;
  playerName?: string;
  onSuccess?: () => void;
}

const RECOMMENDATION_OPTIONS = [
  { value: "sign", label: "Sign", color: "text-green border-green/40 bg-green/10" },
  { value: "monitor", label: "Monitor", color: "text-gold border-gold/40 bg-gold/10" },
  { value: "loan", label: "Loan", color: "text-blue-400 border-blue-400/40 bg-blue-400/10" },
  { value: "reject", label: "Reject", color: "text-red-400 border-red-400/40 bg-red-400/10" },
];

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
        <span className={cn(
          "font-display text-lg",
          value >= 8 ? "text-green" : value >= 6 ? "text-gold" : "text-red-400"
        )}>
          {value}/10
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={cn(
              "flex-1 h-8 rounded transition-colors text-xs font-medium",
              i + 1 <= value
                ? value >= 8 ? "bg-green/80 text-navy" : value >= 6 ? "bg-gold/80 text-navy" : "bg-red-400/80 text-white"
                : "bg-white/10 text-white/30 hover:bg-white/20"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScoutingReportForm({ playerProfileId, coachProfileId, playerName, onSuccess }: ScoutingReportFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      report_date: new Date().toISOString().split("T")[0],
      technical_rating: 7,
      physical_rating: 7,
      mental_rating: 7,
      overall_rating: 7,
      recommendation: "monitor",
      is_private: true,
    },
  });

  const technicalRating = watch("technical_rating");
  const physicalRating = watch("physical_rating");
  const mentalRating = watch("mental_rating");
  const overallRating = watch("overall_rating");
  const recommendation = watch("recommendation");
  const isPrivate = watch("is_private");

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/scouting-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          player_profile_id: playerProfileId ?? null,
          coach_profile_id: coachProfileId ?? null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save report");
      }

      toast.success("Scouting report saved");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {playerName && (
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Star className="w-5 h-5 text-gold" />
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Scouting Report</p>
            <p className="text-white font-medium">{playerName}</p>
          </div>
        </div>
      )}

      {/* Report date */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Report Date</label>
        <input type="date" {...register("report_date")} className="sg-input text-sm py-2" />
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        <RatingInput label="Technical" value={technicalRating} onChange={(v) => setValue("technical_rating", v)} />
        <RatingInput label="Physical" value={physicalRating} onChange={(v) => setValue("physical_rating", v)} />
        <RatingInput label="Mental" value={mentalRating} onChange={(v) => setValue("mental_rating", v)} />
        <RatingInput label="Overall" value={overallRating} onChange={(v) => setValue("overall_rating", v)} />
      </div>

      {/* Recommendation */}
      <div>
        <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Recommendation</label>
        <div className="grid grid-cols-4 gap-2">
          {RECOMMENDATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("recommendation", opt.value as FormData["recommendation"])}
              className={cn(
                "py-2 rounded-lg border text-sm font-medium transition-colors",
                recommendation === opt.value ? opt.color : "border-white/10 text-white/40 hover:border-white/20 hover:text-white"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text fields */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Strengths</label>
        <textarea
          {...register("strengths")}
          rows={3}
          placeholder="Key strengths observed..."
          className="sg-input text-sm py-2 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Weaknesses</label>
        <textarea
          {...register("weaknesses")}
          rows={3}
          placeholder="Areas for improvement..."
          className="sg-input text-sm py-2 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Summary</label>
        <textarea
          {...register("summary")}
          rows={5}
          placeholder="Detailed scout assessment..."
          className="sg-input text-sm py-2 resize-none"
        />
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center justify-between py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/70">Private report</span>
          <span className="text-xs text-white/30">(only visible to you)</span>
        </div>
        <button
          type="button"
          onClick={() => setValue("is_private", !isPrivate)}
          className={cn(
            "w-12 h-6 rounded-full transition-colors relative",
            isPrivate ? "bg-green" : "bg-white/20"
          )}
        >
          <span className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
            isPrivate ? "translate-x-7" : "translate-x-1"
          )} />
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? "Saving..." : "Save Report"}
      </button>
    </form>
  );
}
