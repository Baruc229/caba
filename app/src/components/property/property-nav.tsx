"use client";

import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { id: "description", label: "Description" },
  { id: "tarifs", label: "Tarifs" },
  { id: "disponibilite", label: "Disponibilite" },
  { id: "avis", label: "Avis" },
  { id: "localisation", label: "Localisation" },
];

export function PropertyNav() {
  const [active, setActive] = useState("description");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);

      const sections = NAV_ITEMS.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: 0 };
        return { id: item.id, top: el.getBoundingClientRect().top };
      });

      const current = sections.find(
        (s) => s.top > 0 && s.top < 200
      );
      if (current) setActive(current.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                active === item.id
                  ? "bg-caba-blue/10 text-caba-blue"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
