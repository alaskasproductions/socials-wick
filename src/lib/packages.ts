// Builds the landing-page storefront (platform sections, service types and
// package cards) from the live catalog. Pure functions — safe on server and client.
import { PLATFORMS, displayName, platformOf, type PlatformKey } from "@/lib/catalog";

export type StoreService = {
  id: string;
  name: string;
  categoryName: string;
  rate: number; // € per 1000
  min: number;
  max: number;
};

export type ServiceType = {
  key: string;
  label: string; // e.g. "Followers"
  icon: string;
  service: StoreService; // the representative (cheapest) service for this platform+type
  packages: Package[];
};

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

export function buildStorefront(services: StoreService[]): PlatformSection[] {
  // Cheapest active service per (platform, type).
  const best = new Map<string, { platform: PlatformKey; type: NonNullable<ReturnType<typeof typeOf>>; service: StoreService }>();
  for (const s of services) {
    const platform = platformOf(`${s.categoryName} ${s.name}`);
    if (platform === "other") continue;
    const type = typeOf(s.name);
    if (!type) continue;
    const key = `${platform}:${type.key}`;
    const current = best.get(key);
    if (!current || s.rate < current.service.rate) best.set(key, { platform, type, service: s });
  }

  const sections: PlatformSection[] = [];
  for (const p of PLATFORMS) {
    if (p.key === "other") continue;
    const types = [...best.values()]
      .filter((b) => b.platform === p.key)
      .sort((a, b) => TYPES.findIndex((t) => t.key === a.type.key) - TYPES.findIndex((t) => t.key === b.type.key))
      .map((b) => ({
        key: b.type.key,
        label: b.type.label,
        icon: b.type.icon,
        service: { ...b.service, name: displayName(b.service.name) },
        packages: buildPackages(b.service),
      }))
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
