"use client";

import Link from "next/link";
import {
  FaArrowRight,
  FaBolt,
  FaBroom,
  FaShower,
  FaSquareParking,
  FaUserShield,
  FaWifi,
} from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

export function ServicesPhare() {
  const { t } = useApp();

  const rows = [
    { icon: FaBolt, label: t("home.services.electLabel"), desc: t("home.services.electDesc") },
    { icon: FaShower, label: t("home.services.eauLabel"), desc: t("home.services.eauDesc") },
    { icon: FaBroom, label: t("home.services.menageLabel"), desc: t("home.services.menageDesc") },
  ];

  const tiles = [
    {
      icon: FaUserShield,
      label: t("home.services.securiteLabel"),
      desc: t("home.services.securiteDesc"),
      featured: true,
    },
    {
      icon: FaWifi,
      label: t("home.services.wifiLabel"),
      desc: t("home.services.wifiDesc"),
      featured: false,
    },
  ];

  return (
    <section className="svc-section" aria-labelledby="svc-title">
      <h2 id="svc-title" className="sr-only">
        {t("home.services.title")}
      </h2>

      <div className="svc-grid">
        <div className="svc-col svc-col--a">
          <div className="svc-a1">
            {rows.map((row) => (
              <div className="svc-row" key={row.label}>
                <span className="svc-row-icon" aria-hidden="true">
                  <row.icon />
                </span>
                <div className="svc-row-text">
                  <h3 className="heading-display svc-row-title">{row.label}</h3>
                  <p className="svc-row-desc">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="svc-a2">
            {tiles.map((tile) => (
              <div
                className={tile.featured ? "svc-tile svc-tile--blue" : "svc-tile"}
                key={tile.label}
              >
                <span className="svc-tile-icon" aria-hidden="true">
                  <tile.icon />
                </span>
                <div className="svc-tile-text">
                  <h3 className="heading-display svc-tile-title">{tile.label}</h3>
                  <p className="svc-tile-desc">{tile.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="svc-col svc-col--b">
          <div className="svc-row svc-row--band">
            <span className="svc-row-icon" aria-hidden="true">
              <FaSquareParking />
            </span>
            <div className="svc-row-text">
              <h3 className="heading-display svc-row-title">{t("home.services.parkingLabel")}</h3>
              <p className="svc-row-desc">{t("home.services.parkingDesc")}</p>
            </div>
          </div>

          <div className="svc-cta">
            <p className="svc-cta-label">{t("home.services.ctaLabel")}</p>
            <h3 className="heading-display svc-cta-title">{t("home.services.ctaTitle")}</h3>
            <p className="svc-cta-desc">{t("home.services.ctaDesc")}</p>
            <Link href="/logements" className="btn-pill svc-cta-btn">
              {t("home.services.ctaButton")}
              <FaArrowRight aria-hidden="true" size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}