"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/settings/email", label: "Email", icon: "✉️" },
  { href: "/admin/settings/payments", label: "Payment Gateways", icon: "💳" },
  { href: "/admin/settings/seo", label: "SEO", icon: "🔍" },
  { href: "/admin/settings/livechat", label: "Live Chat", icon: "💬" },
];

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      <div className="mt-4 flex gap-2 border-b border-white/10">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-300 hover:border-brand/50 hover:text-brand"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
