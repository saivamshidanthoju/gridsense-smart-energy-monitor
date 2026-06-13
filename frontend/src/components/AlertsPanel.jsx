const SEVERITY_STYLES = {
  info: {
    rail: "bg-blue-500",
    pill: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/18 dark:bg-blue-500/10 dark:text-blue-100",
  },
  warning: {
    rail: "bg-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/18 dark:bg-amber-500/10 dark:text-amber-100",
  },
  critical: {
    rail: "bg-rose-500",
    pill: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/18 dark:bg-rose-500/10 dark:text-rose-100",
  },
};

function formatAlertTime(timestamp) {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertsPanel({ alerts = [] }) {
  return (
    <section className="surface-panel p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Alert stream</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Recent alerts</h3>
        </div>
        <span className="status-pill">{alerts.length} open</span>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.length ? (
          alerts.map((alert) => {
            const severity = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;

            return (
              <article key={alert.id} className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-solid)] px-4 py-4">
                <div className="flex items-start gap-4">
                  <span className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${severity.rail}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-[var(--text-primary)]">{alert.title}</p>
                        <p className="mt-1.5 text-sm leading-6 text-tonal">{alert.message}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase ${severity.pill}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-medium uppercase text-faint">{formatAlertTime(alert.createdAt)}</p>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm text-tonal">
            No alerts are active right now.
          </div>
        )}
      </div>
    </section>
  );
}
