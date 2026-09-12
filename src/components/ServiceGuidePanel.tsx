import type { ServiceGuide } from "@/lib/service-guide";

// The "Description" block shown wherever a service is selected: what the
// service delivers, how fast, and exactly which link the customer must paste.
// An admin-written description (Service.description) replaces the generated
// summary but keeps the link instructions.

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span aria-hidden="true">{icon}</span>
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  );
}

export default function ServiceGuidePanel({
  guide,
  adminText,
  compact = false,
}: {
  guide: ServiceGuide;
  adminText?: string;
  compact?: boolean;
}) {
  const n = (v: number) => v.toLocaleString("en-GB");

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed">
      {!compact && (
        <p className="text-sm font-semibold text-foreground">{guide.heading}</p>
      )}

      {adminText ? (
        <p className="mt-2 whitespace-pre-line text-slate-300">{adminText}</p>
      ) : (
        !compact && (
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            <Row icon="🌍" label="Geo" value={guide.geo} />
            <Row icon="⏱️" label="Start time" value={guide.startTime} />
            {guide.speed && <Row icon="⚡" label="Speed" value={guide.speed} />}
            {guide.refill && <Row icon="♻️" label="Guarantee" value={guide.refill} />}
            {guide.quality && <Row icon="✨" label="Quality" value={guide.quality} />}
            <Row
              icon="🔢"
              label={guide.fixedQuantity ? "Quantity" : "Min – Max"}
              value={guide.fixedQuantity ? `exactly ${n(guide.fixedQuantity)}` : `${n(guide.min)} – ${n(guide.max)}`}
            />
          </div>
        )
      )}

      {guide.fixedQuantity && !adminText && (
        <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 font-medium text-amber-300">
          ⚠️ Enter exactly {n(guide.fixedQuantity)} in the quantity box.
        </p>
      )}

      <div className="mt-3 rounded-lg border border-brand/25 bg-brand/10 px-3 py-2.5">
        <p className="font-semibold text-brand">🔗 {guide.link.label}</p>
        <p className="mt-1 text-slate-200">
          {guide.link.level === "id" ? "Enter" : "Paste"} {guide.link.what}.
        </p>
        <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{guide.link.example}</p>
      </div>

      {(guide.link.requirements.length > 0 || guide.notes.length > 0) && (
        <ul className="mt-3 space-y-1.5">
          {guide.link.requirements.map((r) => (
            <li key={r} className="flex gap-2 text-slate-300">
              <span aria-hidden="true" className="text-amber-400">
                ⚠️
              </span>
              <span>{r}</span>
            </li>
          ))}
          {guide.notes.map((note) => (
            <li key={note} className="flex gap-2 text-slate-400">
              <span aria-hidden="true">ℹ️</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <p className="mt-3 text-[11px] text-slate-500">
          A wrong link format is cancelled by the provider. Refunds for cancelled orders go back to
          your balance.
        </p>
      )}
    </div>
  );
}
