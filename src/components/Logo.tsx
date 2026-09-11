// SocialsWick brand logo: a rounded purple outline triangle plus the
// "SocialsWick" wordmark set in Unbounded Bold (loaded in the root layout as
// the `font-logo` Tailwind family). Use <Logo /> everywhere the brand appears
// so the navbar, footer and panel sidebars stay identical.

const BRAND = "#a855f7";

export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0,-30 L32,24 L-32,24 Z"
        transform="translate(0,2)"
        fill="none"
        stroke={BRAND}
        strokeWidth={13}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const mark = size === "sm" ? 24 : 28;
  const text = size === "sm" ? "text-[15px]" : "text-[16px] sm:text-[18px]";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={mark} />
      <span className={`font-logo font-bold leading-none tracking-[-0.02em] ${text}`}>
        Socials<span className="text-brand">Wick</span>
      </span>
    </span>
  );
}
