// Per-service order instructions.
//
// Imported provider services arrive with a name and nothing else, so the
// customer-facing description is generated here from the platform, the service
// type and the keywords in the name. Steam needs a trade URL, Instagram story
// views need a profile link, YouTube subscribers need a channel link, and so
// on — getting this wrong is the main reason orders fail.
//
// An admin can always override the text per service (Service.description).

export type GuidePlatform =
  | "instagram" | "tiktok" | "youtube" | "facebook" | "twitter" | "telegram" | "spotify"
  | "twitch" | "steam" | "discord" | "soundcloud" | "pinterest" | "linkedin" | "threads"
  | "snapchat" | "reviews" | "website" | "gaming" | "other";

type PlatformDef = { key: GuidePlatform; label: string; match: RegExp };

// Order matters: the first match wins.
const PLATFORMS: PlatformDef[] = [
  { key: "instagram", label: "Instagram", match: /instagram|\bIG\b/i },
  { key: "tiktok", label: "TikTok", match: /tik\s?tok/i },
  { key: "youtube", label: "YouTube", match: /youtube|\bYT\b/i },
  { key: "threads", label: "Threads", match: /threads/i },
  { key: "facebook", label: "Facebook", match: /facebook|\bFB\b/i },
  { key: "twitter", label: "X (Twitter)", match: /twitter|\bx\.com\b|\(x\)|\bX\b(?!\w)/i },
  { key: "telegram", label: "Telegram", match: /telegram/i },
  { key: "spotify", label: "Spotify", match: /spotify/i },
  { key: "soundcloud", label: "SoundCloud", match: /sound\s?cloud/i },
  { key: "twitch", label: "Twitch", match: /twitch|kick\b/i },
  { key: "steam", label: "Steam", match: /steam/i },
  { key: "discord", label: "Discord", match: /discord/i },
  { key: "pinterest", label: "Pinterest", match: /pinterest/i },
  { key: "linkedin", label: "LinkedIn", match: /linked\s?in/i },
  { key: "snapchat", label: "Snapchat", match: /snap\s?chat/i },
  { key: "gaming", label: "Game top-up", match: /pubg|mobile\s?legends|mlbb|free\s?fire|genshin|age\s?of\s?empires|clash\s?of\s?clans|honor\s?of\s?kings|efootball|valorant|roblox|robux|diamonds?|gems?|uc|top[\s-]?up/i },
  { key: "reviews", label: "Reviews", match: /trustpilot|google\s*(maps|business|review)|review/i },
  { key: "website", label: "Website", match: /website|web\s?traffic|\btraffic\b|\bseo\b/i },
];

const GAMES: { re: RegExp; label: string }[] = [
  { re: /pubg/i, label: "PUBG Mobile" },
  { re: /mobile\s?legends|mlbb/i, label: "Mobile Legends" },
  { re: /free\s?fire/i, label: "Free Fire" },
  { re: /genshin/i, label: "Genshin Impact" },
  { re: /age\s?of\s?empires/i, label: "Age of Empires Mobile" },
  { re: /clash\s?of\s?clans/i, label: "Clash of Clans" },
  { re: /honor\s?of\s?kings/i, label: "Honor of Kings" },
  { re: /efootball/i, label: "eFootball" },
  { re: /valorant/i, label: "Valorant" },
  { re: /roblox|robux/i, label: "Roblox" },
];

export function guidePlatformOf(text: string): { key: GuidePlatform; label: string } {
  const found = PLATFORMS.find((p) => p.match.test(text));
  if (!found) return { key: "other" as const, label: "Your account" };
  if (found.key === "gaming") {
    const game = GAMES.find((g) => g.re.test(text));
    return { key: found.key, label: game ? game.label : found.label };
  }
  return { key: found.key, label: found.label };
}

export type LinkKind = {
  /** Short label for the input, e.g. "Video link". */
  label: string;
  /** What the customer must paste, in a sentence. */
  what: string;
  example: string;
  level: "profile" | "post" | "special" | "id";
  /** Optional format check; when it fails the message is shown to the customer. */
  pattern?: RegExp;
  requirements: string[];
};

const has = (name: string, re: RegExp) => re.test(name);

