import { describe, it, expect } from "vitest";
import {
  beninDateTime,
  beninDateString,
  addDaysBenin,
  nightsBetween,
  overlaps,
  minutesFromHHmm,
} from "./datetime-benin";

describe("beninDateTime", () => {
  it("creates correct UTC date from date string and time", () => {
    const d = beninDateTime("2026-09-15", "14:00");
    expect(d.toISOString()).toBe("2026-09-15T14:00:00.000Z");
  });

  it("defaults to midnight when time is null", () => {
    const d = beninDateTime("2026-09-15");
    expect(d.toISOString()).toBe("2026-09-15T00:00:00.000Z");
  });

  it("handles invalid time gracefully", () => {
    const d = beninDateTime("2026-09-15", "not-a-time");
    expect(d.toISOString()).toBe("2026-09-15T00:00:00.000Z");
  });
});

describe("beninDateString", () => {
  it("returns YYYY-MM-DD from Date", () => {
    const d = new Date("2026-09-15T14:00:00Z");
    expect(beninDateString(d)).toBe("2026-09-15");
  });
});

describe("addDaysBenin", () => {
  it("adds days correctly", () => {
    expect(addDaysBenin("2026-09-15", 1)).toBe("2026-09-16");
    expect(addDaysBenin("2026-09-30", 1)).toBe("2026-10-01");
  });

  it("handles month boundaries", () => {
    expect(addDaysBenin("2026-01-01", 31)).toBe("2026-02-01");
    expect(addDaysBenin("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("nightsBetween", () => {
  it("calculates nights correctly", () => {
    const a = beninDateTime("2026-09-15", "14:00");
    const b = beninDateTime("2026-09-17", "11:00");
    expect(nightsBetween(a, b)).toBe(2);
  });

  it("returns 0 for same day", () => {
    const a = beninDateTime("2026-09-15", "14:00");
    const b = beninDateTime("2026-09-15", "18:00");
    expect(nightsBetween(a, b)).toBe(0);
  });
});

describe("overlaps", () => {
  it("detects overlapping intervals", () => {
    expect(overlaps(
      beninDateTime("2026-09-15"), beninDateTime("2026-09-18"),
      beninDateTime("2026-09-17"), beninDateTime("2026-09-20")
    )).toBe(true);
  });

  it("returns false for adjacent non-overlapping intervals", () => {
    expect(overlaps(
      beninDateTime("2026-09-15"), beninDateTime("2026-09-17"),
      beninDateTime("2026-09-17"), beninDateTime("2026-09-20")
    )).toBe(false);
  });

  it("returns true when one interval contains the other", () => {
    expect(overlaps(
      beninDateTime("2026-09-10"), beninDateTime("2026-09-25"),
      beninDateTime("2026-09-15"), beninDateTime("2026-09-18")
    )).toBe(true);
  });
});

describe("minutesFromHHmm", () => {
  it("converts HH:MM to minutes correctly", () => {
    expect(minutesFromHHmm("14:00")).toBe(840);
    expect(minutesFromHHmm("00:00")).toBe(0);
    expect(minutesFromHHmm("23:59")).toBe(1439);
  });

  it("returns null for invalid formats", () => {
    expect(minutesFromHHmm(null)).toBeNull();
    expect(minutesFromHHmm(undefined)).toBeNull();
    expect(minutesFromHHmm("")).toBeNull();
    expect(minutesFromHHmm("9:00")).toBe(540); // 9h = 540 minutes, regex autorise 1-2 chiffres
    expect(minutesFromHHmm("14:0")).toBeNull();
    expect(minutesFromHHmm("14:000")).toBeNull();
  });
});
