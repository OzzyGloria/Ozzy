import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | ScoutGrid",
  description: "Insights, tips, and stories from the world of football scouting and player development.",
};

const POSTS = [
  {
    slug: "how-to-build-the-perfect-player-profile",
    title: "How to Build the Perfect Player Profile",
    excerpt: "Scouts spend on average 12 seconds reviewing a profile. Here's what they look for — and how to make every second count.",
    category: "For Players",
    date: "May 1, 2026",
    readTime: "5 min",
  },
  {
    slug: "modern-scouting-data-revolution",
    title: "The Data Revolution in Modern Football Scouting",
    excerpt: "How xG, progressive passes, and pressure metrics are replacing the traditional eye test — and what it means for scouts today.",
    category: "For Scouts",
    date: "April 22, 2026",
    readTime: "8 min",
  },
  {
    slug: "from-local-league-to-professional-contract",
    title: "From Local League to Professional Contract: Yusuf's Story",
    excerpt: "How a midfielder from a non-league side in Portugal used ScoutGrid to earn a professional contract in the Netherlands.",
    category: "Success Stories",
    date: "April 15, 2026",
    readTime: "4 min",
  },
  {
    slug: "market-value-how-its-calculated",
    title: "Market Value: How It's Calculated and Why It Matters",
    excerpt: "A behind-the-scenes look at how ScoutGrid calculates and tracks player market values, and what moves the needle.",
    category: "Platform Guide",
    date: "April 8, 2026",
    readTime: "6 min",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "For Players": "text-green border-green/30 bg-green/10",
  "For Scouts": "text-gold border-gold/30 bg-gold/10",
  "Success Stories": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Platform Guide": "text-white/60 border-white/20 bg-white/5",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-navy py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-green font-display tracking-widest text-sm mb-3">KNOWLEDGE BASE</p>
          <h1 className="font-display text-5xl text-white tracking-wider">THE SCOUTGRID BLOG</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {POSTS.map((post) => (
            <article key={post.slug} className="glass-card-hover p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[post.category] ?? "text-white/50"}`}>
                  {post.category}
                </span>
                <span className="text-white/30 text-xs">{post.readTime} read</span>
              </div>
              <h2 className="font-display text-xl text-white tracking-wide mb-3 leading-tight">{post.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed flex-1 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">{post.date}</span>
                <span className="text-green text-sm hover:underline cursor-pointer">Read more →</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
