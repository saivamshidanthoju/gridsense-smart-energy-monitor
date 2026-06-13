import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../hooks/useTheme";

function formatUsage(value) {
  return `${Number(value || 0).toFixed(2)} kWh`;
}

export default function DailyUsageChart({ data = [], title = "Daily kWh Consumption", subtitle }) {
  const { isDark } = useTheme();
  const latest = data[data.length - 1];

  return (
    <section className="surface-panel h-full p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Daily usage</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? <p className="mt-1.5 text-sm leading-6 text-tonal">{subtitle}</p> : null}
        </div>

        {latest ? <span className="status-pill">{formatUsage(latest.kWh)}</span> : null}
      </div>

      <div className="mt-4 h-[300px] rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-3">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(148,163,184,0.16)" : "rgba(203,213,225,0.75)"}
              />
              <XAxis
                dataKey="day"
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
                formatter={(value) => [formatUsage(value), "Usage"]}
                contentStyle={{
                  background: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
                  border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(203, 213, 225, 0.85)",
                  borderRadius: "12px",
                  color: isDark ? "#fff" : "#111827",
                }}
                labelStyle={{ color: isDark ? "#cbd5e1" : "#64748b" }}
              />
              <Bar dataKey="kWh" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[var(--surface-border-strong)] text-sm text-tonal">
            No daily usage data is available yet.
          </div>
        )}
      </div>
    </section>
  );
}
