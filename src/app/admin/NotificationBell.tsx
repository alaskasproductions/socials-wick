"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  fetchAdminNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
} from "@/lib/actions/notifications";
import { NOTIFICATION_META } from "@/lib/admin-notify";

const POLL_MS = 30_000;

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default function NotificationBell({
  initialUnread,
  initialItems,
}: {
  initialUnread: number;
  initialItems: NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastUnread = useRef(initialUnread);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAdminNotifications(12);
      setItems(data.items);
      setUnread(data.unread);
      // Title badge + a soft chime when something new arrives while the tab is open.
      if (data.unread > lastUnread.current && typeof document !== "undefined") {
        document.title = `(${data.unread}) ${document.title.replace(/^\(\d+\)\s*/, "")}`;
      }
      lastUnread.current = data.unread;
    } catch {
      // ignore — next poll will retry
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) startTransition(() => void refresh());
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      await refresh();
    });
  }

  function markOne(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    });
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg hover:bg-white/10"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[380px] max-w-[92vw] overflow-hidden rounded-xl border border-white/10 bg-[#0f0b1a] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground">
              Notifications{unread > 0 && <span className="ml-2 text-xs text-slate-400">{unread} unread</span>}
            </span>
            <button
              type="button"
              onClick={markAll}
              disabled={pending || unread === 0}
              className="text-xs font-semibold text-brand hover:underline disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-[420px] divide-y divide-white/5 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-500">Nothing yet.</li>
            )}
            {items.map((n) => {
              const meta = NOTIFICATION_META[n.type] ?? NOTIFICATION_META.SYSTEM;
              const inner = (
                <div className="flex gap-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base ${meta.className}`}>
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${n.read ? "text-slate-300" : "font-semibold text-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                    </div>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-slate-500">
                      {meta.label} · {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.id} className={n.read ? "" : "bg-white/[0.03]"}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => {
                        if (!n.read) markOne(n.id);
                        setOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-white/5"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => !n.read && markOne(n.id)}
                      className="block w-full px-4 py-3 text-left hover:bg-white/5"
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-brand hover:bg-white/5"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
