import { useTheme } from "../hooks/useTheme";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatUnits(amount) {
  return `${Number(amount || 0).toFixed(1)} kWh`;
}

function SummaryTile({ label, value, note, dotColor, valueColor }) {
  return (
    <article className="surface-panel p-3.5 flex flex-col justify-between min-h-[96px] card-glow hover-lift">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor || "bg-blue-500"}`} />
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <p className={`text-2xl font-semibold leading-none ${valueColor || "text-[var(--text-primary)]"}`}>{value}</p>
      </div>
      <p className="mt-1 text-[11px] text-tonal leading-normal">{note}</p>
    </article>
  );
}

export default function BillingPage({ bill, latestReading, billingForecast = [] }) {
  const { isDark } = useTheme();

  if (!bill) {
    return (
      <section className="surface-panel animate-fade-up p-6">
        <p className="section-kicker">Billing</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">No bill available yet</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-tonal">
          The automatic tariff estimate will appear after the first monthly reading is available.
        </p>
      </section>
    );
  }

  const meterId = bill.meterId || latestReading?.meterId || "Unknown";
  const monthlyUnits = bill.monthlyUnits ?? bill.unitsConsumed ?? 0;
  const finalBill = bill.finalPayableEstimate ?? bill.estimatedBill;
  const tariffLabel = bill.tariffBand || bill.tariffCategory || "LT-I Domestic";
  const slabBreakup = Array.isArray(bill.slabBreakup) ? bill.slabBreakup : [];
  const estimatedNextBill = finalBill * 1.08;

  // PieChart breakdown: Energy charges vs Fixed charges
  const energyChargeValue = bill.energyCharge || 0;
  const fixedChargeValue = bill.fixedCharge || 10;
  
  const costBreakdownData = [
    { name: "Energy Charges", value: energyChargeValue || 50, color: "#386641" }, // Forest Green
    { name: "Fixed Charges", value: fixedChargeValue || 10, color: "#cf5b36" },  // Terracotta
  ];

  // AreaChart billing trend: map from billingForecast
  const billingTrendData = billingForecast.map((item) => ({
    month: item.month,
    bill: Math.round(item.bill || 0),
    units: Math.round(item.projectedUnits || 0),
  }));

  return (
    <div className="page-stack gap-3.5 animate-fade-up">
      {/* Compact Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-tonal px-1">
        <span>Service Connection: <span className="font-mono font-semibold text-[var(--text-primary)]">{meterId}</span></span>
        <span>Cycle: <span className="font-semibold text-[var(--text-primary)]">{bill.billingCycle}</span> · <span className="font-semibold text-[var(--text-primary)]">{tariffLabel}</span></span>
      </div>

      {/* 3-KPI Analytics Row */}
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label="Current Month Estimate"
          value={formatCurrency(finalBill)}
          note={`Billing Cycle: ${bill.billingCycle}`}
          dotColor="bg-[var(--accent-primary)]"
        />
        <SummaryTile
          label="Units Consumed"
          value={formatUnits(monthlyUnits)}
          note="Total active energy registered"
          dotColor="bg-[#cf5b36]"
        />
        <SummaryTile
          label="Projected Next Bill"
          value={formatCurrency(estimatedNextBill)}
          note="Forecasted based on active usage trends"
          dotColor="bg-amber-500"
        />
      </section>

      {/* Cost Charts Grid */}
      <section className="grid gap-3.5 lg:grid-cols-[1.2fr_2fr]">
        {/* Cost Breakdown PieChart */}
        <article className="surface-panel p-3.5 flex flex-col justify-between card-glow">
          <div>
            <p className="section-kicker">Ratio Analysis</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Cost Breakdown</h3>
          </div>
          
          <div className="h-[200px] flex items-center justify-center relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Charge"]}
                  contentStyle={{
                    background: isDark ? "var(--surface-solid)" : "rgba(255, 255, 255, 0.98)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "12px",
                    color: isDark ? "var(--text-primary)" : "#111827",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] uppercase font-semibold text-tonal leading-none">Total</span>
              <p className="text-xl font-bold text-[var(--text-primary)] leading-none mt-1">{formatCurrency(finalBill)}</p>
            </div>
          </div>

          <div className="mt-2 flex justify-around gap-2 text-xs">
            {costBreakdownData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: {formatCurrency(item.value)}
              </span>
            ))}
          </div>
        </article>

        {/* Monthly Billing Trend AreaChart */}
        <article className="surface-panel p-3.5 card-glow">
          <div>
            <p className="section-kicker">Projections & Trends</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Monthly Billing Trend</h3>
          </div>

          <div className="h-[210px] mt-3.5">
            {billingTrendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={billingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="billingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"} />
                  <XAxis dataKey="month" tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDark ? "#71717a" : "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Estimated Bill"]}
                    contentStyle={{
                      background: isDark ? "var(--surface-solid)" : "rgba(255, 255, 255, 0.98)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "12px",
                      color: isDark ? "var(--text-primary)" : "#111827",
                    }}
                    labelStyle={{ color: isDark ? "var(--text-secondary)" : "#64748b" }}
                  />
                  <Area type="monotone" dataKey="bill" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#billingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[var(--surface-border-strong)] text-sm text-tonal">
                No monthly trend data available.
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Slabs and Analytics Info */}
      <section className="grid gap-3.5 lg:grid-cols-[2fr_1.2fr]">
        {/* Telangana Tariff Slab Breakdown */}
        <section className="surface-panel p-3.5 card-glow">
          <div className="page-header">
            <div>
              <p className="section-kicker">Telangana Domestic Slabs</p>
              <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Slab Rate Calculation</h3>
            </div>
            <span className="status-pill">{tariffLabel}</span>
          </div>

          <div className="mt-3.5 overflow-hidden rounded-[10px] border border-[var(--surface-border)] bg-[var(--surface-solid)]">
            <table className="soft-table text-xs">
              <thead>
                <tr>
                  <th>Slab Category</th>
                  <th>Units Bracket</th>
                  <th>Rate</th>
                  <th className="text-right">Charge</th>
                </tr>
              </thead>
              <tbody>
                {slabBreakup.length ? (
                  slabBreakup.map((row) => (
                    <tr key={`${row.label}-${row.rate}`}>
                      <td>{row.label}</td>
                      <td>{formatUnits(row.units)}</td>
                      <td>{formatCurrency(row.rate)} / unit</td>
                      <td className="text-right font-semibold">{formatCurrency(row.charge)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-tonal text-center py-4">
                      Slab details computed dynamically from energy units.
                    </td>
                  </tr>
                )}
                <tr>
                  <td>Fixed charge</td>
                  <td>-</td>
                  <td>Monthly base</td>
                  <td className="text-right font-semibold">{formatCurrency(bill.fixedCharge)}</td>
                </tr>
                <tr>
                  <td>Monthly minimum</td>
                  <td>-</td>
                  <td>{bill.minimumChargeApplied ? "Applied" : "Not applied"}</td>
                  <td className="text-right font-semibold">{formatCurrency(bill.minimumCharge)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Consumption Analytics Panel */}
        <aside className="grid content-start gap-3.5">
          <section className="surface-panel p-3.5 flex flex-col justify-between min-h-[240px] card-glow">
            <div>
              <p className="section-kicker">Consumption Analytics</p>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">Billing Insights</h3>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-tonal">Average cost / kWh</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{(bill.energyCharge / monthlyUnits || 4.8).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[var(--surface-border)] pt-2">
                  <span className="text-tonal">Fixed cost ratio</span>
                  <span className="font-semibold text-[var(--text-primary)]">{((bill.fixedCharge / finalBill) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[var(--surface-border)] pt-2">
                  <span className="text-tonal">Active Slab Tier</span>
                  <span className="font-semibold text-[var(--text-primary)]">Tier {slabBreakup.length || 1} Domestic</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[var(--surface-border)] pt-2">
                  <span className="text-tonal">Tariff Grade</span>
                  <span className="font-bold text-emerald-500">A+ Stable</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 rounded-lg bg-[var(--surface-soft)] p-3 text-[11px] text-tonal leading-relaxed border border-[var(--surface-border)]">
              💡 <strong>Usage Tip:</strong> Keeping your total monthly consumption under 100 units avoids transitioning to higher pricing rate slabs.
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