const PUBLIC_PROFILE = "Your profile must be public until the order is complete.";
const KEEP_LINK = "Do not delete the post or make the account private while the order is running.";
const KEEP_PROFILE = "Do not change your username or make the account private while the order is running.";

/** Which link a given service needs. `text` is the service + category name. */
export function linkKindFor(text: string): LinkKind {
  const { key: platform, label } = guidePlatformOf(text);
  const profileType = has(text, /follower|subscriber|member|\bsubs\b/i);
  const story = has(text, /\bstory|stories\b/i);
  const live = has(text, /\blive\b|livestream|live stream/i);

  switch (platform) {
    case "instagram":
      if (story)
        return {
          label: "Profile link",
          what: "your Instagram profile link or username",
          example: "https://www.instagram.com/username/",
          level: "profile",
          requirements: [PUBLIC_PROFILE, "The story must already be posted and stay online until delivery finishes.", "Delivery goes to your most recent story or stories."],
        };
      if (profileType)
        return {
          label: "Profile link",
          what: "your Instagram profile link or username",
          example: "https://www.instagram.com/username/",
          level: "profile",
          requirements: [PUBLIC_PROFILE, KEEP_PROFILE],
        };
      return {
        label: "Post or Reel link",
        what: "the link to the exact post or Reel",
        example: "https://www.instagram.com/p/XXXXXXXXX/",
        level: "post",
        pattern: /instagram\.com\/(?:[^/]+\/)?(?:p|reel|reels|tv)\/[A-Za-z0-9_-]+/i,
        requirements: ["A profile link or username will be rejected for this service.", PUBLIC_PROFILE, KEEP_LINK],
      };

    case "tiktok":
      if (live)
        return {
          label: "Live stream link",
          what: "the link to your live stream",
          example: "https://www.tiktok.com/@username/live",
          level: "special",
          requirements: ["Order only while you are live — delivery cannot start after the stream ends.", PUBLIC_PROFILE],
        };
      if (profileType)
        return {
          label: "Profile link",
          what: "your TikTok profile link or username",
          example: "https://www.tiktok.com/@username",
          level: "profile",
          requirements: [PUBLIC_PROFILE, KEEP_PROFILE],
        };
      return {
        label: "Video link",
        what: "the link to the exact video",
        example: "https://www.tiktok.com/@username/video/7123456789012345678",
        level: "post",
        pattern: /(?:tiktok\.com\/@[^/]+\/(?:video|photo)\/\d+|tiktok\.com\/t\/[A-Za-z0-9]+|v[mt]\.tiktok\.com\/[A-Za-z0-9]+)/i,
        requirements: ["A profile link will be rejected for this service.", "The video must be public and downloads/comments left enabled where relevant.", KEEP_LINK],
      };

    case "youtube":
      if (profileType)
        return {
          label: "Channel link",
          what: "the link to your channel",
          example: "https://www.youtube.com/@channelname",
          level: "profile",
          requirements: ["Use the channel link, not a video link.", "The channel must be public."],
        };
      if (live)
        return {
          label: "Live stream link",
          what: "the link to your live stream",
          example: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
          level: "special",
          requirements: ["Order while the stream is live or scheduled and public.", "Do not restrict the stream to members only."],
        };
      return {
        label: "Video link",
        what: "the link to the exact video or Short",
        example: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
        level: "post",
        pattern: /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/)[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,})/i,
        requirements: ["A channel link will be rejected for this service.", "The video must be public (not private, unlisted or age-restricted).", "Keep likes and comments enabled if you ordered them."],
      };

    case "facebook":
      if (has(text, /group/i))
        return {
          label: "Group link",
          what: "the link to your Facebook group",
          example: "https://www.facebook.com/groups/123456789",
          level: "profile",
          requirements: ["The group must be public and open to join."],
        };
      if (profileType || has(text, /page like/i))
        return {
          label: "Page or profile link",
          what: "the link to your Facebook page or profile",
          example: "https://www.facebook.com/yourpage",
          level: "profile",
          requirements: ["The page or profile must be public.", "Use the page link, not a post link."],
        };
      return {
        label: "Post link",
        what: "the link to the exact post, video or photo",
        example: "https://www.facebook.com/yourpage/posts/123456789",
        level: "post",
        pattern: /(?:facebook\.com\/(?:.+\/(?:posts|videos|reel|photos)\/|watch\/?\?v=|photo\/?\?fbid=|permalink\.php|story\.php|share\/[a-z]\/)|fb\.watch\/)/i,
        requirements: ["The post must be set to Public, not Friends only.", KEEP_LINK],
      };

    case "twitter":
      if (profileType)
        return {
          label: "Profile link",
          what: "your X (Twitter) profile link or @username",
          example: "https://x.com/username",
          level: "profile",
          requirements: ["The account must be public (not protected)."],
        };
      return {
        label: "Post link",
        what: "the link to the exact post",
        example: "https://x.com/username/status/1234567890",
        level: "post",
        pattern: /(?:twitter|x)\.com\/[^/]+\/status\/\d+/i,
        requirements: ["The account must be public (not protected).", KEEP_LINK],
      };

    case "telegram":
      if (profileType)
        return {
          label: "Channel or group link",
          what: "the public link to your channel or group",
          example: "https://t.me/yourchannel",
          level: "profile",
          requirements: ["The channel or group must be public with a @username.", "Private invite links are not supported.", "Do not set a join request or approval requirement."],
        };
      return {
        label: "Post link",
        what: "the link to the exact post",
        example: "https://t.me/yourchannel/123",
        level: "post",
        pattern: /t\.me\/(?:c\/)?[^/]+\/\d+/i,
        requirements: ["The channel must be public.", KEEP_LINK],
      };

    case "spotify":
      if (has(text, /playlist/i))
        return {
          label: "Playlist link",
          what: "the link to your playlist",
          example: "https://open.spotify.com/playlist/XXXXXXXXXXXXXXXXXXXXXX",
          level: "profile",
          requirements: ["The playlist must be public."],
        };
      if (profileType || has(text, /monthly listener|artist/i))
        return {
          label: "Artist profile link",
          what: "the link to your Spotify artist profile",
          example: "https://open.spotify.com/artist/XXXXXXXXXXXXXXXXXXXXXX",
          level: "profile",
          requirements: ["Use the artist profile link, not a track link.", "Copy it from Spotify with Share → Copy link to artist."],
        };
      return {
        label: "Track or album link",
        what: "the link to the exact track or album",
        example: "https://open.spotify.com/track/XXXXXXXXXXXXXXXXXXXXXX",
        level: "post",
        pattern: /open\.spotify\.com\/(?:track|album|playlist|episode)\/[A-Za-z0-9]+/i,
        requirements: ["Copy the link from Spotify with Share → Copy link to song.", "The release must be publicly available in the target regions."],
      };

    case "soundcloud":
      if (profileType)
        return {
          label: "Profile link",
          what: "the link to your SoundCloud profile",
          example: "https://soundcloud.com/username",
          level: "profile",
          requirements: ["The profile must be public."],
        };
      return {
        label: "Track link",
        what: "the link to the exact track",
        example: "https://soundcloud.com/username/track-name",
        level: "post",
        requirements: ["The track must be public, not private or unlisted."],
      };

    case "twitch":
      if (live || has(text, /viewer/i))
        return {
          label: "Channel link",
          what: "the link to your channel",
          example: "https://www.twitch.tv/yourchannel",
          level: "special",
          requirements: ["Start your stream before ordering — viewers can only join a live channel.", "Keep the stream running for the whole duration you ordered."],
        };
      if (profileType)
        return {
          label: "Channel link",
          what: "the link to your channel",
          example: "https://www.twitch.tv/yourchannel",
          level: "profile",
          requirements: ["The channel must be public."],
        };
      return {
        label: "Video or clip link",
        what: "the link to the exact video or clip",
        example: "https://www.twitch.tv/videos/123456789",
        level: "post",
        requirements: ["The video or clip must be public."],
      };

    case "steam":
      if (has(text, /point|award|badge|item|card|gift/i))
        return {
          label: "Steam trade URL",
          what: "your Steam trade URL (or your profile link)",
          example: "https://steamcommunity.com/tradeoffer/new/?partner=XXXXXX&token=YYYYYY",
          level: "special",
          pattern: /steamcommunity\.com\//i,
          requirements: [
            "Find your trade URL in Steam under Inventory → Trade Offers → Who can send me Trade Offers.",
            "Your Steam profile and inventory must be set to Public before delivery.",
            "You must not have a trade ban or trade hold on the account.",
            "You will receive a trade request when the delivery is ready — accept it to complete the order.",
            "We never ask for your Steam login details.",
          ],
        };
      return {
        label: "Steam profile or group link",
        what: "the link to your Steam profile or group",
        example: "https://steamcommunity.com/id/yourprofile",
        level: "profile",
        pattern: /steamcommunity\.com\//i,
        requirements: ["Your Steam profile must be set to Public.", "Custom URL links (/id/name) and numeric links (/profiles/7656…) both work."],
      };

    case "discord":
      if (profileType)
        return {
          label: "Server invite link",
          what: "a permanent invite link to your server",
          example: "https://discord.gg/XXXXXXX",
          level: "special",
          requirements: ["Create an invite that never expires and has no usage limit.", "Do not require membership screening or a verification level that blocks new accounts."],
        };
      return {
        label: "Message link",
        what: "the link to the exact message",
        example: "https://discord.com/channels/000000/111111/222222",
        level: "post",
        requirements: ["The channel must be readable by everyone in the server."],
      };

    case "pinterest":
      if (profileType)
        return {
          label: "Profile link",
          what: "the link to your Pinterest profile",
          example: "https://www.pinterest.com/username/",
          level: "profile",
          requirements: ["The profile must be public."],
        };
      return {
        label: "Pin link",
        what: "the link to the exact pin",
        example: "https://www.pinterest.com/pin/1234567890/",
        level: "post",
        requirements: ["The pin must be public and stay online during delivery."],
      };

    case "linkedin":
      if (profileType)
        return {
          label: "Page or profile link",
          what: "the link to your company page or profile",
          example: "https://www.linkedin.com/company/yourcompany/",
          level: "profile",
          requirements: ["The page or profile must be public."],
        };
      return {
        label: "Post link",
        what: "the link to the exact post",
        example: "https://www.linkedin.com/posts/activity-1234567890",
        level: "post",
        requirements: ["The post must be visible to anyone, not only to connections."],
      };

    case "threads":
      if (profileType)
        return {
          label: "Profile link",
          what: "your Threads profile link or username",
          example: "https://www.threads.net/@username",
          level: "profile",
          requirements: [PUBLIC_PROFILE],
        };
      return {
        label: "Post link",
        what: "the link to the exact post",
        example: "https://www.threads.net/@username/post/XXXXXXXXX",
        level: "post",
        requirements: [PUBLIC_PROFILE, KEEP_LINK],
      };

    case "snapchat":
      return {
        label: "Profile link",
        what: "your Snapchat profile link or username",
        example: "https://www.snapchat.com/add/username",
        level: "profile",
        requirements: ["The account must be public."],
      };

    case "gaming": {
      const noPassword = "We never ask for your game password or login code — only the ID.";
      const checkId = "Check the ID twice: a top-up sent to the wrong ID cannot be recovered or refunded.";
      if (has(text, /mobile\s?legends|mlbb/i))
        return {
          label: "User ID + Zone ID",
          what: "your Mobile Legends User ID with the Zone ID in brackets",
          example: "123456789 (1234)",
          level: "id",
          requirements: [
            "Open the game, tap your avatar and copy the ID shown under your name, e.g. 123456789 (1234).",
            checkId,
            noPassword,
          ],
        };
      if (has(text, /pubg/i))
        return {
          label: "Player ID (UID)",
          what: "your PUBG Mobile numeric player ID",
          example: "5123456789",
          level: "id",
          requirements: [
            "Find the ID in the game under Profile — it is the number below your nickname.",
            checkId,
            noPassword,
          ],
        };
      return {
        label: "Player ID",
        what: "your in-game player ID (UID), exactly as it appears in your profile",
        example: "123456789",
        level: "id",
        requirements: [
          "Copy the ID from your in-game profile, including a server or zone number if the game has one.",
          checkId,
          noPassword,
        ],
      };
    }

    case "reviews":
      return {
        label: "Business page link",
        what: "the link to the page where the reviews should appear",
        example: "https://g.page/your-business or https://www.trustpilot.com/review/yourdomain.com",
        level: "special",
        requirements: ["Send the exact listing link, not a search result.", "The listing must be live and accepting reviews.", "Tell support in advance if you need specific review text."],
      };

    case "website":
      return {
        label: "Page URL",
        what: "the full URL of the page you want traffic on",
        example: "https://yourdomain.com/landing-page",
        level: "special",
        requirements: ["The page must be publicly reachable, with no login wall.", "Do not block the traffic with a firewall rule or aggressive bot protection during delivery."],
      };

    default:
      return {
        label: profileType ? "Profile link" : "Content link",
        what: profileType ? `the link to your ${label.toLowerCase()} profile` : "the link to the exact post or content",
        example: "https://…",
        level: profileType ? "profile" : "post",
        requirements: [PUBLIC_PROFILE, profileType ? KEEP_PROFILE : KEEP_LINK],
      };
  }
}

