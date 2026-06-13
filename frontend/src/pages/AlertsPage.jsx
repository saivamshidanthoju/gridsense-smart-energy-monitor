import AlertsPanel from "../components/AlertsPanel";

function MetricTile({ label, value, note }) {
  return (
    <div className="metric-tile px-4 py-4">
      <p className="section-kicker">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-tonal">{note}</p>
    </div>
  );
}

export default function AlertsPage({ alerts = [] }) {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = alerts.filter((alert) => alert.severity === "warning").length;
  const infoCount = alerts.filter((alert) => alert.severity === "info").length;

  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Alerts</p>
            <h2 className="mt-1 section-heading">Usage alerts</h2>
          </div>
          <span className="status-pill">{alerts.length} active</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Total alerts" value={alerts.length} note="Current notification count" />
          <MetricTile label="Critical" value={criticalCount} note="Immediate action required" />
          <MetricTile label="Warnings" value={warningCount} note="Review load or supply changes" />
          <MetricTile label="General" value={infoCount} note="Helpful meter and bill messages" />
        </div>
      </section>

      <section>
        <AlertsPanel alerts={alerts} />
      </section>
    </div>
  );
}
