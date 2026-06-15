const SEVERITY_STYLES = {
  info: {
    rail: "bg-blue-500",
    pill: "border-blue-500/20 bg-blue-500/5 text-blue-500",
  },
  warning: {
    rail: "bg-amber-500",
    pill: "border-amber-500/20 bg-amber-500/5 text-amber-500",
  },
  critical: {
    rail: "bg-rose-500",
    pill: "border-rose-500/20 bg-rose-500/5 text-rose-500",
  },
};

function formatAlertTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertsPanel({
  alerts = [],
  isResolvedArchive = false,
  onResolve,
}) {
  return (
    <div className="space-y-2.5">
      {alerts.length ? (
        alerts.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;

          return (
            <article key={alert.id} className="rounded-[10px] border border-[var(--surface-border)] bg-[var(--surface-solid)] p-3 flex gap-3.5 items-start">
              <span className={`h-8.5 w-1 shrink-0 rounded-full ${style.rail}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{alert.title}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${style.pill}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-normal text-tonal">{alert.message}</p>
                  </div>

                  {/* Resolve button or resolved date details */}
                  <div className="shrink-0">
                    {isResolvedArchive ? (
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-emerald-500 uppercase leading-none">Resolved</span>
                        <p className="text-[9px] text-tonal mt-0.5">{formatAlertTime(alert.resolvedAt)}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onResolve?.(alert.id)}
                        className="secondary-button text-[11px] font-semibold px-2 py-1 transition flex items-center gap-1 hover:!bg-emerald-500/10 hover:!text-emerald-500 hover:!border-emerald-500/20"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-[9px] font-semibold uppercase text-faint">
                  Opened {formatAlertTime(alert.createdAt)}
                </p>
              </div>
            </article>
          );
        })
      ) : (
        <div className="rounded-[10px] border border-dashed border-[var(--surface-border-strong)] bg-[var(--surface-soft)] p-6 text-center text-xs text-tonal">
          No alerts found matching this filter.
        </div>
      )}
    </div>
  );
}
