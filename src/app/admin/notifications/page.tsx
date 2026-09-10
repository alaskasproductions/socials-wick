import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NOTIFICATION_META, type AdminNotificationType } from "@/lib/admin-notify";
import {
  clearReadNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; unread?: string }>;
}) {
  const { type, unread } = await searchParams;
  const typeFilter = type && type in NOTIFICATION_META ? (type as AdminNotificationType) : undefined;

  const [items, unreadCount, total] = await Promise.all([
    prisma.adminNotification.findMany({
      where: { ...(typeFilter ? { type: typeFilter } : {}), ...(unread ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.adminNotification.count({ where: { readAt: null } }),
    prisma.adminNotification.count(),
  ]);

  const filterLink = (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/notifications${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          <p className="mt-1 text-sm text-slate-400">
            {unreadCount} unread · {total} total. Orders, payments, fund requests, sign-ups and provider
            status changes land here (and in the bell at the top).
          </p>
        </div>
        <div className="flex gap-2">
          <form action={markAllNotificationsReadAction}>
            <button
              disabled={unreadCount === 0}
              className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
            >
              Mark all read
            </button>
          </form>
          <form action={clearReadNotificationsAction}>
            <button className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
              Clear read
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={filterLink({ unread })}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${!typeFilter ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
        >
          All types
        </Link>
        {(Object.keys(NOTIFICATION_META) as AdminNotificationType[]).map((t) => (
          <Link
            key={t}
            href={filterLink({ type: t, unread })}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${typeFilter === t ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            {NOTIFICATION_META[t].icon} {NOTIFICATION_META[t].label}
          </Link>
        ))}
        <Link
          href={filterLink({ type: typeFilter, unread: unread ? undefined : "1" })}
          className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${unread ? "bg-white/15 text-foreground" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
        >
          Unread only
        </Link>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <ul className="divide-y divide-white/5">
          {items.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-slate-500">No notifications match.</li>
          )}
          {items.map((n) => {
            const meta = NOTIFICATION_META[n.type as AdminNotificationType] ?? NOTIFICATION_META.SYSTEM;
            const isRead = n.readAt !== null;
            return (
              <li key={n.id} className={`flex gap-4 px-5 py-4 ${isRead ? "" : "bg-white/[0.03]"}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg ${meta.className}`}>
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className={`text-sm ${isRead ? "text-slate-300" : "font-semibold text-foreground"}`}>
                      {n.href ? (
                        <Link href={n.href} className="hover:underline">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                    </p>
                    <span className="text-xs text-slate-500" title={n.createdAt.toLocaleString("en-GB")}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  {n.body && <p className="mt-1 whitespace-pre-line text-sm text-slate-400">{n.body}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-slate-500">{meta.label}</span>
                    {n.href && (
                      <Link href={n.href} className="font-semibold text-brand hover:underline">
                        Open →
                      </Link>
                    )}
                    {!isRead && (
                      <form action={markNotificationReadAction.bind(null, n.id)}>
                        <button className="font-semibold text-slate-400 hover:text-foreground hover:underline">
                          Mark read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
