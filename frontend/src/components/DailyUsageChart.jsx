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
                stroke={isDark ? "#383633" : "#e6dfd3"}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: isDark ? "#b4ada3" : "#4a5754", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? "#b4ada3" : "#4a5754", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatUsage(value), "Usage"]}
                contentStyle={{
                  background: isDark ? "#242321" : "#ffffff",
                  border: isDark ? "1px solid #383633" : "1px solid #e6dfd3",
                  borderRadius: "12px",
                  color: isDark ? "#f4f0e6" : "#1c2826",
                }}
                labelStyle={{ color: isDark ? "#b4ada3" : "#4a5754" }}
              />
              <Bar dataKey="kWh" fill="#c26d4b" radius={[4, 4, 0, 0]} />
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
