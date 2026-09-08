"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationDot, FaUpRightFromSquare } from "react-icons/fa6";
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
  lat: number | null;
  lon: number | null;
  nom?: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
}

function searchQuery(adresse?: string | null, ville?: string | null, pays?: string | null): string {
  return [adresse, ville, pays].filter(Boolean).join(", ").trim();
}

export function PropertyMap({ lat, lon, nom, adresse, ville, pays }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { t } = useApp();

  const latLonKnown = lat != null && lon != null;
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(() =>
    latLonKnown && lat != null && lon != null ? { lat, lon } : null
  );
  const [failed, setFailed] = useState(false);

  /* Secours : géocodage côté client (Nominatim) quand le serveur
     n'a pas pu résoudre les coordonnées. Effect idempotent : il ne
     tourne qu'une fois tant que coords reste null. */
  useEffect(() => {
    if (coords) return;
    const ctrl = new AbortController();
    let cancelled = false;
    const query = searchQuery(adresse, ville, pays);
    const attempt: Promise<{ lat: number; lon: number } | null> = query
      ? fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          { signal: ctrl.signal, headers: { "Accept-Language": "fr" } }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data?.[0]?.lat && data[0]?.lon) {
              return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
          })
          .catch(() => null)
      : Promise.resolve(null);
    attempt.then((result) => {
      if (cancelled) return;
      if (result) {
        setCoords(result);
      } else {
        setFailed(true);
      }
    });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [coords, adresse, ville, pays]);

  /* Initialisation Leaflet : une seule instance par montée. */
  useEffect(() => {
    if (!coords) return;
    const host = containerRef.current;
    if (!host) return;
    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lon], 15);
      return;
    }

    const instance = L.map(host, {
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      zoomControl: true,
    });
    mapRef.current = instance;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance);

    const marker = L.marker([coords.lat, coords.lon], { icon: buildPin(30) }).addTo(instance);
    if (nom) marker.bindPopup(nom, { closeButton: false });
    instance.setView([coords.lat, coords.lon], 15);

    return () => {
      const inst = mapRef.current;
      mapRef.current = null;
      if (inst) inst.remove();
    };
  }, [coords, nom]);

  const mapsHref = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery(adresse, ville, pays))}`;

  if (!coords && !failed) {
    return (
      <div
        className="detail-map detail-map--loading"
        aria-busy="true"
        aria-label={t("logementDetail.carteLocalisation")}
      >
        <span className="detail-map-spinner" aria-hidden="true" />
        <span className="detail-map-loading-text">{t("logementDetail.carteChargement")}</span>
      </div>
    );
  }

  if (!coords && failed) {
    return (
      <div className="detail-map-fallback">
        <span className="detail-map-fallback-icon" aria-hidden="true">
          <FaLocationDot size={22} />
        </span>
        <p className="detail-map-fallback-address">
          {[adresse, ville, pays].filter(Boolean).join(", ")}
        </p>
        <a className="detail-map-fallback-link" href={mapsHref} target="_blank" rel="noopener noreferrer">
          {t("logementDetail.ouvrirMaps")}
          <FaUpRightFromSquare aria-hidden="true" size={13} />
        </a>
      </div>
    );
  }

  return (
    <div className="detail-map">
      <div className="detail-map-canvas" ref={containerRef} aria-label={t("logementDetail.carteLocalisation")} />
      <a className="detail-map-action" href={mapsHref} target="_blank" rel="noopener noreferrer">
        {t("logementDetail.agrandirCarte")}
        <FaUpRightFromSquare aria-hidden="true" size={12} />
      </a>
    </div>
  );
}