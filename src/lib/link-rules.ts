// What kind of link a service needs, derived from the platform and the service
// type (followers → profile, likes/views/comments/… → a specific post/video).
// Used by the storefront wizard, the dashboard order form and the server.
import { platformOf, type PlatformKey } from "@/lib/catalog";
import { typeOf } from "@/lib/packages";

export type LinkLevel = "profile" | "post";

export type LinkRule = {
  level: LinkLevel;
  /** e.g. "video link" */
  target: string;
  placeholder: string;
  hint: string;
  /** Returns an error message, or null when the URL is acceptable. */
  check: (url: string) => string | null;
};

const PROFILE_TYPES = new Set(["followers", "subscribers", "members", "viewers"]);

const POST_PATTERNS: Record<PlatformKey, { re: RegExp; target: string; example: string }> = {
  instagram: {
    re: /instagram\.com\/(?:[^/]+\/)?(?:p|reel|reels|tv)\/[A-Za-z0-9_-]+/i,
    target: "post or reel link",
    example: "https://www.instagram.com/p/XXXXXXXXX/",
  },
  tiktok: {
    re: /(?:tiktok\.com\/@[^/]+\/(?:video|photo)\/\d+|tiktok\.com\/t\/[A-Za-z0-9]+|vm\.tiktok\.com\/[A-Za-z0-9]+|vt\.tiktok\.com\/[A-Za-z0-9]+)/i,
    target: "video link",
    example: "https://www.tiktok.com/@username/video/7123456789012345678",
  },
  youtube: {
    re: /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/)[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,})/i,
    target: "video link",
    example: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  },
  facebook: {
    re: /(?:facebook\.com\/(?:.+\/(?:posts|videos|reel|photos)\/|watch\/?\?v=|photo\/?\?fbid=|permalink\.php|story\.php|share\/[a-z]\/)|fb\.watch\/)/i,
    target: "post, video or photo link",
    example: "https://www.facebook.com/username/posts/123456789",
  },
  twitter: {
    re: /(?:twitter|x)\.com\/[^/]+\/status\/\d+/i,
    target: "post (tweet) link",
    example: "https://x.com/username/status/1234567890",
  },
  telegram: {
    re: /t\.me\/(?:c\/)?[^/]+\/\d+/i,
    target: "post link",
    example: "https://t.me/channel/123",
  },
  twitch: {
    re: /twitch\.tv\/(?:videos\/\d+|[^/]+\/clip\/|clips\.twitch\.tv)/i,
    target: "video or clip link",
    example: "https://www.twitch.tv/videos/123456789",
  },
  spotify: {
    re: /open\.spotify\.com\/(?:track|album|playlist|episode)\/[A-Za-z0-9]+/i,
    target: "track, album or playlist link",
    example: "https://open.spotify.com/track/XXXXXXXXXXXXXXXXXXXXXX",
  },
  other: {
    re: /^https?:\/\/[^/]+\/.+/i,
    target: "link to the specific content",
    example: "https://…/the-post",
  },
};

export function linkRuleFor(serviceName: string, categoryName: string): LinkRule {
  const platform = platformOf(`${categoryName} ${serviceName}`);
  const type = typeOf(serviceName);
  const level: LinkLevel = !type || PROFILE_TYPES.has(type.key) ? "profile" : "post";
  const platformLabel = platform === "other" ? "" : platform.charAt(0).toUpperCase() + platform.slice(1);

  if (level === "profile") {
    return {
      level,
      target: "profile link",
      placeholder: "@username or profile link",
      hint: `Enter your ${platformLabel || "account"} username or the full link to your profile/channel — not a post. The account must be public until the order completes.`,
      check: (url) => {
        if (!/^https?:\/\/\S+$/i.test(url)) return "Enter a valid profile link or username.";
        return null;
      },
    };
  }

  const p = POST_PATTERNS[platform];
  return {
    level,
    target: p.target,
    placeholder: p.example,
    hint: `This service is delivered to a specific ${p.target.replace(" link", "")}, so paste the full ${p.target} — a profile link or username will be rejected by the provider and the order cancelled. Example: ${p.example}`,
    check: (url) => {
      if (!/^https?:\/\/\S+$/i.test(url)) return `Paste the full ${p.target} (starting with https://).`;
      if (!p.re.test(url)) {
        return `That looks like a profile or an unsupported link. This service needs a ${p.target}, e.g. ${p.example}`;
      }
      return null;
    },
  };
}
