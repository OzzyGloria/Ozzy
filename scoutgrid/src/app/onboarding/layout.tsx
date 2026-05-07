import Link from "next/link";

const STEPS = [
  "Role",
  "Basic Info",
  "Football Details",
  "Media",
  "Membership",
  "Review",
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <div className="border-b border-white/10 bg-navy-800">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green flex items-center justify-center">
                <span className="font-display text-navy text-sm font-bold">SG</span>
              </div>
              <span className="font-display text-lg tracking-wider hidden sm:block">
                SCOUT<span className="text-green">GRID</span>
              </span>
            </Link>

            <div className="text-sm text-white/40 font-body">Profile Setup</div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="border-b border-white/5 bg-navy-800/50">
        <div className="section-container py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display
                      transition-all duration-300`}
                    id={`step-indicator-${i + 1}`}
                    data-step={i + 1}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-white/30 hidden sm:block">{step}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-white/10 min-w-[20px]" id={`step-line-${i + 1}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-container py-10">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </div>

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
