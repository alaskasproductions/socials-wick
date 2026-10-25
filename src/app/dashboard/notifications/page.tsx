import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_NOTIFICATION_META, type CustomerNotificationType } from "@/lib/customer-notify";
import {
  clearReadCustomerNotificationsAction,
  markAllCustomerNotificationsReadAction,
} from "@/lib/actions/customer-notifications";

export const dynamic = "force-dynamic";

function when(date: Date): string {
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default async function CustomerNotificationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [items, unread] = await Promise.all([
    prisma.customerNotification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.customerNotification.count({ where: { userId, readAt: null } }),
  ]);

  async function markAll() {
    "use server";
    await markAllCustomerNotificationsReadAction();
  }

  async function clearRead() {
    "use server";
    await clearReadCustomerNotificationsAction();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          <p className="text-sm text-slate-400">
            Everything that happened on your account: orders, deliveries, refunds and balance.
          </p>
        </div>
        <div className="flex gap-2">
          <form action={markAll}>
            <button
              disabled={unread === 0}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
            >
              Mark all read
            </button>
          </form>
          <form action={clearRead}>
            <button className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400">
              Clear read
            </button>
          </form>
        </div>
      </div>

      <ul className="glass mt-6 divide-y divide-white/5 rounded-xl">
        {items.length === 0 && (
          <li className="px-5 py-10 text-center text-sm text-slate-500">
            Nothing yet. Place an order and you will see its progress here.
          </li>
        )}
        {items.map((n) => {
          const meta =
            CUSTOMER_NOTIFICATION_META[n.type as CustomerNotificationType] ?? CUSTOMER_NOTIFICATION_META.SYSTEM;
          const body = (
            <div className="flex gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base ${meta.className}`}>
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${n.readAt ? "text-slate-300" : "font-semibold text-foreground"}`}>
                  {n.title}
                </p>
                {n.body && <p className="mt-0.5 whitespace-pre-line text-xs text-slate-400">{n.body}</p>}
                <p className="mt-1 text-[11px] text-slate-500">
                  {meta.label} · {when(n.createdAt)}
                </p>
              </div>
              {!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />}
            </div>
          );
          return (
            <li key={n.id} className={n.readAt ? "" : "bg-white/[0.03]"}>
              {n.href ? (
                <Link href={n.href} className="block px-5 py-4 hover:bg-white/5">
                  {body}
                </Link>
              ) : (
                <div className="px-5 py-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
