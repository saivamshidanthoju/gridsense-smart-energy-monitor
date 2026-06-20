function formatTimestamp(timestamp) {
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

function clampPercent(value, min, max) {
  const numericValue = Number(value) || 0;

  if (max <= min) {
    return 0;
  }

  const ratio = ((numericValue - min) / (max - min)) * 100;
  return Math.max(6, Math.min(100, ratio));
}

function PerformanceBar({ label, value, width, tone }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-sm text-tonal">{value}</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[var(--surface-muted)]">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-[10px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-3 py-3">
      <p className="section-kicker">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function LiveReadingPanel({ reading, lastUpdated }) {
  if (!reading) {
    return null;
  }

  const powerProgress = clampPercent(reading.power, 0, 3000);
  const voltageProgress = clampPercent(reading.voltage, 180, 260);
  const currentProgress = clampPercent(reading.current, 0, 20);
  const energyProgress = clampPercent(reading.energyKWh, 0, 500);

  const formattedEnergy = Number(reading.energyKWh || 0).toFixed(3);

  return (
    <section className="surface-panel h-full p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Meter Performance</p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-0.5">Load profile</h2>
        </div>
        <span className="status-pill text-xs font-medium text-[var(--text-secondary)]">
          Updated {formatTimestamp(lastUpdated || reading.timestamp)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Instant Demand</p>
            <p className="mt-2 text-[2.4rem] font-medium leading-none text-[var(--text-primary)]">
              {reading.power}
              <span className="ml-1 text-base font-normal text-tonal">W</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-tonal">Latest validated sample from the active meter.</p>
          </div>

          <div className="mt-6 h-2 rounded-full bg-[var(--surface-solid)]">
            <div className="h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${powerProgress}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryStat label="Last sample" value={formatTimestamp(reading.timestamp)} />
          <SummaryStat label="Refresh window" value="2 sec sync" />
          <SummaryStat label="Meter ID" value={reading.meterId || "Assigned"} />
          <SummaryStat label="Supply type" value={reading.phaseType || "Single phase"} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-solid)] p-4 md:grid-cols-3">
        <PerformanceBar label="Voltage stability" value={`${reading.voltage} V`} width={voltageProgress} tone="bg-blue-500" />
        <PerformanceBar label="Current load" value={`${reading.current} A`} width={currentProgress} tone="bg-[var(--accent-primary)]" />
        <PerformanceBar label="Energy usage" value={`${formattedEnergy} kWh`} width={energyProgress} tone="bg-amber-500" />
      </div>
    </section>
  );
}
