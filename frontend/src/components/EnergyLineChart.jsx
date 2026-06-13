import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../hooks/useTheme";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPower(value) {
  return `${Math.round(value || 0)} W`;
}

export default function EnergyLineChart({ history = [], title = "Live Power Usage", subtitle }) {
  const { isDark } = useTheme();
  const data = history.map((reading) => ({
    time: formatTime(reading.timestamp),
    power: Number(reading.power) || 0,
    voltage: Number(reading.voltage) || 0,
  }));

  const latest = data[data.length - 1];

  return (
    <section className="surface-panel h-full p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Power trace</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? <p className="mt-1.5 text-sm leading-6 text-tonal">{subtitle}</p> : null}
        </div>

        {latest ? <span className="status-pill">{formatPower(latest.power)}</span> : null}
      </div>

      <div className="mt-4 h-[300px] rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-3">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(148,163,184,0.16)" : "rgba(203,213,225,0.75)"}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatPower(value), "Power"]}
                contentStyle={{
                  background: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
                  border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(203, 213, 225, 0.85)",
                  borderRadius: "12px",
                  color: isDark ? "#fff" : "#111827",
                }}
                labelStyle={{ color: isDark ? "#cbd5e1" : "#64748b" }}
              />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[var(--surface-border-strong)] text-sm text-tonal">
            No reading history is available yet.
          </div>
        )}
      </div>
    </section>
  );
}
