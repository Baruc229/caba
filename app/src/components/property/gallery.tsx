"use client";

import { useState } from "react";

type Photo = { id: string; url: string; ordre: number };

export function PropertyGallery({ photos }: { photos: Photo[] }) {
  const [showAll, setShowAll] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        Aucune photo disponible
      </div>
    );
  }

  const sorted = [...photos].sort((a, b) => a.ordre - b.ordre);
  const displayed = sorted.slice(0, 5);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden aspect-[2/1]">
          <div className="col-span-1 row-span-2 relative bg-gray-100">
            <img
              src={displayed[0]?.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {displayed[1] && (
            <div className="relative bg-gray-100">
              <img
                src={displayed[1].url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {displayed[2] && (
            <div className="relative bg-gray-100">
              <img
                src={displayed[2].url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {displayed[3] && (
            <div className="relative bg-gray-100">
              <img
                src={displayed[3].url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {displayed[4] && (
            <div className="relative bg-gray-100">
              <img
                src={displayed[4].url}
                alt=""
                className="w-full h-full object-cover"
              />
              {sorted.length > 5 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium hover:bg-black/50 transition-colors"
                >
                  +{sorted.length - 5} photos
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden relative">
        <div className="overflow-x-auto snap-x snap-mandatory flex">
          {sorted.map((photo, i) => (
            <div
              key={photo.id}
              className="snap-center shrink-0 w-full aspect-[4/3] bg-gray-100"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                onLoad={() => setActiveIdx(i)}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {sorted.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeIdx ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {showAll && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowAll(false)}
        >
          <button
            onClick={() => setShowAll(false)}
            className="absolute top-4 right-4 text-white text-2xl z-10"
          >
            ✕
          </button>
          <div
            className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {sorted.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="w-full aspect-square object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
