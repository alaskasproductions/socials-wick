import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white text-sm">
                S
              </span>
              Socials <span className="text-brand">Wick</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              The fast, affordable SMM panel for creators, agencies and resellers worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#faq" className="hover:text-brand">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-brand">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-brand">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/login" className="hover:text-brand">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-brand">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <p className="mt-3 text-sm text-slate-400">24/7 support for all your campaigns.</p>
            <p className="mt-1 text-sm text-slate-400">support@socialswick.com</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Socials Wick. All rights reserved.</span>
          <span className="flex gap-4">
            <Link href="/terms" className="hover:text-brand">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-brand">
              Privacy
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
