"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { PlayerWithStats } from "@/types";

interface SearchResponse {
  players: PlayerWithStats[];
  total: number | null;
  next_cursor: string | null;
  is_limited: boolean;
}

export function useSearch(params: URLSearchParams) {
  return useInfiniteQuery({
    queryKey: ["players", params.toString()],
    queryFn: async ({ pageParam }) => {
      const url = new URLSearchParams(params.toString());
      if (pageParam) url.set("cursor", pageParam as string);
      const res = await fetch(`/api/search?${url.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<SearchResponse>;
    },
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}
