"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AdminNotificationType } from "@/lib/admin-notify";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export type NotificationItem = {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string; // ISO
};

function serialize(n: {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}): NotificationItem {
  return {
    id: n.id,
    type: n.type as AdminNotificationType,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  };
}

/** Latest notifications + unread count, for the bell dropdown and polling. */
export async function fetchAdminNotifications(limit = 12): Promise<{ items: NotificationItem[]; unread: number }> {
  await requireAdmin();
  const [rows, unread] = await Promise.all([
    prisma.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    prisma.adminNotification.count({ where: { readAt: null } }),
  ]);
  return { items: rows.map(serialize), unread };
}

export async function markNotificationReadAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.adminNotification.updateMany({ where: { id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await requireAdmin();
  await prisma.adminNotification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/admin/notifications");
}

export async function clearReadNotificationsAction(): Promise<void> {
  await requireAdmin();
  await prisma.adminNotification.deleteMany({ where: { readAt: { not: null } } });
  revalidatePath("/admin/notifications");
}
