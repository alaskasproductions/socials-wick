// Builds the landing-page storefront (platform sections, service types and
// package cards) from the live catalog. Pure functions — safe on server and client.
import { PLATFORMS, TIERS, displayName, platformOf, serviceTier, type PlatformKey, type Tier } from "@/lib/catalog";

export type StoreService = {
  id: string;
  name: string;
  categoryName: string;
  rate: number; // € per 1000
  min: number;
  max: number;
  tier: Tier;
};

export type ServiceType = {
  key: string;
  label: string; // e.g. "Followers"
  icon: string;
  service: StoreService; // default (cheapest) service for this platform+type
  options: StoreService[]; // every service of this type, ordered basic → medium → elite
  packages: Package[];
};

const TIER_ORDER: Tier[] = ["basic", "medium", "elite", "standard"];

/** Short label for a quality option, e.g. "🟢 Medium". */
export function tierLabel(tier: Tier): string {
  const t = TIERS[tier];
  return t.dot ? `${t.dot} ${t.label}` : t.label;
}

export function sortByTier<T extends { tier: Tier; rate: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.rate - b.rate
  );
}

export type Package = {
  quantity: number;
  price: number;
  compareAt: number;
  saving: number;
  bestOffer: boolean;
};

export type PlatformSection = {
  key: PlatformKey;
  label: string;
  icon: string;
  types: ServiceType[];
};

/** Marketing "was" price shown struck through on package cards (10% above). */
export const COMPARE_AT_MULTIPLIER = 1.1;

const TYPES: { key: string; label: string; icon: string; match: RegExp }[] = [
  { key: "followers", label: "Followers", icon: "👤", match: /follower/i },
  { key: "subscribers", label: "Subscribers", icon: "🔔", match: /subscriber/i },
  { key: "members", label: "Members", icon: "👥", match: /member/i },
  { key: "likes", label: "Likes", icon: "❤️", match: /\blike/i },
  { key: "views", label: "Views", icon: "👁️", match: /\bview(s)?\b(?!er)/i },
  { key: "viewers", label: "Viewers", icon: "📺", match: /viewer/i },
  { key: "comments", label: "Comments", icon: "💬", match: /comment/i },
  { key: "shares", label: "Shares", icon: "↗️", match: /share|repost|retweet/i },
  { key: "plays", label: "Plays", icon: "▶️", match: /\bplay/i },
  { key: "saves", label: "Saves", icon: "🔖", match: /\bsave/i },
  { key: "reactions", label: "Reactions", icon: "🔥", match: /reaction/i },
];

const QUANTITY_LADDER = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

export function typeOf(serviceName: string): { key: string; label: string; icon: string } | null {
  const t = TYPES.find((t) => t.match.test(serviceName));
  return t ? { key: t.key, label: t.label, icon: t.icon } : null;
}

export function priceFor(rate: number, quantity: number): number {
  return Math.round((quantity / 1000) * rate * 100) / 100;
}

export function buildPackages(service: StoreService): Package[] {
  let quantities = QUANTITY_LADDER.filter((q) => q >= service.min && q <= service.max);
  if (quantities.length < 2) {
    quantities = [service.min, service.min * 5, service.min * 10, service.min * 50].filter(
      (q) => q <= service.max
    );
  }
  // Spread up to 4 cards across the available range.
  if (quantities.length > 4) {
    const picks = [0, Math.floor(quantities.length / 3), Math.floor((2 * quantities.length) / 3), quantities.length - 1];
    quantities = [...new Set(picks.map((i) => quantities[i]))];
  }
  return quantities.map((quantity, i) => {
    const price = priceFor(service.rate, quantity);
    const compareAt = Math.round(price * COMPARE_AT_MULTIPLIER * 100) / 100;
    return {
      quantity,
      price,
      compareAt,
      saving: Math.round((compareAt - price) * 100) / 100,
      bestOffer: i === Math.min(1, quantities.length - 1),
    };
  });
}

export function buildStorefront(input: Omit<StoreService, "tier">[]): PlatformSection[] {
  // Every active service grouped by (platform, type); the cheapest is the default.
  const groups = new Map<
    string,
    { platform: PlatformKey; type: NonNullable<ReturnType<typeof typeOf>>; services: StoreService[] }
  >();
  for (const raw of input) {
    const platform = platformOf(`${raw.categoryName} ${raw.name}`);
    if (platform === "other") continue;
    const type = typeOf(raw.name);
    if (!type) continue;
    const s: StoreService = {
      ...raw,
      tier: serviceTier(raw.name, raw.categoryName),
      name: displayName(raw.name),
    };
    const key = `${platform}:${type.key}`;
    const g = groups.get(key);
    if (g) g.services.push(s);
    else groups.set(key, { platform, type, services: [s] });
  }

  const sections: PlatformSection[] = [];
  for (const p of PLATFORMS) {
    if (p.key === "other") continue;
    const types = [...groups.values()]
      .filter((g) => g.platform === p.key)
      .sort((a, b) => TYPES.findIndex((t) => t.key === a.type.key) - TYPES.findIndex((t) => t.key === b.type.key))
      .map((g) => {
        const options = sortByTier(g.services);
        const service = [...options].sort((a, b) => a.rate - b.rate)[0];
        return {
          key: g.type.key,
          label: g.type.label,
          icon: g.type.icon,
          service,
          options,
          packages: buildPackages(service),
        };
      })
      .filter((t) => t.packages.length > 0);
    if (types.length > 0) sections.push({ key: p.key, label: p.label, icon: p.icon, types });
  }
  return sections;
}

/** Turns a bare username into the platform's profile URL; leaves URLs alone. */
export function normalizeLink(platform: PlatformKey, input: string): string {
  const raw = input.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(raw)) return `https://${raw}`;
  const user = raw.replace(/^@/, "");
  if (!user) return "";
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${user}`;
    case "tiktok":
      return `https://tiktok.com/@${user}`;
    case "youtube":
      return `https://youtube.com/@${user}`;
    case "telegram":
      return `https://t.me/${user}`;
    case "facebook":
      return `https://facebook.com/${user}`;
    case "twitter":
      return `https://x.com/${user}`;
    case "twitch":
      return `https://twitch.tv/${user}`;
    case "spotify":
      return `https://open.spotify.com/artist/${user}`;
    default:
      return raw;
  }
}
