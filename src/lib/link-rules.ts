// What kind of link a service needs. The rules live in service-guide.ts so the
// customer-facing description and this validation can never disagree.
// Used by the storefront wizard, the dashboard order form and the server.
import { linkKindFor, type LinkKind } from "@/lib/service-guide";

export type LinkLevel = "profile" | "post" | "special";

export type LinkRule = {
  level: LinkLevel;
  /** e.g. "Video link" */
  target: string;
  placeholder: string;
  hint: string;
  requirements: string[];
  /** Returns an error message, or null when the URL is acceptable. */
  check: (url: string) => string | null;
};

export function linkRuleFor(serviceName: string, categoryName: string): LinkRule {
  const kind: LinkKind = linkKindFor(`${categoryName} ${serviceName}`);
  const what = kind.what.charAt(0).toUpperCase() + kind.what.slice(1);

  return {
    level: kind.level,
    target: kind.label,
    placeholder: kind.example,
    requirements: kind.requirements,
    hint: `Paste ${kind.what}. Example: ${kind.example}${kind.requirements.length ? ` — ${kind.requirements[0]}` : ""}`,
    check: (url) => {
      const value = url.trim();
      if (!value) return `${what} is required.`;

      // Profile services also accept a bare @username.
      if (kind.level === "profile" && /^@?[A-Za-z0-9._-]{2,40}$/.test(value)) return null;

      if (!/^https?:\/\/\S+$/i.test(value)) {
        return `Paste the full ${kind.label.toLowerCase()} starting with https:// — for example ${kind.example}`;
      }
      if (kind.pattern && !kind.pattern.test(value)) {
        return `That link does not match this service. It needs ${kind.what} — for example ${kind.example}`;
      }
      return null;
    },
  };
}
