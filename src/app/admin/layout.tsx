import Link from "next/link";
import Logo from "@/components/Logo";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NotificationBell from "./NotificationBell";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/services", label: "Services", icon: "🛍️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/funds", label: "Fund Requests", icon: "💳" },
  { href: "/admin/articles", label: "Articles", icon: "📝" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { href: "/admin/provider", label: "Provider (MTP)", icon: "🔌" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

// Every admin page reads live data from the database; never prerender them at build time.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [unread, latest] = await Promise.all([
    prisma.adminNotification.count({ where: { readAt: null } }),
    prisma.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  const initialItems = latest.map((n) => ({
    id: n.id,
    type: n.type as import("@/lib/admin-notify").AdminNotificationType,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl text-white md:flex">
        <Link href="/" aria-label="SocialsWick home" className="flex items-center border-b border-white/10 px-6 py-5 text-white">
          <Logo size="sm" />
        </Link>
        <div className="px-6 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Admin Panel
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell initialUnread={unread} initialItems={initialItems} />
            <Link href="/" className="text-sm font-medium text-brand hover:underline">
              View site →
            </Link>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
