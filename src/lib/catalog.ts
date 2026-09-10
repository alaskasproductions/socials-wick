// Presentation helpers for the service catalog. Category names imported from
// the provider carry a colour emoji (🔵/🟢/🟡) that encodes the quality tier,
// plus the provider's own branding — customers only ever see our brand.

export type Tier = "elite" | "medium" | "basic" | "standard";

export const TIERS: Record<Tier, { label: string; dot: string; description: string; className: string }> = {
  elite: {
    label: "Elite",
    dot: "🔵",
    description: "Best-in-class, organic methods, no drops.",
    className: "bg-sky-500/15 text-sky-300",
  },
  medium: {
    label: "Medium",
    dot: "🟢",
    description: "Quality meets reliability — tested for retention.",
    className: "bg-emerald-500/15 text-emerald-300",
  },
  basic: {
    label: "Basic",
    dot: "🟡",
    description: "Most affordable; drops or slowdowns can occur.",
    className: "bg-amber-500/15 text-amber-300",
  },
  standard: {
    label: "Standard",
    dot: "",
    description: "Regular services without a tier marker.",
    className: "bg-white/10 text-slate-300",
  },
};

export function tierOf(name: string): Tier {
  const head = name.trim().slice(0, 4);
  if (head.includes("🔵")) return "elite";
  if (head.includes("🟢")) return "medium";
  if (head.includes("🟡")) return "basic";
  return "standard";
}

/**
 * Tier of a service: its own emoji wins, otherwise the category's. Provider
 * catalogs put the colour on the service name (e.g. "🔵 Bluesky Real Likes")
 * and only sometimes on the category.
 */
export function serviceTier(serviceName: string, categoryName: string): Tier {
  const own = tierOf(serviceName);
  return own !== "standard" ? own : tierOf(categoryName);
}

/** Category tier: its own emoji, else the most common tier of its services. */
export function categoryTier(categoryName: string, serviceNames: string[]): Tier {
  const own = tierOf(categoryName);
  if (own !== "standard") return own;
  const counts = new Map<Tier, number>();
  for (const n of serviceNames) {
    const t = tierOf(n);
    if (t !== "standard") counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: Tier = "standard";
  let bestCount = 0;
  for (const [t, c] of counts) {
    if (c > bestCount) {
      best = t;
      bestCount = c;
    }
  }
  return best;
}

/** Strips the tier emoji and rebrands provider names for display. */
export function displayName(name: string): string {
  return name
    .replace(/^[\s🔵🟢🟡🦆]+/u, "")
    .replace(/MoreThanPanel/gi, "SocialsWick")
    .replace(/\bMTP\b/g, "SocialsWick")
    .replace(/\s+\|\s*$/, "")
    .trim();
}

export const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: "📸", match: /instagram|\big\b/i },
  { key: "tiktok", label: "TikTok", icon: "🎵", match: /tik\s?tok/i },
  { key: "youtube", label: "YouTube", icon: "▶️", match: /youtube|\byt\b/i },
  { key: "telegram", label: "Telegram", icon: "📢", match: /telegram/i },
  { key: "facebook", label: "Facebook", icon: "👍", match: /facebook|\bfb\b/i },
  { key: "twitter", label: "X / Twitter", icon: "🐦", match: /twitter|\bx\b|\(x\)/i },
  { key: "spotify", label: "Spotify", icon: "🎧", match: /spotify/i },
  { key: "twitch", label: "Twitch", icon: "🎮", match: /twitch|kick\b|streamer/i },
  { key: "other", label: "Other", icon: "⭐", match: /$^/ },
] as const;

export type PlatformKey = (typeof PLATFORMS)[number]["key"];

export function platformOf(name: string): PlatformKey {
  for (const p of PLATFORMS) {
    if (p.key !== "other" && p.match.test(name)) return p.key;
  }
  return "other";
}

/** Service-type keywords a customer can filter by (mirrors the tier explanations). */
export const SERVICE_KINDS = [
  { key: "instant", label: "Instant Start", match: /instant|fast|power|super\s?fast/i },
  { key: "nondrop", label: "Non-Drop", match: /non[\s-]?drop|no[\s-]?drop|lifetime|not affected/i },
  { key: "organic", label: "Organic", match: /organic|real|influencer|vip|elite/i },
  { key: "targeted", label: "Country Targeted", match: /country|targeted|geo/i },
  { key: "dripfeed", label: "Drip-Feed / Slow", match: /drip|slow|gradual/i },
] as const;

export type ServiceKindKey = (typeof SERVICE_KINDS)[number]["key"];
