import Link from "next/link";
import { signOut } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/services", label: "Services", icon: "🛍️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/funds", label: "Fund Requests", icon: "💳" },
  { href: "/admin/provider", label: "Provider (MTP)", icon: "🔌" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl text-white md:flex">
        <Link href="/" className="flex items-center gap-2 border-b border-white/10 px-6 py-5 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white text-sm">
            S
          </span>
          Socials <span className="text-violet-300">Wick</span>
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
          <Link href="/" className="text-sm font-medium text-brand hover:underline">
            View site →
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
