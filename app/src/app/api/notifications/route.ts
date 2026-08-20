import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import {
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/services/notifications";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — Liste des notifications + compteur
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const unreadOnly = searchParams.get("unread") === "true";

  const where: Record<string, unknown> = { utilisateurId: session.user.id };
  if (unreadOnly) where.lue = false;

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { utilisateurId: session.user.id, lue: false },
    }),
  ]);

  return NextResponse.json({
    notifications,
    total,
    unread,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// PATCH /api/notifications — Marquer comme lu
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const { action, notificationId } = body;

  if (action === "readAll") {
    await markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  }

  if (action === "read" && notificationId) {
    await markAsRead(notificationId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