export type ServiceGuide = {
  platform: GuidePlatform;
  platformLabel: string;
  typeLabel: string;
  /** "Instagram Followers" — the platform is dropped when it repeats the type. */
  heading: string;
  geo: string;
  startTime: string;
  speed: string | null;
  refill: string | null;
  quality: string | null;
  min: number;
  max: number;
  fixedQuantity: number | null;
  link: LinkKind;
  notes: string[];
};

const COUNTRIES = [
  "Arab", "Argentina", "Australia", "Austria", "Bangladesh", "Brazil", "Canada", "China", "Cyprus",
  "Egypt", "France", "Germany", "Greece", "India", "Indonesia", "Iran", "Iraq", "Italy", "Japan",
  "Korea", "Malaysia", "Mexico", "Morocco", "Netherlands", "Nigeria", "Pakistan", "Philippines",
  "Poland", "Portugal", "Romania", "Russia", "Saudi", "Spain", "Sweden", "Thailand", "Turkey",
  "UAE", "UK", "Ukraine", "USA", "Vietnam",
];

/** Everything the order form and the description block need for one service. */
export function buildServiceGuide(service: {
  name: string;
  categoryName?: string;
  min: number;
  max: number;
}): ServiceGuide {
  const text = `${service.categoryName ?? ""} ${service.name}`;
  const { key: platform, label: platformLabel } = guidePlatformOf(text);
  const link = linkKindFor(text);

  const country = COUNTRIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(service.name));
  const geo = country ? `${country} targeted` : has(service.name, /country|targeted|geo/i) ? "Country targeted" : "Global";

  const startMatch = /start[^a-z0-9]{0,3}(\d+\s*-\s*\d+\s*(?:min|mins|minutes|h|hr|hrs|hours))/i.exec(service.name);
  const startTime = startMatch
    ? startMatch[1].replace(/\s+/g, "").replace("-", "–")
    : has(service.name, /instant|\b0-1h\b|super\s?fast/i)
      ? "0–15 minutes"
      : "0–24 hours";

  const speedMatch = /(\d+\s*[kKmM]?\s*(?:\/|per\s*)day)/i.exec(service.name);
  const speed = speedMatch ? speedMatch[1].replace(/\s+/g, "").replace(/per/i, "/") : null;

  const refillMatch = /(?:refill|♻️|r)\s*[:\-]?\s*(\d+)\s*(day|days|d)\b/i.exec(service.name);
  const refill = has(service.name, /no\s*refill/i)
    ? "No refill"
    : refillMatch
      ? `${refillMatch[1]}-day refill`
      : has(service.name, /non[\s-]?drop|no[\s-]?drop/i)
        ? "Non-drop"
        : has(service.name, /lifetime|life\s?time/i)
          ? "Lifetime guarantee"
          : null;

  const quality = has(service.name, /organic|real|influencer|vip|elite/i)
    ? "Organic / real-user sources"
    : has(service.name, /high\s?quality|\bhq\b/i)
      ? "High quality"
      : null;

  let typeLabel = serviceTypeLabel(service.name);
  if (platform === "gaming" && typeLabel === "Engagement") typeLabel = "Top-up";
  const isLiveService = link.level === "special" && /live|viewer/i.test(text);

  const notes: string[] = [];
  if (has(service.name, /drip/i)) notes.push("Drip-feed: the quantity is released in smaller portions over time for a natural curve.");
  if (has(service.name, /slow|gradual/i)) notes.push("Delivery speed is deliberately limited so growth looks measured.");
  if (has(service.name, /power|super\s?fast/i)) notes.push("High-speed service: expect a large volume per day.");
  if (has(service.name, /split/i)) notes.push("Split delivery: the quantity is shared across your most recent posts.");
  if (has(service.name, /future/i)) notes.push("Future posts: each new post you publish receives the service automatically.");
  if (has(service.name, /monetiz/i)) notes.push("Monetization service: it helps you reach platform thresholds. Approval always remains the platform's decision.");
  if (has(service.name, /old\s?account/i)) notes.push("Delivered from aged accounts with an established history.");
  if (platform === "gaming") notes.push("The exact amount delivered is the one written in the service name.");
  const unit = /\[\s*(\d[\d.,]*)\s*(points|coins|hours|minutes|mins|views|members|likes)\s*\]/i.exec(service.name);
  if (unit) notes.push(`One unit delivers ${unit[1]} ${unit[2].toLowerCase()}.`);
  if (has(service.name, /emoji|custom comment/i)) notes.push("Custom content: send the exact text or emojis to support right after ordering.");

  const fixedQuantity = service.min === service.max ? service.min : null;

  return {
    platform,
    platformLabel,
    typeLabel,
    heading:
      platformLabel.toLowerCase() === typeLabel.toLowerCase() || platformLabel.toLowerCase().endsWith(typeLabel.toLowerCase())
        ? platformLabel
        : `${platformLabel} ${typeLabel}`,
    geo,
    startTime: isLiveService ? "While your stream is live" : startTime,
    speed,
    refill,
    quality,
    min: service.min,
    max: service.max,
    fixedQuantity,
    link,
    notes,
  };
}

