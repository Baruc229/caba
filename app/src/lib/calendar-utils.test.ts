import { describe, expect, it } from "vitest";
import {
  addMonths,
  daysInMonth,
  leadingBlanks,
  nextSelection,
  nightsBetween,
  rangeRole,
  toISO,
} from "./calendar-utils";

describe("calendar-utils", () => {
  it("leadingBlanks retourne 0..6 (lundi premier)", () => {
    // 1er janv 2026 = jeudi (JS: 4) → (4+6)%7 = 3
    expect(leadingBlanks(2026, 1)).toBe(3);
    // 1er déc 2026 = mardi (JS: 2) → (2+6)%7 = 1
    expect(leadingBlanks(2026, 12)).toBe(1);
    expect(leadingBlanks(2026, 3)).toBe(6); // 1er mars = dimanche (JS:0)
  });

  it("daysInMonth gère les années bissextiles", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("toISO formate en YYYY-MM-DD", () => {
    expect(toISO(2026, 1, 5)).toBe("2026-01-05");
    expect(toISO(2026, 12, 31)).toBe("2026-12-31");
  });

  it("addMonths navigue par paire avec passage d'année", () => {
    expect(addMonths({ year: 2026, month: 1 }, 1)).toEqual({ year: 2026, month: 2 });
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2027, month: 1 }, -1)).toEqual({ year: 2026, month: 12 });
    expect(addMonths({ year: 2026, month: 5 }, -2)).toEqual({ year: 2026, month: 3 });
  });

  it("nightsBetween compte les nuits", () => {
    expect(nightsBetween("2026-05-10", "2026-05-12")).toBe(2);
    expect(nightsBetween("2026-05-12", "2026-05-10")).toBe(0);
    expect(nightsBetween("2026-12-31", "2027-01-02")).toBe(2);
  });

  it("nextSelection: arrivée → départ → redémarre", () => {
    expect(nextSelection("", "", "2026-05-10")).toEqual({ arrivee: "2026-05-10", depart: "" });
    expect(nextSelection("2026-05-10", "", "2026-05-12")).toEqual({ arrivee: "2026-05-10", depart: "2026-05-12" });
    // clic avant l'arrivée → nouvelle arrivée
    expect(nextSelection("2026-05-10", "", "2026-05-05")).toEqual({ arrivee: "2026-05-05", depart: "" });
    // les deux choisis → on recommence
    expect(nextSelection("2026-05-10", "2026-05-12", "2026-06-01")).toEqual({ arrivee: "2026-06-01", depart: "" });
  });

  it("rangeRole classe start/between/end", () => {
    expect(rangeRole("2026-05-10", "2026-05-12", "2026-05-10")).toBe("start");
    expect(rangeRole("2026-05-10", "2026-05-12", "2026-05-11")).toBe("between");
    expect(rangeRole("2026-05-10", "2026-05-12", "2026-05-12")).toBe("end");
    expect(rangeRole("2026-05-10", "", "2026-05-10")).toBe("start");
    expect(rangeRole("2026-05-10", "", "2026-05-11")).toBeNull();
    expect(rangeRole("2026-05-10", "2026-05-12", "2026-05-13")).toBeNull();
  });
});