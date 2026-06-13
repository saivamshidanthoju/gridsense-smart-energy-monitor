import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../hooks/useTheme";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function BillingChart({ data = [], title = "Monthly Bill Prediction", subtitle }) {
  const { isDark } = useTheme();
  const latest = data[data.length - 1];

  return (
    <section className="surface-panel h-full p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Billing forecast</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? <p className="mt-1.5 text-sm leading-6 text-tonal">{subtitle}</p> : null}
        </div>

        {latest ? <span className="status-pill">{formatCurrency(latest.bill)}</span> : null}
      </div>

      <div className="mt-4 h-[300px] rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-3">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="billingGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(148,163,184,0.16)" : "rgba(203,213,225,0.75)"}
              />
              <XAxis
                dataKey="month"
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
                formatter={(value) => [formatCurrency(value), "Predicted Bill"]}
                contentStyle={{
                  background: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
                  border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(203, 213, 225, 0.85)",
                  borderRadius: "12px",
                  color: isDark ? "#fff" : "#111827",
                }}
                labelStyle={{ color: isDark ? "#cbd5e1" : "#64748b" }}
              />
              <Area
                type="monotone"
                dataKey="bill"
                stroke="#d97706"
                strokeWidth={2.5}
                fill="url(#billingGradient)"
                dot={{ r: 3.5, fill: "#d97706", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[var(--surface-border-strong)] text-sm text-tonal">
            No billing forecast is available yet.
          </div>
        )}
      </div>
    </section>
  );
}
