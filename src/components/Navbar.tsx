import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import Logo from "@/components/Logo";
import MobileMenu from "@/components/MobileMenu";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default async function Navbar() {
  const session = await auth();
  const panelHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
  const panelLabel = session?.user?.role === "ADMIN" ? "Admin Panel" : "Dashboard";

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl [--header-h:64px] md:[--header-h:72px]">
      <div className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="SocialsWick home" className="flex shrink-0 items-center text-foreground">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              <Link
                href={panelHref}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/8"
              >
                {panelLabel}
              </Link>
              <form action={logout}>
                <button className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/8"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger menu */}
        <MobileMenu links={LINKS}>
          {session?.user ? (
            <>
              <Link
                href={panelHref}
                className="rounded-lg bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                {panelLabel}
              </Link>
              <form action={logout}>
                <button className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                Login
              </Link>
            </>
          )}
        </MobileMenu>
      </div>
    </header>
  );
}
