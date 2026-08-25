import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">S</span>
          Socials <span className="text-brand">Wick</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          <Link href="/services" className="hover:text-brand">
            Services
          </Link>
          <Link href="/#how-it-works" className="hover:text-brand">
            How It Works
          </Link>
          <Link href="/#faq" className="hover:text-brand">
            FAQ
          </Link>
          <Link href="/terms" className="hover:text-brand">
            Terms
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/8"
              >
                {session.user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
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
      </div>
    </header>
  );
}
