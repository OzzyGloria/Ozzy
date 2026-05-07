import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  if (amount >= 1_000_000) {
    return `€${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `€${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatAge(dob: string | Date): number {
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getFlagEmoji(countryCode: string): string {
  const flagMap: Record<string, string> = {
    Brazil: "🇧🇷",
    Spain: "🇪🇸",
    France: "🇫🇷",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Germany: "🇩🇪",
    Portugal: "🇵🇹",
    Argentina: "🇦🇷",
    Netherlands: "🇳🇱",
    Belgium: "🇧🇪",
    Italy: "🇮🇹",
    Senegal: "🇸🇳",
    Ghana: "🇬🇭",
    Nigeria: "🇳🇬",
    "Ivory Coast": "🇨🇮",
    Morocco: "🇲🇦",
    Egypt: "🇪🇬",
    Colombia: "🇨🇴",
    Uruguay: "🇺🇾",
    Mexico: "🇲🇽",
    USA: "🇺🇸",
    Japan: "🇯🇵",
    "South Korea": "🇰🇷",
    Australia: "🇦🇺",
    Croatia: "🇭🇷",
    Serbia: "🇷🇸",
    Denmark: "🇩🇰",
    Sweden: "🇸🇪",
    Norway: "🇳🇴",
    Poland: "🇵🇱",
    Turkey: "🇹🇷",
    Greece: "🇬🇷",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    Ireland: "🇮🇪",
    Austria: "🇦🇹",
    Switzerland: "🇨🇭",
  };
  return flagMap[countryCode] || "🏳️";
}

export function getPositionColor(position: string): string {
  const colors: Record<string, string> = {
    GK: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    CB: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    LB: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    RB: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    LWB: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    RWB: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CDM: "bg-green/20 text-green border-green/30",
    CM: "bg-green/20 text-green border-green/30",
    CAM: "bg-green/20 text-green border-green/30",
    LM: "bg-green/20 text-green border-green/30",
    RM: "bg-green/20 text-green border-green/30",
    LW: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    RW: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    CF: "bg-red-500/20 text-red-400 border-red-500/30",
    ST: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[position] || "bg-white/10 text-white border-white/20";
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
