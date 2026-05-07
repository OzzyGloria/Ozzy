"use client";

import { useState } from "react";
import { Play, Eye, Clock, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Highlight } from "@/types";

interface HighlightGalleryProps {
  highlights: Highlight[];
  canUpload?: boolean;
  onUpload?: () => void;
}

export function HighlightGallery({ highlights, canUpload = false, onUpload }: HighlightGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<Highlight | null>(null);

  const formatDuration = (secs: number | null) => {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (highlights.length === 0 && !canUpload) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
          <Play className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/40 text-sm">No highlights uploaded yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Video modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="glass-card overflow-hidden">
              <video
                src={activeVideo.cloudinary_url}
                controls
                autoPlay
                className="w-full aspect-video bg-black"
              />
              <div className="p-4">
                <h3 className="font-display text-white text-lg">{activeVideo.title}</h3>
                {activeVideo.description && (
                  <p className="text-sm text-white/50 mt-1">{activeVideo.description}</p>
                )}
                {activeVideo.match_details && (
                  <p className="text-xs text-white/30 mt-2">{activeVideo.match_details}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((h) => (
          <button
            key={h.id}
            onClick={() => setActiveVideo(h)}
            className="glass-card-hover group relative overflow-hidden aspect-video"
          >
            {/* Thumbnail */}
            {h.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={h.thumbnail_url}
                alt={h.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                <Play className="w-12 h-12 text-white/20" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-green/90 flex items-center justify-center">
                <Play className="w-6 h-6 text-navy fill-current" />
              </div>
            </div>

            {/* Info bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="font-display text-sm text-white truncate">{h.title}</div>
              <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                {h.duration_seconds && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(h.duration_seconds)}
                  </span>
                )}
                {h.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {h.views}
                  </span>
                )}
              </div>
            </div>

            {h.is_primary && (
              <div className="absolute top-2 left-2 tag-gold text-xs px-2 py-0.5 rounded">Primary</div>
            )}
          </button>
        ))}

        {/* Upload tile */}
        {canUpload && (
          <button
            onClick={onUpload}
            className={cn(
              "glass-card-hover aspect-video flex flex-col items-center justify-center gap-3",
              "border-2 border-dashed border-white/20 hover:border-green/50 transition-colors"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white/40" />
            </div>
            <span className="text-sm text-white/40 font-body">Upload Highlight</span>
          </button>
        )}
      </div>
    </div>
  );
}
