import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Simple nav */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-green flex items-center justify-center">
            <span className="font-display text-navy text-sm font-bold">SG</span>
          </div>
          <span className="font-display text-xl tracking-wider text-white">
            SCOUT<span className="text-green">GRID</span>
          </span>
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
