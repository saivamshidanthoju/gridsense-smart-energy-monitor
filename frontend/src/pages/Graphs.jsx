import DailyUsageChart from "../components/DailyUsageChart";
import EnergyLineChart from "../components/EnergyLineChart";
import VoltageCurrentTrendChart from "../components/VoltageCurrentTrendChart";
import { summarizeHistory } from "../data/mockData";

function SummaryTile({ label, value }) {
  return (
    <div className="metric-tile px-4 py-3">
      <p className="section-kicker">{label}</p>
      <p className="mt-1.5 text-base font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function Graphs({
  history = [],
  dailyUsage = [],
  latestReading,
  lastUpdated,
}) {
  const summary = summarizeHistory(history);
  const dataStatusLabel = latestReading ? "Data updated" : "Waiting";
  const summaryTiles = [
    { label: "Average voltage", value: `${summary.averageVoltage || 0} V` },
    { label: "Average current", value: `${summary.averageCurrent || 0} A` },
    { label: "Peak power", value: `${summary.peakPower || 0} W` },
    { label: "Energy counter", value: `${summary.totalEnergy || 0} kWh` },
  ];

  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Graphs</p>
            <h2 className="mt-1 section-heading">Meter trends</h2>
          </div>
          <span className="status-pill">{dataStatusLabel}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryTiles.map((item) => (
            <SummaryTile key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-tonal">
          <span>
            Last updated{" "}
            {lastUpdated
              ? new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              : "pending"}
          </span>
          <span>Latest power {latestReading ? `${latestReading.power} W` : "pending"}</span>
        </div>
      </section>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <EnergyLineChart
          history={history}
          title="Live power"
          subtitle="Recent power samples from the active meter stream."
        />
        <VoltageCurrentTrendChart
          history={history}
          title="Voltage and current"
          subtitle="Supply voltage and line current in one view."
        />
        <DailyUsageChart
          data={dailyUsage}
          title="Daily energy usage"
          subtitle="Day-level kWh estimate for the current week."
        />
      </div>
    </div>
  );
}
