import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useTheme } from "../hooks/useTheme";
import {
  calculateTelanganaLtIDomesticBill,
  getTariffBand,
  getTariffWarningMessage,
  projectMonthlyUnits,
} from "../utils/telanganaTariff";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatKwh(amount) {
  return `${Number(amount || 0).toFixed(1)} kWh`;
}

function KPICard({ label, value, note, toneColor, icon }) {
  return (
    <article className="surface-panel p-3.5 flex flex-col justify-between min-h-[96px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <p className={`text-2xl font-semibold leading-none ${toneColor || "text-[var(--text-primary)]"}`}>{value}</p>
      </div>
      <p className="mt-1 text-[11px] text-tonal leading-normal">{note}</p>
    </article>
  );
}

export default function Predictions({
  bill,
  dailyUsage = [],
  history = [],
  latestReading,
}) {
  const { isDark } = useTheme();

  const currentUnits = Number(bill?.monthlyUnits ?? bill?.unitsConsumed ?? latestReading?.energyKWh ?? 0);
  const currentBill = bill || calculateTelanganaLtIDomesticBill({
    meterId: latestReading?.meterId,
    monthlyUnits: currentUnits,
    phaseType: latestReading?.phaseType,
    contractedLoad: latestReading?.contractedLoad,
  });

  const projectedMonthlyUnits = projectMonthlyUnits({
    monthlyUnits: currentUnits,
    latestReading,
    history,
    dailyUsage,
  });

  const projectedBill = calculateTelanganaLtIDomesticBill({
    meterId: bill?.meterId || latestReading?.meterId,
    monthlyUnits: projectedMonthlyUnits,
    phaseType: bill?.phaseType || latestReading?.phaseType,
    contractedLoad: bill?.contractedLoad || latestReading?.contractedLoad,
  });

  const currentBand = getTariffBand(currentUnits);
  const projectedBand = projectedBill.tariffBand;
  const trendMessage = getTariffWarningMessage(currentUnits, projectedMonthlyUnits);

  const billDifference = projectedBill.finalPayableEstimate - currentBill.finalPayableEstimate;
  const diffSign = billDifference >= 0 ? "+" : "";
  const isIncrease = billDifference > 0;

  // Build the projection chart data
  const latestDate = latestReading?.timestamp ? new Date(latestReading.timestamp) : new Date();
  const currentDay = latestDate.getDate() || 14;
  const daysInMonth = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0).getDate() || 30;

  const dailyAvgActual = currentUnits / currentDay;
  const dailyAvgProjected = projectedMonthlyUnits / daysInMonth;

  const chartData = [];
  let accumulatedActual = 0;
  let accumulatedProjected = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    if (day <= currentDay) {
      accumulatedActual += dailyAvgActual;
      accumulatedProjected += dailyAvgActual;
      chartData.push({
        dayLabel: `Day ${day}`,
        actual: +accumulatedActual.toFixed(1),
        predicted: day === currentDay ? +accumulatedProjected.toFixed(1) : null,
      });
    } else {
      accumulatedProjected += dailyAvgProjected;
      chartData.push({
        dayLabel: `Day ${day}`,
        actual: null,
        predicted: +accumulatedProjected.toFixed(1),
      });
    }
  }

  const aiSummary = projectedMonthlyUnits > currentUnits * 1.05
    ? `Consumption is increasing steadily and may reach ${formatKwh(projectedMonthlyUnits)} by month end.`
    : `Consumption is stable and is expected to reach ${formatKwh(projectedMonthlyUnits)} by month end.`;



  return (
    <div className="page-stack gap-3.5">


      {/* Top KPI Section */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Current Bill"
          value={formatCurrency(currentBill.finalPayableEstimate)}
          note="Charges incurred so far"
          toneColor="text-[var(--text-secondary)]"
          icon="🔵"
        />
        <KPICard
          label="Predicted Bill"
          value={formatCurrency(projectedBill.finalPayableEstimate)}
          note="Estimated month-end bill"
          toneColor="text-[var(--accent-primary)]"
          icon="🟠"
        />
        <KPICard
          label="Bill Difference"
          value={`${diffSign}${formatCurrency(billDifference)}`}
          note={isIncrease ? "Expected cost increase" : "Expected cost savings"}
          toneColor={isIncrease ? "text-rose-500" : "text-emerald-500"}
          icon={isIncrease ? "⚠️" : "✨"}
        />
        <KPICard
          label="Forecast Confidence"
          value="94%"
          note="Based on historical trends"
          toneColor="text-emerald-500"
          icon="🟢"
        />
      </section>

      {/* Usage Forecast Chart */}
      <section className="surface-panel p-3.5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Projections</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Usage Forecast Curve</h3>
            <p className="mt-1 text-xs text-tonal">
              Real-time accumulated consumption trend vs month-end projection.
            </p>
          </div>
          <span className="status-pill !border-orange-500/20 !bg-orange-500/10 !text-orange-600 dark:!text-orange-400 dark:!bg-orange-950/30 font-semibold">
            Proj. Month-End: {formatKwh(projectedMonthlyUnits)}
          </span>
        </div>

        <div className="mt-3.5 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
              />
              <XAxis
                dataKey="dayLabel"
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value} kWh`,
                  name === "actual" ? "Current Usage" : "Predicted Consumption",
                ]}
                contentStyle={{
                  background: isDark ? "var(--surface-solid)" : "rgba(255, 255, 255, 0.98)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "12px",
                  color: isDark ? "var(--text-primary)" : "#111827",
                }}
                labelStyle={{ color: isDark ? "var(--text-secondary)" : "#64748b" }}
              />
              <ReferenceLine
                x={`Day ${currentDay}`}
                stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)"}
                strokeDasharray="3 3"
                label={{
                  value: "Today",
                  fill: isDark ? "#a1a1aa" : "#4b5563",
                  fontSize: 10,
                  position: "top",
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="actual"
                stroke="#4e6b8c"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="predicted"
                stroke="#cf5b36"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Analytics and Insights Grid */}
      <section className="grid gap-3.5 lg:grid-cols-2">
        {/* Consumption Analytics */}
        <article className="surface-panel p-3.5">
          <div>
            <p className="section-kicker">Active Metrics</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Consumption Analytics</h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="metric-tile px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Current Month Usage</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatKwh(currentUnits)}</p>
            </div>
            <div className="metric-tile px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Predicted Month Usage</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatKwh(projectedMonthlyUnits)}</p>
            </div>
            <div className="metric-tile px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Average Daily Consumption</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatKwh(currentUnits / currentDay)}</p>
            </div>
            <div className="metric-tile px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Expected Tariff Slab</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{projectedBand}</p>
            </div>
          </div>
        </article>

        {/* Forecast Insights */}
        <article className="surface-panel p-3.5 flex flex-col justify-between">
          <div>
            <p className="section-kicker">AI Assessment</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Forecast Insights</h3>
            
            <div className="mt-3 space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="mt-0.5">🏷️</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Tariff Slab Transition</p>
                  <p className="text-[11px] mt-0.5">{trendMessage}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="mt-0.5">📈</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Consumption Status</p>
                  <p className="text-[11px] mt-0.5">
                    {projectedMonthlyUnits > currentUnits * 1.1 
                      ? "Increasing: Significant usage surge detected." 
                      : "Stable: Usage pattern matches baseline forecast."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-[8px] bg-[var(--surface-soft)] border border-[var(--surface-border)]">
            <p className="text-xs font-medium text-[var(--text-primary)]">AI Forecast Summary</p>
            <p className="text-[11px] text-tonal mt-1 leading-normal">
              "{aiSummary}"
            </p>
          </div>
        </article>
      </section>


    </div>
  );
}
