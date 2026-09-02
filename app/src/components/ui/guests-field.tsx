"use client";

import { useEffect, useRef, useState, type FC } from "react";
import { FaChevronDown, FaMinus, FaPlus, FaUserGroup } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

export interface GuestCounts {
  adultes: number;
  enfants: number;
  bebes: number;
}

export interface GuestsFieldProps {
  maxes?: Partial<GuestCounts>;
  initial?: Partial<GuestCounts>;
  onCountsChange?: (counts: GuestCounts) => void;
}

const GUEST_TYPES = [
  { key: "adultes" as const, min: 1 },
  { key: "enfants" as const, min: 0 },
  { key: "bebes" as const, min: 0 },
];

type GuestKey = (typeof GUEST_TYPES)[number]["key"];

const MAX_GUESTS_PER_TYPE = 9;

function guestT(t: (p: string) => string, key: GuestKey, field: string): string {
  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  return t(`home.guest${cap}${field}`);
}

export const GuestsField: FC<GuestsFieldProps> = ({
  maxes = {},
  initial = {},
  onCountsChange,
}) => {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [counts, setCounts] = useState<GuestCounts>({
    adultes: initial.adultes ?? 2,
    enfants: initial.enfants ?? 0,
    bebes: initial.bebes ?? 0,
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 260 && rect.top > 260);
    }
    setOpen((value) => !value);
  };

  const change = (key: GuestKey, min: number, delta: number) => {
    const max = maxes[key] ?? MAX_GUESTS_PER_TYPE;
    setCounts((current) => {
      const next = {
        ...current,
        [key]: Math.max(min, Math.min(max, current[key] + delta)),
      };
      onCountsChange?.(next);
      return next;
    });
  };

  const summary = GUEST_TYPES.map(({ key, min }) => {
    const n = counts[key];
    if (n === 0) return null;
    const word = n > 1
      ? guestT(t, key, "Plural")
      : guestT(t, key, "Singular");
    return `${n} ${word}`;
  })
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="search-field guests" ref={wrapRef}>
      <span className="search-label">{t("home.guestsLabel")}</span>
      <button
        type="button"
        className="guests-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <FaUserGroup aria-hidden="true" size={15} />
        <span className="guests-summary">{summary}</span>
        <FaChevronDown
          aria-hidden="true"
          size={11}
          className={`guests-chevron${open ? " is-open" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`guests-popover${dropUp ? " guests-popover--up" : ""}`}
          role="dialog"
          aria-label={t("home.guestsAria")}
        >
          {GUEST_TYPES.map(({ key, min }) => {
            const max = maxes[key] ?? MAX_GUESTS_PER_TYPE;
            return (
              <div key={key} className="guests-row">
                <div className="guests-type">
                  <span className="guests-name">{guestT(t, key, "Name")}</span>
                  <span className="guests-hint">{guestT(t, key, "Hint")}</span>
                </div>
                <div className="stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    aria-label={`${t("home.stepperReduce")} ${guestT(t, key, "Partitive")}`}
                    disabled={counts[key] <= min}
                    onClick={() => change(key, min, -1)}
                  >
                    <FaMinus aria-hidden="true" size={10} />
                  </button>
                  <span className="stepper-value stepper-value--count" aria-live="polite">
                    {counts[key]}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    aria-label={`${t("home.stepperIncrease")} ${guestT(t, key, "Partitive")}`}
                    disabled={counts[key] >= max}
                    onClick={() => change(key, min, 1)}
                  >
                    <FaPlus aria-hidden="true" size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input type="hidden" name="adultes" value={counts.adultes} />
      <input type="hidden" name="enfants" value={counts.enfants} />
      <input type="hidden" name="bebes" value={counts.bebes} />
    </div>
  );
};
