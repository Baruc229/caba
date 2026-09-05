"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/components/providers/app-provider";

function buildPin(size: number): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#001489"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.2 10.9 7.4 12 0.3 0.3 1 0.3 1.3 0C13.8 20.9 20 15.2 20 10c0-4.4-3.6-8-8-8z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>`;
  return L.divIcon({
    className: "detail-map-pin",
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

interface PropertyMapProps {
  lat: number;
  lon: number;
}

export function PropertyMap({ lat, lon }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useApp();

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = L.map(containerRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance);

    L.marker([lat, lon], { icon: buildPin(30) }).addTo(instance);
    instance.setView([lat, lon], 15);

    return () => {
      instance.remove();
    };
  }, [lat, lon]);

  return (
    <div
      className="detail-map"
      ref={containerRef}
      aria-label={t("logementDetail.carteLocalisation")}
    />
  );
}