import { prisma } from "@/lib/prisma";

// ─── Parseur iCal basique ─────────────────────────

interface ICalEvent {
  uid: string;
  dtstart: Date;
  dtend: Date;
  summary: string;
  status: string;
}

function parseICalDate(dateStr: string): Date {
  // Format : 20260815T120000Z ou 20260815
  const cleaned = dateStr.replace("Z", "").replace(/[^0-9T]/g, "");
  if (cleaned.length === 8) {
    const y = parseInt(cleaned.slice(0, 4));
    const m = parseInt(cleaned.slice(4, 6)) - 1;
    const d = parseInt(cleaned.slice(6, 8));
    return new Date(Date.UTC(y, m, d));
  }
  const y = parseInt(cleaned.slice(0, 4));
  const m = parseInt(cleaned.slice(4, 6)) - 1;
  const d = parseInt(cleaned.slice(6, 8));
  const h = parseInt(cleaned.slice(9, 11)) || 0;
  const min = parseInt(cleaned.slice(11, 13)) || 0;
  const s = parseInt(cleaned.slice(13, 15)) || 0;
  return new Date(Date.UTC(y, m, d, h, min, s));
}

export function parseICalContent(content: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = content.replace(/\r\n /g, "").split(/\r?\n/);

  let currentEvent: Partial<ICalEvent> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "BEGIN:VEVENT") {
      currentEvent = {};
    } else if (trimmed === "END:VEVENT" && currentEvent?.uid) {
      if (currentEvent.dtstart && currentEvent.dtend) {
        events.push(currentEvent as ICalEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (trimmed.startsWith("UID:")) {
        currentEvent.uid = trimmed.slice(4);
      } else if (trimmed.startsWith("DTSTART")) {
        const value = trimmed.includes(":") ? trimmed.split(":").pop()! : "";
        currentEvent.dtstart = parseICalDate(value);
      } else if (trimmed.startsWith("DTEND")) {
        const value = trimmed.includes(":") ? trimmed.split(":").pop()! : "";
        currentEvent.dtend = parseICalDate(value);
      } else if (trimmed.startsWith("SUMMARY:")) {
        currentEvent.summary = trimmed.slice(8);
      } else if (trimmed.startsWith("STATUS:")) {
        currentEvent.status = trimmed.slice(7);
      }
    }
  }

  return events;
}

// ─── Import iCal ─────────────────────────────────

export async function importICal(propertyId: string, url: string): Promise<{
  success: boolean;
  eventsCount: number;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CabaResidence-iCal/1.0" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { success: false, eventsCount: 0, error: `HTTP ${response.status}` };
    }

    const content = await response.text();
    const events = parseICalContent(content);

    let imported = 0;

    for (const event of events) {
      const existing = await prisma.disponibilite.findFirst({
        where: {
          propertyId,
          source: "ical",
          date: { gte: event.dtstart, lt: event.dtend },
        },
      });

      if (!existing) {
        const days = Math.ceil(
          (event.dtend.getTime() - event.dtstart.getTime()) / (1000 * 60 * 60 * 24)
        );

        for (let i = 0; i < days; i++) {
          const date = new Date(event.dtstart);
          date.setDate(date.getDate() + i);

          const dayExists = await prisma.disponibilite.findFirst({
            where: { propertyId, date, source: "ical" },
          });

          if (!dayExists) {
            await prisma.disponibilite.create({
              data: {
                propertyId,
                date,
                statut: "reserve",
                source: "ical",
              },
            });
            imported++;
          }
        }
      }
    }

    return { success: true, eventsCount: imported };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, eventsCount: 0, error: msg };
  }
}

// ─── Export iCal ─────────────────────────────────

export async function exportICal(propertyId: string): Promise<string> {
  const reservations = await prisma.booking.findMany({
    where: {
      propertyId,
      statut: { in: ["confirmee", "payee", "modifiee"] },
    },
    select: {
      numero: true,
      dateArrivee: true,
      dateDepart: true,
      statut: true,
    },
  });

  const blocages = await prisma.disponibilite.findMany({
    where: {
      propertyId,
      statut: { in: ["bloque", "maintenance"] },
    },
    select: {
      date: true,
      statut: true,
    },
  });

  const now = new Date();
  const dtstamp = formatICalDate(now);

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Caba Residence//iCal Export//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const r of reservations) {
    const dtstart = formatICalDate(r.dateArrivee);
    const dtend = formatICalDate(r.dateDepart);
    const uid = `${r.numero}@caba-residence.com`;

    ical.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:Caba Residence - ${r.numero}`,
      `DESCRIPTION:Reservation ${r.numero} - ${r.statut}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }

  for (const b of blocages) {
    const dateStr = formatDateOnly(b.date);
    const nextDay = new Date(b.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = formatDateOnly(nextDay);
    const uid = `block-${dateStr}-${b.statut}@caba-residence.com`;

    ical.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextDayStr}`,
      `SUMMARY:Blocked - ${b.statut}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }

  ical.push("END:VCALENDAR");

  return ical.join("\r\n");
}

function formatICalDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}T000000Z`;
}

function formatDateOnly(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// ─── Sync periodique ─────────────────────────────

export async function syncAllICalSources(): Promise<{
  synced: number;
  errors: string[];
}> {
  const sources = await prisma.synchronisationICal.findMany({
    where: {
      typeSync: "import",
      statut: { not: "desactivee" },
    },
  });

  let synced = 0;
  const errors: string[] = [];

  for (const source of sources) {
    const result = await importICal(source.propertyId, source.urlSource);

    if (result.success) {
      await prisma.synchronisationICal.update({
        where: { id: source.id },
        data: {
          derniereSync: new Date(),
          statut: "active",
          messageErreur: null,
        },
      });
      synced += result.eventsCount;
    } else {
      await prisma.synchronisationICal.update({
        where: { id: source.id },
        data: {
          statut: "erreur",
          messageErreur: result.error || "Erreur inconnue",
        },
      });
      errors.push(`${source.propertyId}: ${result.error}`);
    }
  }

  return { synced, errors };
}
