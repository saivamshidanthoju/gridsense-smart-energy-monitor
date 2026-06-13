import { summarizeHistory } from "../data/mockData";

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

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function range(values) {
  if (!values.length) {
    return 0;
  }

  return Math.max(...values) - Math.min(...values);
}

function MetricTile({ label, value, note }) {
  return (
    <div className="metric-tile px-4 py-4">
      <p className="section-kicker">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-tonal">{note}</p>
    </div>
  );
}

export default function AnalyticsPage({ history = [] }) {
  const summary = summarizeHistory(history);
  const latestReading = history[history.length - 1];
  const sampleCount = history.length;
  const voltages = history.map((reading) => Number(reading.voltage) || 0);
  const currents = history.map((reading) => Number(reading.current) || 0);
  const powers = history.map((reading) => Number(reading.power) || 0);
  const averagePower = average(powers);
  const voltageSpread = range(voltages);
  const currentSpread = range(currents);
  const qualityLabel = sampleCount > 10 ? "Healthy" : sampleCount > 0 ? "Limited" : "Waiting";
  const usageLevel = averagePower >= 1600 ? "High" : averagePower >= 900 ? "Moderate" : "Normal";

  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Analytics</p>
            <h2 className="mt-1 section-heading">Usage insights</h2>
          </div>
          <span className="status-pill">{qualityLabel}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Usage level" value={usageLevel} note="Based on recent power use" />
          <MetricTile label="Readings checked" value={sampleCount} note="Recent meter readings" />
          <MetricTile label="Last updated" value={formatTimestamp(latestReading?.timestamp)} note="Most recent update" />
          <MetricTile label="Average power" value={`${averagePower.toFixed(0)} W`} note="Typical recent usage" />
        </div>
      </section>

      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Reading summary</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">What changed recently</h3>
          </div>
          <span className="status-pill">Easy view</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricTile label="Voltage change" value={`${voltageSpread.toFixed(1)} V`} note="Difference between low and high readings" />
          <MetricTile label="Current change" value={`${currentSpread.toFixed(2)} A`} note="How much usage varied recently" />
          <MetricTile label="Energy used" value={`${summary.totalEnergy || 0} kWh`} note="Current meter energy reading" />
        </div>
      </section>
    </div>
  );
}
