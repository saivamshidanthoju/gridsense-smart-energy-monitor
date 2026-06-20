import EnergyLineChart from "../components/EnergyLineChart";

function formatWholeNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatReadingNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(Number(value || 0));
}

function formatDashboardDateTime(timestamp) {
  if (!timestamp) {
    return "Waiting";
  }

  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DashboardMetric({ label, value, unit, note, dotColor }) {
  return (
    <article className="surface-panel p-3.5 flex flex-col justify-between min-h-[96px] transition-all duration-200 hover:border-[var(--accent-secondary)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</span>
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <p className="text-2xl font-semibold text-[var(--text-primary)] leading-none">{value}</p>
        {unit ? <span className="text-xs font-semibold text-tonal">{unit}</span> : null}
      </div>
      <p className="mt-1 text-[11px] text-tonal leading-normal">{note}</p>
    </article>
  );
}

export default function Dashboard({
  user,
  latestReading,
  history = [],
  meter,
  meterStatus,
  alerts = [],
  lastUpdated,
}) {
  if (!latestReading) {
    return (
      <section className="surface-panel fade-rise p-6">
        <p className="section-kicker">Dashboard</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Waiting for ESP32 data...</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-tonal">
          The first meter reading will appear after the next data update.
        </p>
      </section>
    );
  }

  const activeMeterId = latestReading.meterId || user?.meterId || meter?.meterId || "SC-104829375";

  const firstName = user?.name || "Customer";
  const activeAlerts = alerts?.filter(a => a.severity === "critical" || a.severity === "warning") || [];

  const metrics = [
    {
      label: "Voltage",
      value: formatReadingNumber(latestReading.voltage, 2),
      unit: "V",
      note: "Latest ESP32 voltage sample",
      dotColor: latestReading.voltage < 210 || latestReading.voltage > 250 ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
    },
    {
      label: "Current",
      value: formatReadingNumber(latestReading.current, 3),
      unit: "A",
      note: "Latest ESP32 current draw",
      dotColor: latestReading.current >= 15 ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
    },
    {
      label: "Power",
      value: formatWholeNumber(latestReading.power),
      unit: "W",
      note: "Latest active power draw",
      dotColor: latestReading.power >= 1400 ? "bg-rose-500 animate-pulse" : "bg-emerald-500",
    },
    {
      label: "Energy Consumption",
      value: formatReadingNumber(latestReading.energyKWh, 3),
      unit: "kWh",
      note: "Latest cumulative meter energy",
      dotColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="page-stack gap-4">
      {/* Homeowner-focused Header */}
      <header className="mb-1">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Welcome Back, {firstName}
        </h1>
        <div className="text-xs text-tonal mt-2 space-y-1">
          <p>
            <span className="font-semibold">Meter ID:</span>{" "}
            <span className="font-mono text-[var(--text-primary)]">{activeMeterId}</span>
          </p>
          <p>
            <span className="font-semibold">Last Updated:</span>{" "}
            <span>{formatDashboardDateTime(latestReading?.timestamp || lastUpdated)}</span>
          </p>
        </div>
      </header>

      {/* 4-Metric top row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.label} {...metric} />
        ))}
      </section>

      {/* Main Content Row: Usage Graph & Live Alerts side by side */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyLineChart history={history} title="Live Power Demand (W)" heightClass="h-[320px]" />
        </div>
        <div className="flex flex-col h-full">
          {/* Alerts panel */}
          <div className="surface-panel p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Live Security & Load Alerts</span>
                <span className={`h-2 w-2 rounded-full ${activeAlerts.length > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
              </div>
              {activeAlerts.length > 0 ? (
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <span className="text-sm mt-0.5">⚠️</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-rose-500">{alert.title}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-normal">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-xs">
                  <span className="text-sm font-semibold">✓</span>
                  <span>All systems operating normally. No active anomalies.</span>
                </div>
              )}
            </div>
            <p className="mt-4 text-[10px] text-tonal border-t border-[var(--surface-border)] pt-2">
              Meter Status: <span className="font-semibold capitalize text-[var(--text-primary)]">{meterStatus}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
