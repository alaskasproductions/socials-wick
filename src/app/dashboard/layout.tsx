import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/new-order", label: "New Order", icon: "🛒" },
  { href: "/dashboard/orders", label: "Order History", icon: "📦" },
  { href: "/dashboard/funds", label: "Add Funds", icon: "💳" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/30 backdrop-blur-xl md:flex">
        <Link href="/" className="flex items-center gap-2 border-b border-white/10 px-6 py-5 text-lg font-bold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white text-sm">
            S
          </span>
          Socials <span className="text-brand">Wick</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-brand/10 hover:text-brand"
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
            <button className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Customer Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              Balance: €{(user?.balance ?? 0).toFixed(2)}
            </div>
            <span className="text-sm text-slate-400">{user?.name}</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
