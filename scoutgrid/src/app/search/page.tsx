import { Suspense } from "react";
import { SearchContent } from "./SearchContent";
import { PlayerCardSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Search | ScoutGrid",
  description: "Search and discover football talent from around the world.",
};

function SearchFallback() {
  return (
    <div className="min-h-screen bg-navy pt-20 pb-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/5 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PlayerCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
