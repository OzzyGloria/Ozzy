import Link from "next/link";

const FOOTER_LINKS = {
  Platform: [
    { href: "/search", label: "Search Players" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About ScoutGrid" },
    { href: "/blog", label: "News & Insights" },
  ],
  "For Players": [
    { href: "/register?role=player", label: "Create Player Profile" },
    { href: "/pricing", label: "Player Plans" },
    { href: "/search", label: "Find Your Next Club" },
  ],
  "For Scouts & Clubs": [
    { href: "/register?role=scout", label: "Start Scouting" },
    { href: "/pricing", label: "Scout Plans" },
    { href: "/search", label: "Search Database" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/gdpr", label: "GDPR" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-800 mt-20">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green flex items-center justify-center">
                <span className="font-display text-navy text-sm font-bold">SG</span>
              </div>
              <span className="font-display text-xl tracking-wider">
                SCOUT<span className="text-green">GRID</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              The global football intelligence and scouting platform.
              From Sunday League to the Champions League.
            </p>
            <div className="flex items-center gap-2">
              <span className="tag-green">GDPR Compliant</span>
              <span className="tag">SSL Secured</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm tracking-widest text-white/50 uppercase mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sg-divider pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ScoutGrid. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Built for the beautiful game. 🌍
          </p>
        </div>
      </div>
    </footer>
  );
}
