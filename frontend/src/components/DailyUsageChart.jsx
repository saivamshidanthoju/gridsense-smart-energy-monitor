import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../hooks/useTheme";

function formatUsage(value) {
  return `${Number(value || 0).toFixed(2)} kWh`;
}

export default function DailyUsageChart({ data = [], title = "Daily kWh Consumption", subtitle, heightClass = "h-[300px]" }) {
  const { isDark } = useTheme();
  const latest = data[data.length - 1];

  return (
    <section className="surface-panel h-full p-3 lg:p-3.5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Daily usage</p>
          <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs leading-normal text-tonal">{subtitle}</p> : null}
        </div>

        {latest ? (
          <span className="status-pill !border-orange-500/20 !bg-orange-500/10 !text-orange-600 dark:!text-orange-400 dark:!bg-orange-950/30 font-semibold">
            {formatUsage(latest.kWh)}
          </span>
        ) : null}
      </div>

      <div className={`mt-2.5 ${heightClass}`}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
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
              <Bar dataKey="kWh" fill="#f97316" radius={[4, 4, 0, 0]} />
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
