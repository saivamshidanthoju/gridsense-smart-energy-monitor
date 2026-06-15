import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../hooks/useTheme";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVoltage(value) {
  return `${Number(value || 0).toFixed(0)} V`;
}

function formatCurrent(value) {
  return `${Number(value || 0).toFixed(2)} A`;
}

export default function VoltageCurrentTrendChart({
  history = [],
  title = "Voltage and Current Trend",
  subtitle,
  heightClass = "h-[300px]",
}) {
  const { isDark } = useTheme();
  const data = history.map((reading) => ({
    time: formatTime(reading.timestamp),
    voltage: Number(reading.voltage) || 0,
    current: Number(reading.current) || 0,
  }));
  const latest = data[data.length - 1];

  return (
    <section className="surface-panel h-full p-3 lg:p-3.5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Signal comparison</p>
          <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs leading-normal text-tonal">{subtitle}</p> : null}
        </div>

        {latest ? (
          <span className="status-pill !border-blue-500/20 !bg-blue-500/10 !text-blue-600 dark:!text-blue-400 dark:!bg-blue-950/30 font-semibold">
            {formatVoltage(latest.voltage)} / {formatCurrent(latest.current)}
          </span>
        ) : null}
      </div>

      <div className={`mt-2.5 ${heightClass}`}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
                  border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(203, 213, 225, 0.85)",
                  borderRadius: "12px",
                  color: isDark ? "#fff" : "#111827",
                }}
                labelStyle={{ color: isDark ? "#cbd5e1" : "#64748b" }}
                formatter={(value, name) => [
                  name === "voltage" ? formatVoltage(value) : formatCurrent(value),
                  name === "voltage" ? "Voltage" : "Current",
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="voltage"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="current"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[var(--surface-border-strong)] text-sm text-tonal">
            No voltage or current history is available yet.
          </div>
        )}
      </div>
    </section>
  );
}
