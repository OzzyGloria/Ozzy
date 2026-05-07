import { Database, Search, FileText, Video, TrendingUp, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: <Database className="w-6 h-6 text-green" />,
    title: "Complete Player Database",
    description: "Transfermarkt-style profiles with market values, stats history, and career data — all in one place.",
    vs: "vs. scattered spreadsheets",
  },
  {
    icon: <Search className="w-6 h-6 text-gold" />,
    title: "Advanced Scout Filters",
    description: "Filter by 20+ parameters: position, age, nationality, league, foot, market value, availability.",
    vs: "vs. Wyscout's rigid search",
  },
  {
    icon: <Video className="w-6 h-6 text-green" />,
    title: "Highlight Reels",
    description: "Upload and showcase your best moments. Scouts watch directly on your profile — no YouTube links.",
    vs: "vs. emailing clip packages",
  },
  {
    icon: <FileText className="w-6 h-6 text-gold" />,
    title: "PDF Scouting Reports",
    description: "Professional reports with ratings, recommendations, and summaries. Export to PDF in one click.",
    vs: "vs. handwritten notes",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-green" />,
    title: "Market Value History",
    description: "Track valuation trends over time. See when values spike and identify undervalued targets.",
    vs: "vs. static Transfermarkt pages",
  },
  {
    icon: <Shield className="w-6 h-6 text-gold" />,
    title: "Verified Profiles",
    description: "Blue check verification for professional players. Scouts know they're viewing legitimate athletes.",
    vs: "vs. unverified social media profiles",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-navy">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-green font-display tracking-widest text-sm mb-3">WHY SCOUTGRID</p>
          <h2 className="font-display text-5xl text-white tracking-wider mb-4">
            BUILT FOR THE GAME
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            We talked to 200+ scouts, agents, and players. Then we built what they actually need.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-6 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-display text-lg text-white tracking-wide mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm mb-3 leading-relaxed">{f.description}</p>
              <p className="text-white/20 text-xs italic">{f.vs}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
