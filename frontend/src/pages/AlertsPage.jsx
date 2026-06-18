import { useState } from "react";
import AlertsPanel from "../components/AlertsPanel";

function MetricTile({ label, value, note, colorClass }) {
  return (
    <div className="metric-tile px-3.5 py-3.5 flex flex-col justify-between min-h-[90px]">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</p>
        <p className={`mt-1.5 text-2xl font-bold ${colorClass || "text-[var(--text-primary)]"}`}>{value}</p>
      </div>
      <p className="mt-1 text-[11px] leading-normal text-tonal">{note}</p>
    </div>
  );
}

const INITIAL_CRITICAL_ALERTS = [
  {
    id: "alert-1",
    severity: "critical",
    title: "Voltage spike detected",
    message: "Incoming supply voltage peaked at 264V (limit 245V). Potential load stabilizer damage.",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "alert-2",
    severity: "critical",
    title: "Connection Interrupted",
    message: "The electricity meter has lost connection with the secure utility server. Telemetry will sync once re-established.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "alert-3",
    severity: "critical",
    title: "Power outage",
    message: "Utility main feeder failure reported. Backup grid routing initiated.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const INITIAL_WARNING_ALERTS = [
  {
    id: "alert-4",
    severity: "warning",
    title: "High energy usage",
    message: "Current demand of 2.1kW exceeded your threshold limit of 1.8kW for 10 minutes.",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "alert-5",
    severity: "warning",
    title: "Abnormal consumption pattern",
    message: "Unusual consumption shift detected between 2 AM and 4 AM (40% above baseline).",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const INITIAL_INFO_ALERTS = [
  {
    id: "alert-6",
    severity: "info",
    title: "Bill generated",
    message: "Estimated billing cycle invoice for June 2026 has been computed and prepared.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "alert-7",
    severity: "info",
    title: "Firmware updated",
    message: "Smart Meter telemetry firmware upgraded to system build v2.4.2 successfully.",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function AlertsPage({ alerts: propAlerts = [] }) {
  const [activeAlerts, setActiveAlerts] = useState(() => {
    // Merge props alerts if any with our mock structured alerts
    const mappedProps = propAlerts.map(a => ({
      id: a.id,
      severity: a.severity || "info",
      title: a.title,
      message: a.message,
      createdAt: a.createdAt || new Date().toISOString(),
    }));
    return [...INITIAL_CRITICAL_ALERTS, ...INITIAL_WARNING_ALERTS, ...INITIAL_INFO_ALERTS, ...mappedProps];
  });

  const [resolvedAlerts, setResolvedAlerts] = useState([
    {
      id: "alert-resolved-1",
      severity: "info",
      title: "Mains frequency stabilized",
      message: "Grid line frequency returned to nominal 50.00Hz.",
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      resolvedAt: new Date(Date.now() - 345000000).toISOString(),
    },
    {
      id: "alert-resolved-2",
      severity: "warning",
      title: "Voltage dip resolved",
      message: "Utility grid voltage recovered to nominal 230V.",
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      resolvedAt: new Date(Date.now() - 431000000).toISOString(),
    }
  ]);

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'critical', 'warning', 'info', 'resolved'
  const [searchQuery, setSearchQuery] = useState("");

  const handleResolveAlert = (alertId) => {
    const alertToResolve = activeAlerts.find(a => a.id === alertId);
    if (!alertToResolve) return;

    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    setResolvedAlerts(prev => [
      {
        ...alertToResolve,
        resolvedAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleResolveAll = () => {
    if (!activeAlerts.length) return;
    const nowStr = new Date().toISOString();
    const newlyResolved = activeAlerts.map(a => ({ ...a, resolvedAt: nowStr }));
    
    setResolvedAlerts(prev => [...newlyResolved, ...prev]);
    setActiveAlerts([]);
  };

  // Filter alerts based on active tab and search query
  const getFilteredAlerts = () => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (alert) => 
      alert.title.toLowerCase().includes(query) || 
      alert.message.toLowerCase().includes(query);

    if (activeTab === "resolved") {
      return resolvedAlerts.filter(matchesSearch);
    }

    let list = activeAlerts;
    if (activeTab === "critical") {
      list = activeAlerts.filter(a => a.severity === "critical");
    } else if (activeTab === "warning") {
      list = activeAlerts.filter(a => a.severity === "warning");
    } else if (activeTab === "info") {
      list = activeAlerts.filter(a => a.severity === "info");
    }

    return list.filter(matchesSearch);
  };

  const filteredAlerts = getFilteredAlerts();

  // Metrics
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;
  const infoCount = activeAlerts.filter((a) => a.severity === "info").length;

  return (
    <div className="page-stack gap-3.5">


      {/* Alert Metrics Section */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Open Alerts"
          value={activeAlerts.length}
          note="Active unresolved issues"
          colorClass={activeAlerts.length > 0 ? "text-rose-500" : "text-emerald-500"}
        />
        <MetricTile
          label="Critical Alerts"
          value={criticalCount}
          note="Grid or supply issues"
          colorClass={criticalCount > 0 ? "text-rose-500" : "text-[var(--text-primary)]"}
        />
        <MetricTile
          label="Warnings"
          value={warningCount}
          note="Usage limit overrides"
          colorClass={warningCount > 0 ? "text-amber-500" : "text-[var(--text-primary)]"}
        />
        <MetricTile
          label="Resolved Alerts"
          value={resolvedAlerts.length}
          note="Cleared logs archive"
          colorClass="text-emerald-500"
        />
      </section>

      {/* Main Alert Panel with Search and Filters */}
      <section className="surface-panel p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[var(--surface-border)] pb-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "all" ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]" : "text-tonal hover:bg-[var(--surface-soft)]"}`}
            >
              All Active ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab("critical")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "critical" ? "bg-rose-500/10 text-rose-500" : "text-tonal hover:bg-[var(--surface-soft)]"}`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setActiveTab("warning")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "warning" ? "bg-amber-500/10 text-amber-500" : "text-tonal hover:bg-[var(--surface-soft)]"}`}
            >
              Warnings ({warningCount})
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "info" ? "bg-blue-500/10 text-blue-500" : "text-tonal hover:bg-[var(--surface-soft)]"}`}
            >
              Info ({infoCount})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "resolved" ? "bg-emerald-500/10 text-emerald-500" : "text-tonal hover:bg-[var(--surface-soft)]"}`}
            >
              Resolved Archive ({resolvedAlerts.length})
            </button>
          </div>

          {/* Search box & Resolve All button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[var(--text-tertiary)]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-44 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-soft)] py-1 pl-7 pr-2.5 text-xs text-[var(--text-primary)] transition focus:border-blue-500/50 focus:outline-none"
              />
            </div>
            {activeTab !== "resolved" && activeAlerts.length > 0 && (
              <button
                type="button"
                onClick={handleResolveAll}
                className="secondary-button text-xs font-semibold px-2.5 py-1.5 !text-emerald-500 !border-emerald-500/20 hover:!bg-emerald-500/10 shrink-0 transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Alerts panel stream */}
        <div className="mt-3.5">
          <AlertsPanel
            alerts={filteredAlerts}
            isResolvedArchive={activeTab === "resolved"}
            onResolve={handleResolveAlert}
          />
        </div>
      </section>
    </div>
  );
}
