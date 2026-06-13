const ACCENT_STYLES = {
  cyan: {
    tone: "text-cyan-700 dark:text-cyan-100",
    line: "bg-cyan-500",
  },
  amber: {
    tone: "text-amber-700 dark:text-amber-100",
    line: "bg-amber-500",
  },
  emerald: {
    tone: "text-emerald-700 dark:text-emerald-100",
    line: "bg-emerald-500",
  },
  slate: {
    tone: "text-slate-700 dark:text-slate-100",
    line: "bg-slate-500",
  },
};

function formatValue(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  }

  return value;
}

export default function MetricCard({ label, value, unit, hint, accent = "cyan", statusLabel = "", className = "" }) {
  const accentStyle = ACCENT_STYLES[accent] || ACCENT_STYLES.cyan;

  return (
    <div className={`surface-card panel-hover h-full px-4 py-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">{label}</p>
          <div className="mt-2.5 flex items-end gap-2">
            <span className="text-[1.6rem] font-semibold text-[var(--text-primary)]">
              {formatValue(value)}
            </span>
            {unit ? <span className="pb-1 text-sm font-medium text-tonal">{unit}</span> : null}
          </div>
        </div>
        {statusLabel ? (
          <span className={`rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium ${accentStyle.tone}`}>
            {statusLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className={`h-full w-[52%] rounded-full ${accentStyle.line}`} />
      </div>

      <p className="mt-3 text-xs leading-6 text-tonal">{hint}</p>
    </div>
  );
}
