"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SearchFilters } from "@/components/shared/SearchFilters";
import { PlayerCard } from "@/components/player/PlayerCard";
import { PlayerCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { LayoutGrid, List, Bookmark, BookmarkCheck, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { PlayerWithStats } from "@/types";

interface SearchResponse {
  players: PlayerWithStats[];
  total: number | null;
  next_cursor: string | null;
  is_limited: boolean;
}

async function fetchPlayers(params: URLSearchParams, cursor?: string): Promise<SearchResponse> {
  const url = new URLSearchParams(params.toString());
  if (cursor) url.set("cursor", cursor);
  const res = await fetch(`/api/search?${url.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState("");
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchSaved, setSearchSaved] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isScoutPro = user?.current_plan_slug === "scout_pro" || user?.current_plan_slug === "club_elite";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["search", searchParams.toString()],
      queryFn: ({ pageParam }) => fetchPlayers(searchParams, pageParam as string | undefined),
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
      initialPageParam: undefined as string | undefined,
    });

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPlayers = data?.pages.flatMap((p) => p.players) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const isLimited = data?.pages[0]?.is_limited ?? false;

  const handleSaveSearch = async () => {
    if (!user) { router.push("/login"); return; }
    if (!isScoutPro) { setShowUpgradeModal(true); return; }
    setSavingSearch(true);
    try {
      const filters: Record<string, string> = {};
      searchParams.forEach((value, key) => { filters[key] = value; });
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: savedSearchName || "Search " + new Date().toLocaleDateString(), filters }),
      });
      if (res.ok) {
        setSearchSaved(true);
        setTimeout(() => setSearchSaved(false), 3000);
      }
    } finally {
      setSavingSearch(false);
    }
  };

  const hasActiveFilters = Array.from(searchParams.entries()).some(([k]) => k !== "sort_by");

  return (
    <div className="min-h-screen bg-navy pt-20 pb-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-white tracking-wider">PLAYER SEARCH</h1>
            <p className="text-white/40 text-sm mt-1">
              {isLoading ? "Searching..." : `${total?.toLocaleString() ?? 0} players found`}
              {isLimited && (
                <button onClick={() => setShowUpgradeModal(true)} className="ml-2 text-green hover:underline">
                  Upgrade for full access →
                </button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleSaveSearch}
                disabled={savingSearch}
                className={cn(
                  "flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors",
                  searchSaved ? "border-green/40 text-green bg-green/10" : "border-white/10 text-white/60 hover:text-white hover:border-white/20"
                )}
              >
                {searchSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {searchSaved ? "Saved!" : "Save Search"}
              </button>
            )}
            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-2 transition-colors", viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-green" />}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <SearchFilters isScoutPro={isScoutPro} />
            </div>
          </aside>

          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowMobileFilters(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-navy overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg text-white">FILTERS</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="text-white/40 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SearchFilters isScoutPro={isScoutPro} />
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0">
            {isError && <EmptyState title="Search failed" description="There was an error loading results. Please try again." action={{ label: "Retry", href: "/search" }} />}
            {isLoading && (
              <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                {Array.from({ length: 6 }).map((_, i) => <PlayerCardSkeleton key={i} />)}
              </div>
            )}
            {!isLoading && !isError && allPlayers.length === 0 && (
              <EmptyState title="No players found" description="Try adjusting your filters to find players." action={{ label: "Clear filters", href: "/search" }} />
            )}
            {allPlayers.length > 0 && (
              <>
                <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                  {allPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} variant={viewMode === "list" ? "list" : "grid"} isLocked={isLimited} />
                  ))}
                </div>
                <div ref={loadMoreRef} className="h-8 mt-4" />
                {isFetchingNextPage && (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mt-4">
                    {Array.from({ length: 3 }).map((_, i) => <PlayerCardSkeleton key={i} />)}
                  </div>
                )}
                {!hasNextPage && allPlayers.length > 0 && (
                  <p className="text-center text-white/30 text-sm mt-8 pb-4">All {allPlayers.length} results loaded</p>
                )}
                {isLimited && (
                  <div className="glass-card p-6 mt-6 text-center border border-green/20">
                    <p className="text-white/70 text-sm mb-3">
                      You're seeing limited data. Upgrade to Scout Pro to view market values, full stats, and contact players.
                    </p>
                    <button onClick={() => setShowUpgradeModal(true)} className="btn-primary text-sm px-6 py-2.5">
                      Upgrade to Scout Pro →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} feature="Full player data & saved searches" requiredPlan="scout_pro" />
      )}
    </div>
  );
}
