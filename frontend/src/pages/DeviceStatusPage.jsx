import DeviceStatusCard from "../components/DeviceStatusCard";
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

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function ProfileMetric({ label, value, note }) {
  return (
    <div className="metric-tile px-4 py-4">
      <p className="section-kicker">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-tonal">{note}</p>
    </div>
  );
}

export default function DeviceStatusPage({
  user,
  meter,
  history = [],
  latestReading,
  bill,
  lastUpdated,
}) {
  const summary = summarizeHistory(history);
  const averagePower = average(history.map((reading) => Number(reading.power) || 0));
  const peakPower = summary.peakPower || Number(latestReading?.power) || 0;
  const monthlyUnits = bill?.monthlyUnits ?? bill?.unitsConsumed ?? latestReading?.energyKWh ?? 0;

  return (
    <div className="page-stack">
      <DeviceStatusCard user={user} meter={meter} />

      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Load profile</p>
            <h2 className="mt-1 section-heading">Meter performance</h2>
          </div>
          <span className="status-pill">Last updated {formatTimestamp(lastUpdated || latestReading?.timestamp || meter?.lastSync)}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ProfileMetric
            label="Average use"
            value={`${averagePower.toFixed(0)} W`}
            note="Typical recent power use"
          />
          <ProfileMetric
            label="Highest use"
            value={`${Math.round(peakPower)} W`}
            note="Highest recent power reading"
          />
          <ProfileMetric
            label="Current energy"
            value={`${Number(monthlyUnits || 0).toFixed(2)} kWh`}
            note="Energy recorded for billing"
          />
        </div>
      </section>
    </div>
  );
}