const TYPE_LABELS: { re: RegExp; label: string }[] = [
  { re: /story|stories/i, label: "Story views" },
  { re: /follower/i, label: "Followers" },
  { re: /subscriber|\bsubs\b/i, label: "Subscribers" },
  { re: /member/i, label: "Members" },
  { re: /\blike/i, label: "Likes" },
  { re: /viewer/i, label: "Live viewers" },
  { re: /\bview/i, label: "Views" },
  { re: /watch\s?time|watch\s?hours/i, label: "Watch time" },
  { re: /comment/i, label: "Comments" },
  { re: /share|repost|retweet/i, label: "Shares" },
  { re: /\bsave/i, label: "Saves" },
  { re: /\bplay|stream/i, label: "Plays" },
  { re: /reaction/i, label: "Reactions" },
  { re: /point/i, label: "Points" },
  { re: /award/i, label: "Awards" },
  { re: /review/i, label: "Reviews" },
  { re: /traffic|visit/i, label: "Visits" },
  { re: /uc/i, label: "UC" },
  { re: /diamond/i, label: "Diamonds" },
  { re: /gems?/i, label: "Gems" },
  { re: /robux/i, label: "Robux" },
  { re: /top[\s-]?up/i, label: "Top-up" },
];

export function serviceTypeLabel(name: string): string {
  return TYPE_LABELS.find((t) => t.re.test(name))?.label ?? "Engagement";
}

/** Plain-text version of the guide, used as the fallback service description. */
export function guideToText(g: ServiceGuide): string {
  const lines = [
    g.heading,
    "",
    `Geo: ${g.geo}`,
    `Start time: ${g.startTime}`,
    ...(g.speed ? [`Speed: ${g.speed}`] : []),
    ...(g.refill ? [`Guarantee: ${g.refill}`] : []),
    ...(g.quality ? [`Quality: ${g.quality}`] : []),
    g.fixedQuantity
      ? `Quantity: fixed at ${g.fixedQuantity.toLocaleString("en-GB")} — enter exactly this amount.`
      : `Min – Max: ${g.min.toLocaleString("en-GB")} – ${g.max.toLocaleString("en-GB")}`,
    "",
    `What to paste: ${g.link.what}.`,
    `Example: ${g.link.example}`,
    "",
    ...g.link.requirements.map((r) => `• ${r}`),
    ...g.notes.map((n) => `• ${n}`),
  ];
  return lines.join("\n");
}
