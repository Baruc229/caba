import { NextRequest, NextResponse } from "next/server";
import { sendArrivalReminders, sendDepartureReminders } from "@/lib/services/notifications";
import { syncAllICalSources } from "@/lib/services/ical";
import { expireStaleLocks } from "@/lib/services/availability";

// GET /api/cron — Endpoints pour les jobs periodiques
// Accessible via GET avec un secret pour securiser
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const job = searchParams.get("job");

  // Verifier le secret (a configurer dans CRON_SECRET env var)
  const expectedSecret = process.env.CRON_SECRET || "caba-cron-secret-change-me";
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  switch (job) {
    case "reminders": {
      const [arrivals, departures] = await Promise.all([
        sendArrivalReminders(),
        sendDepartureReminders(),
      ]);
      return NextResponse.json({
        job: "reminders",
        arrivalsSent: arrivals,
        departuresSent: departures,
      });
    }

    case "ical-sync": {
      const result = await syncAllICalSources();
      return NextResponse.json({ job: "ical-sync", ...result });
    }

    case "expire-locks": {
      const expired = await expireStaleLocks();
      return NextResponse.json({ job: "expire-locks", verrousExpires: expired });
    }

    case "all": {
      const [remindersResult, icalResult, locksExpired] = await Promise.all([
        Promise.all([sendArrivalReminders(), sendDepartureReminders()]),
        syncAllICalSources(),
        expireStaleLocks(),
      ]);
      return NextResponse.json({
        job: "all",
        reminders: {
          arrivalsSent: remindersResult[0],
          departuresSent: remindersResult[1],
        },
        ical: icalResult,
        verrousExpires: locksExpired,
      });
    }

    default:
      return NextResponse.json({
        error: "Job inconnu. Utilisez: reminders, ical-sync, expire-locks, all",
      }, { status: 400 });
  }
}
