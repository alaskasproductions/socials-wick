"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeCustomerNotification, type CustomerNotificationItem } from "@/lib/customer-notify";

async function requireCustomer(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Forbidden");
  return session.user.id;
}

/** Latest notifications + unread count for the bell. */
export async function fetchCustomerNotifications(
  limit = 12
): Promise<{ items: CustomerNotificationItem[]; unread: number }> {
  const userId = await requireCustomer();
  const [rows, unread] = await Promise.all([
    prisma.customerNotification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit }),
    prisma.customerNotification.count({ where: { userId, readAt: null } }),
  ]);
  return { items: rows.map(serializeCustomerNotification), unread };
}

export async function markCustomerNotificationReadAction(id: string): Promise<void> {
  const userId = await requireCustomer();
  await prisma.customerNotification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/dashboard/notifications");
}

export async function markAllCustomerNotificationsReadAction(): Promise<void> {
  const userId = await requireCustomer();
  await prisma.customerNotification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/dashboard/notifications");
}

export async function clearReadCustomerNotificationsAction(): Promise<void> {
  const userId = await requireCustomer();
  await prisma.customerNotification.deleteMany({ where: { userId, readAt: { not: null } } });
  revalidatePath("/dashboard/notifications");
}
