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

const ALERT_TONES = {
  critical: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const ICON_PATHS = {
  voltage: (
    <>
      <path d="M13 2 5.5 13h5L9 22l7.5-11h-5L13 2Z" />
    </>
  ),
  current: (
    <>
      <path d="M5 12a7 7 0 0 1 14 0" />
      <path d="M19 12a7 7 0 0 1-14 0" />
      <path d="M8.5 8.5 5 12l3.5 3.5" />
      <path d="m15.5 8.5 3.5 3.5-3.5 3.5" />
    </>
  ),
  power: (
    <>
      <path d="M8 3.5h8" />
      <path d="M10 3.5v7h4v-7" />
      <path d="M6.5 13.5h11" />
      <path d="M8.5 13.5V18a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5v-4.5" />
    </>
  ),
};

function formatNumber(value, digits = 1) {
  return Number(value || 0).toFixed(digits);
}

function formatWholeNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatTime(timestamp) {
  if (!timestamp) {
    return "Waiting";
  }

  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTableTime(timestamp) {
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

function formatLastUpdated(lastUpdated) {
  if (!lastUpdated) {
    return "Waiting for update";
  }

  return new Date(lastUpdated).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDashboardDateTime(timestamp) {
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

function formatMeterStatus(status = "pending") {
  const normalizedStatus = String(status || "pending").trim().toLowerCase();

  if (normalizedStatus === "offline") {
    return "Offline";
  }

  if (normalizedStatus === "pending") {
    return "Waiting";
  }

  return "Online";
}

function getTrend(history = [], key, digits = 1) {
  if (history.length < 2) {
    return {
      label: "Live",
      positive: true,
    };
  }

  const latest = Number(history[history.length - 1]?.[key]) || 0;
  const previous = Number(history[Math.max(0, history.length - 6)]?.[key]) || 0;

  if (!previous) {
    return {
      label: "Live",
      positive: true,
    };
  }

  const change = ((latest - previous) / Math.abs(previous)) * 100;

  return {
    label: `${change >= 0 ? "+" : ""}${change.toFixed(digits)}%`,
    positive: change >= 0,
  };
}

function getPowerNote(power) {
  const numericPower = Number(power) || 0;

  if (numericPower >= 1600) {
    return "High usage right now";
  }

  if (numericPower >= 900) {
    return "Moderate usage right now";
  }

  return "Normal usage right now";
}

function getLoadStatus(power) {
  const numericPower = Number(power) || 0;

  if (numericPower >= 1600) {
    return "High";
  }

  if (numericPower >= 900) {
    return "Moderate";
  }

  return "Normal";
}

function getCalendarDays(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const dayCount = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `blank-${index}`,
    day: null,
  }));
  const days = Array.from({ length: dayCount }, (_, index) => ({
    key: `day-${index + 1}`,
    day: index + 1,
  }));

  return [...blanks, ...days];
}

function parseDueDay(dueDate) {
  if (!dueDate) {
    return null;
  }

  const parsed = new Date(dueDate);

  if (Number.isNaN(parsed.getTime())) {
    const match = String(dueDate).match(/\b(\d{1,2})\b/);
    return match ? Number(match[1]) : null;
  }

  return parsed.getDate();
}

function Icon({ type }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {ICON_PATHS[type]}
    </svg>
  );
}

function MiniSparkline({ values = [], active }) {
  const series = values.slice(-10).map((value) => Number(value) || 0);

  if (series.length < 2) {
    return <div className="mt-4 h-9 rounded-[10px] bg-[var(--surface-soft)]" />;
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 120;
      const y = 34 - ((value - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="mt-4 h-9 w-full" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={active ? "rgba(15, 118, 110, 0.72)" : "rgba(37, 99, 235, 0.62)"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardMetric({
  label,
  value,
  unit,
  note,
  trend,
  icon,
  sparkValues,
  active = false,
}) {
  return (
    <article className={`dashboard-metric-card ${active ? "dashboard-metric-card-active" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="dashboard-metric-icon">
          <Icon type={icon} />
        </span>
        <button type="button" className="dashboard-icon-button" aria-label={`${label} options`}>
          <span aria-hidden="true">...</span>
        </button>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <div className="mt-2 flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
          <p className="truncate text-[1.85rem] font-semibold leading-none text-[var(--text-primary)]">{value}</p>
          {unit ? <p className="pb-1 text-sm font-semibold text-tonal">{unit}</p> : null}
          <span
            className={`dashboard-trend-pill ${
              trend?.positive ? "dashboard-trend-pill-positive" : "dashboard-trend-pill-negative"
            }`}
          >
            {trend?.label || "Live"}
          </span>
        </div>
        <p className="mt-3 min-h-9 text-xs leading-5 text-tonal">{note}</p>
      </div>

      <MiniSparkline values={sparkValues} active={active} />
    </article>
  );
}

function ChartLegend({ tone, label }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-tonal">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      {label}
    </span>
  );
}

function PowerOverview({ history = [] }) {
  const { isDark } = useTheme();
  const data = history.map((reading) => ({
    time: formatTime(reading.timestamp),
    power: Number(reading.power) || 0,
    voltage: Number(reading.voltage) || 0,
  }));
  const latest = data[data.length - 1];

  return (
    <section className="surface-panel p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Power overview</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Live supply trend</h2>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <ChartLegend tone="bg-[var(--accent-primary)]" label="Power" />
          <ChartLegend tone="bg-blue-500" label="Voltage" />
        </div>
      </div>

      <div className="mt-4 h-[320px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke={isDark ? "rgba(148,163,184,0.14)" : "rgba(203,213,225,0.78)"}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={22}
              />
              <YAxis
                yAxisId="power"
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="voltage"
                orientation="right"
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 8", "dataMax + 8"]}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "Voltage" ? `${Number(value).toFixed(1)} V` : `${Math.round(value)} W`,
                  name,
                ]}
                contentStyle={{
                  background: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
                  border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(203, 213, 225, 0.85)",
                  borderRadius: "12px",
                  color: isDark ? "#fff" : "#111827",
                }}
                labelStyle={{ color: isDark ? "#cbd5e1" : "#64748b" }}
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="power"
                name="Power"
                stroke="#0f766e"
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="voltage"
                type="monotone"
                dataKey="voltage"
                name="Voltage"
                stroke="#2563eb"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[var(--surface-border-strong)] text-sm text-tonal">
            No reading history is available yet.
          </div>
        )}
      </div>
      {latest ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-tonal">
          <span className="status-pill">{formatWholeNumber(latest.power)} W now</span>
          <span className="status-pill">{formatNumber(latest.voltage, 1)} V supply</span>
        </div>
      ) : null}
    </section>
  );
}

function CalendarPanel({ latestReading, bill, meter }) {
  const baseDate = latestReading?.timestamp ? new Date(latestReading.timestamp) : new Date();
  const today = baseDate.getDate();
  const dueDay = parseDueDay(bill?.dueDate);
  const days = getCalendarDays(baseDate);
  const monthLabel = baseDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="surface-panel p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Meter calendar</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{monthLabel}</h2>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`} className="text-[11px] font-semibold text-faint">
            {day}
          </span>
        ))}
        {days.map((item) =>
          item.day ? (
            <span
              key={item.key}
              className={`dashboard-calendar-day ${
                item.day === today ? "dashboard-calendar-day-active" : ""
              } ${item.day === dueDay ? "dashboard-calendar-day-due" : ""}`}
            >
              {item.day}
            </span>
          ) : (
            <span key={item.key} />
          ),
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="dashboard-calendar-note">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
          <span>Latest sync: {formatLastUpdated(latestReading?.timestamp || meter?.lastSync)}</span>
        </div>
        <div className="dashboard-calendar-note">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Bill due: {bill?.dueDate || "End of cycle"}</span>
        </div>
      </div>
    </section>
  );
}

function MeterInfoSummary({ meterId, meterStatus, lastSync }) {
  const statusLabel = formatMeterStatus(meterStatus);
  const isOnline = statusLabel === "Online";

  return (
    <section className="dashboard-meter-summary" aria-label="Meter information">
      <div className="dashboard-meter-item">
        <div className="flex items-center gap-2">
          <span className={`dashboard-meter-status ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
          <p className="section-kicker">Status</p>
        </div>
        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{statusLabel}</p>
      </div>
      <div className="dashboard-meter-item">
        <p className="section-kicker">Last sync</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{formatDashboardDateTime(lastSync)}</p>
      </div>
      <div className="dashboard-meter-item">
        <p className="section-kicker">Meter ID</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{meterId || "Assigned"}</p>
      </div>
    </section>
  );
}

function AlertsSummary({ alerts = [], onNavigate }) {
  const recentAlerts = alerts.slice(0, 3);

  return (
    <section className="surface-panel p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Recent alerts</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">What needs attention</h2>
        </div>
        <span className="status-pill">{alerts.length ? `${alerts.length} active` : "All clear"}</span>
      </div>

      <div className="mt-4 grid gap-3">
        {recentAlerts.length ? (
          recentAlerts.map((alert) => (
            <div key={alert.id} className="rounded-[10px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-3 py-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ALERT_TONES[alert.severity] || ALERT_TONES.info}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{alert.title}</p>
                  <p className="mt-1 text-xs leading-5 text-tonal">{alert.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[10px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-3 py-3 text-sm text-tonal">
            No active alerts.
          </div>
        )}
      </div>

      <button type="button" className="secondary-button mt-4 px-4 py-2.5 text-sm" onClick={() => onNavigate?.("alerts")}>
        View Alerts
      </button>
    </section>
  );
}

function ReadingsTable({ history = [], latestReading }) {
  const rows = (history.length ? history : [latestReading]).filter(Boolean).slice(-6).reverse();

  return (
    <section className="surface-panel overflow-hidden p-4 lg:p-5">
      <div className="page-header">
        <div>
          <p className="section-kicker">Reading overview</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Recent meter samples</h2>
        </div>
        <div className="hidden overflow-hidden rounded-[9px] border border-[var(--surface-border)] bg-[var(--surface-soft)] text-xs font-semibold text-tonal sm:flex">
          <span className="bg-[var(--surface-solid)] px-3 py-2 text-[var(--text-primary)]">Today</span>
          <span className="px-3 py-2">Live</span>
          <span className="px-3 py-2">History</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="dashboard-reading-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Sample Time</th>
              <th>Voltage</th>
              <th>Current</th>
              <th>Power</th>
              <th>Energy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((reading, index) => {
              const loadStatus = getLoadStatus(reading.power);

              return (
                <tr key={`${reading.timestamp || "reading"}-${index}`}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="dashboard-reading-avatar">{reading.meterId?.slice(-2) || "SM"}</span>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{formatTableTime(reading.timestamp)}</p>
                        <p className="mt-0.5 text-xs text-faint">{reading.meterId || "Assigned meter"}</p>
                      </div>
                    </div>
                  </td>
                  <td>{formatNumber(reading.voltage, 1)} V</td>
                  <td>{formatNumber(reading.current, 2)} A</td>
                  <td>{formatWholeNumber(reading.power)} W</td>
                  <td>{formatNumber(reading.energyKWh, 2)} kWh</td>
                  <td>
                    <span
                      className={`dashboard-status-chip ${
                        loadStatus === "High" ? "dashboard-status-chip-high" : "dashboard-status-chip-normal"
                      }`}
                    >
                      {loadStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Dashboard({
  user,
  latestReading,
  history = [],
  bill,
  alerts = [],
  meter,
  meterStatus,
  lastUpdated,
  onNavigate,
}) {
  if (!latestReading) {
    return (
      <section className="surface-panel fade-rise p-6">
        <p className="section-kicker">Dashboard</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">No live reading yet</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-tonal">
          The first meter reading will appear after the next data update.
        </p>
      </section>
    );
  }

  const metrics = [
    {
      label: "Supply Voltage",
      value: formatNumber(latestReading.voltage, 1),
      unit: "V",
      note: "Incoming line voltage at the latest meter sync.",
      trend: getTrend(history, "voltage"),
      icon: "voltage",
      sparkValues: history.map((reading) => reading.voltage),
    },
    {
      label: "Live Current",
      value: formatNumber(latestReading.current, 2),
      unit: "A",
      note: "Current draw from appliances connected now.",
      trend: getTrend(history, "current"),
      icon: "current",
      sparkValues: history.map((reading) => reading.current),
      active: true,
    },
    {
      label: "Power Load",
      value: formatWholeNumber(latestReading.power),
      unit: "W",
      note: getPowerNote(latestReading.power),
      trend: getTrend(history, "power"),
      icon: "power",
      sparkValues: history.map((reading) => reading.power),
    },
  ];
  const meterId = latestReading.meterId || meter?.meterId || user?.meterId;
  const lastSync = lastUpdated || latestReading.timestamp || meter?.lastSync;

  return (
    <div className="page-stack">
      <section className="dashboard-welcome">
        <div className="min-w-0">
          <p className="section-kicker">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
            Energy overview{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-sm leading-6 text-tonal">
            Meter {latestReading.meterId || meter?.meterId || "assigned"} refreshed {formatLastUpdated(lastUpdated || latestReading.timestamp)}.
          </p>
        </div>
        <MeterInfoSummary meterId={meterId} meterStatus={meterStatus} lastSync={lastSync} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.8fr)]">
        <PowerOverview history={history} />
        <CalendarPanel
          latestReading={latestReading}
          bill={bill}
          meter={meter}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.75fr)]">
        <ReadingsTable history={history} latestReading={latestReading} />
        <AlertsSummary alerts={alerts} onNavigate={onNavigate} />
      </section>
    </div>
  );
}
