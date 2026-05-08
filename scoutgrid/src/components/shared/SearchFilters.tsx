"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { POSITIONS, NATIONALITIES, PREFERRED_FOOT, LEAGUES } from "@/lib/constants";

interface SearchFiltersProps {
  isScoutPro?: boolean;
}

const SORT_OPTIONS = [
  { value: "market_value_desc", label: "Market Value (High)" },
  { value: "market_value_asc", label: "Market Value (Low)" },
  { value: "overall_rating_desc", label: "Overall Rating" },
  { value: "age_asc", label: "Age (Youngest)" },
  { value: "age_desc", label: "Age (Oldest)" },
  { value: "name_asc", label: "Name (A–Z)" },
];

export function SearchFilters({ isScoutPro = false }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getParam = (key: string) => searchParams.get(key) || "";

  const [query, setQuery] = useState(getParam("q"));
  const [position, setPosition] = useState(getParam("position"));
  const [nationality, setNationality] = useState(getParam("nationality"));
  const [league, setLeague] = useState(getParam("league"));
  const [foot, setFoot] = useState(getParam("foot"));
  const [minAge, setMinAge] = useState(getParam("min_age"));
  const [maxAge, setMaxAge] = useState(getParam("max_age"));
  const [minValue, setMinValue] = useState(getParam("min_value"));
  const [maxValue, setMaxValue] = useState(getParam("max_value"));
  const [availability, setAvailability] = useState(getParam("availability"));
  const [sortBy, setSortBy] = useState(getParam("sort_by") || "market_value_desc");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (position) params.set("position", position);
    if (nationality) params.set("nationality", nationality);
    if (league) params.set("league", league);
    if (foot) params.set("foot", foot);
    if (minAge) params.set("min_age", minAge);
    if (maxAge) params.set("max_age", maxAge);
    if (minValue) params.set("min_value", minValue);
    if (maxValue) params.set("max_value", maxValue);
    if (availability) params.set("availability", availability);
    if (sortBy) params.set("sort_by", sortBy);

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setQuery(""); setPosition(""); setNationality(""); setLeague("");
    setFoot(""); setMinAge(""); setMaxAge(""); setMinValue(""); setMaxValue("");
    setAvailability(""); setSortBy("market_value_desc");
    router.push("/search");
  };

  const hasActiveFilters = position || nationality || league || foot || minAge || maxAge || minValue || maxValue || availability || query;

  const SelectField = ({ label, value, onChange, options, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    options: readonly string[]; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sg-input text-sm py-2"
      >
        <option value="">{placeholder || "All"}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="font-display text-sm text-white/60 tracking-widest uppercase">Filters</h3>

      {/* Search query */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="Search player name..."
          className="sg-input pl-10 text-sm py-2"
        />
      </div>

      <SelectField label="Position" value={position} onChange={setPosition} options={POSITIONS} />
      <SelectField label="Nationality" value={nationality} onChange={setNationality} options={NATIONALITIES} />
      <SelectField label="League" value={league} onChange={setLeague} options={LEAGUES} />

      {/* Age range */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Age Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            placeholder="Min"
            min={16}
            max={45}
            className="sg-input text-sm py-2 w-full"
          />
          <span className="text-white/30 text-sm">–</span>
          <input
            type="number"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            placeholder="Max"
            min={16}
            max={45}
            className="sg-input text-sm py-2 w-full"
          />
        </div>
      </div>

      <SelectField
        label="Availability"
        value={availability}
        onChange={setAvailability}
        options={["available", "loan_only", "not_available"]}
        placeholder="Any"
      />

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors w-full"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Advanced Filters
        {!isScoutPro && <span className="tag text-xs ml-1">Pro</span>}
        <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform", showAdvanced && "rotate-180")} />
      </button>

      {showAdvanced && (
        <div className={cn("space-y-4", !isScoutPro && "opacity-50 pointer-events-none select-none")}>
          <SelectField label="Preferred Foot" value={foot} onChange={setFoot} options={PREFERRED_FOOT} />

          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Market Value (£)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="Min"
                className="sg-input text-sm py-2 w-full"
              />
              <span className="text-white/30 text-sm">–</span>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="Max"
                className="sg-input text-sm py-2 w-full"
              />
            </div>
          </div>

          {!isScoutPro && (
            <div className="text-center pt-2">
              <a href="/pricing" className="text-xs text-green hover:underline">
                Upgrade to Scout Pro for advanced filters →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Sort */}
      <SelectField label="Sort By" value={sortBy} onChange={setSortBy} options={[]} placeholder="Market Value (High)" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="sg-input text-sm py-2 -mt-3"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Apply / Clear */}
      <div className="space-y-2 pt-2">
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="btn-primary w-full text-sm py-2.5"
        >
          {isPending ? "Searching..." : "Apply Filters"}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors py-2"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
