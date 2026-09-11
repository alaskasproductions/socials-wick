"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

/**
 * Burger menu for the public site header on small screens (hidden from md up).
 * `children` is the server-rendered account block (Login/Register or
 * Dashboard/Logout) shown at the bottom of the panel.
 */
export default function MobileMenu({ links, children }: { links: NavLink[]; children: React.ReactNode }) {
  const pathname = usePathname();
  // The menu is "open on this page"; navigating anywhere closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenOn(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
      >
        <span
          className={`absolute h-0.5 w-5 rounded bg-current transition-transform duration-200 ${open ? "rotate-45" : "-translate-y-1.5"}`}
        />
        <span className={`absolute h-0.5 w-5 rounded bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
        <span
          className={`absolute h-0.5 w-5 rounded bg-current transition-transform duration-200 ${open ? "-rotate-45" : "translate-y-1.5"}`}
        />
      </button>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={close}
            // absolute, not fixed: the header's backdrop-filter makes it the containing block
            className="absolute inset-x-0 top-full z-40 h-[100dvh] bg-black/60"
          />
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-b border-white/10 bg-background px-4 pb-6 pt-2 shadow-2xl shadow-black/60"
          >
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="border-b border-white/5 py-3.5 text-base font-medium text-slate-200 hover:text-brand"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div
              className="mt-5 flex flex-col gap-3"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) close();
              }}
              onSubmit={() => setTimeout(close, 0)}
            >
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
