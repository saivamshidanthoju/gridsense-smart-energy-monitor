import { useState } from "react";
import { summarizeHistory } from "../data/mockData";

function formatTimestamp(timestamp) {
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

function SectionCard({ title, kicker, children }) {
  return (
    <article className="surface-panel p-3.5 flex flex-col justify-between">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">{title}</h3>
        <div className="mt-3.5 space-y-3">
          {children}
        </div>
      </div>
    </article>
  );
}

function DetailRow({ label, value, highlightClass }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-2.5 last:border-b-0 last:pb-0">
      <p className="text-xs text-tonal">{label}</p>
      <p className={`text-xs font-semibold ${highlightClass || "text-[var(--text-primary)]"}`}>{value}</p>
    </div>
  );
}

export default function DeviceStatusPage({
  user,
  meter,
  history = [],
  latestReading,
  lastUpdated,
}) {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("v2.4.2 available");

  if (!user || !meter) {
    return (
      <section className="surface-panel fade-rise p-6">
        <p className="section-kicker">Device Status</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">No device registered</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-tonal">
          Smart electricity meter hardware profile is currently not bound to this account.
        </p>
      </section>
    );
  }

  function handleCheckUpdate() {
    setCheckingUpdate(true);
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateStatus("Device firmware is up to date.");
      alert("Firmware search complete. Smart meter is running the latest stable build.");
    }, 2000);
  }

  const macAddress = "3C:61:05:A4:F2:BC";
  const installDate = "12-Jan-2026";
  const uptimePercent = "99.94%";
  const healthScore = "98 / 100";

  return (
    <div className="page-stack gap-3.5">
      {/* Overview summary bar */}
      <section className="surface-panel p-3.5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Device Status</p>
            <h2 className="mt-0.5 text-lg font-semibold text-[var(--text-primary)]">Smart Electricity Meter Profile</h2>
            <p className="mt-1 text-xs text-tonal">
              Connection Type: Wi-Fi Meter · Location: {meter.location || "Home"}
            </p>
          </div>
          <span className="status-pill !border-emerald-500/20 !bg-emerald-500/10 !text-emerald-500 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>
      </section>

      {/* Restructured Profile Grid */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        {/* Owner Information */}
        <SectionCard title="Owner Information" kicker="Account Details">
          <DetailRow label="Primary Name" value={user.name || "Customer"} />
          <DetailRow label="Email Address" value={user.email || "Not available"} />
          <DetailRow label="Installation Address" value={meter.location || "Home"} />
          <DetailRow label="Phase Connection" value={latestReading?.phaseType || "Single Phase"} />
        </SectionCard>

        {/* Device Information */}
        <SectionCard title="Meter Information" kicker="Hardware Details">
          <DetailRow label="Service Connection No" value={meter.meterId || user.meterId || "SC-104829375"} />
          <DetailRow label="Device Type" value="Smart Electricity Meter" />
          <DetailRow label="Firmware Version" value={meter.firmware || "v2.4.1"} />
          <DetailRow label="MAC Address" value={macAddress} />
          <DetailRow label="IP Routing Address" value={meter.ipAddress || "192.168.0.38"} />
          <DetailRow label="Commissioning Date" value={installDate} />
        </SectionCard>

        {/* Health Monitoring */}
        <SectionCard title="Connection Health" kicker="System Performance">
          <DetailRow label="Signal Strength" value="Excellent" highlightClass="text-emerald-500" />
          <DetailRow label="Uptime Ratio" value={uptimePercent} highlightClass="text-emerald-500" />
          <DetailRow label="Last Power Cycle" value="4 days ago (Soft reset)" />
          <DetailRow label="Last Data Sync" value={formatTimestamp(lastUpdated || latestReading?.timestamp || meter.lastSync)} />
          <DetailRow label="Connection Quality Score" value={healthScore} highlightClass="text-emerald-500 font-bold" />
        </SectionCard>
      </section>

      {/* Timeline and Update Center */}
      <section className="grid gap-3.5 lg:grid-cols-2">
        {/* Device Status Timeline */}
        <article className="surface-panel p-3.5">
          <div>
            <p className="section-kicker">Activity Logs</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Connection Timeline</h3>
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-500 font-semibold shrink-0">🟢 ACTIVE</span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">Electricity usage sync completed</p>
                <p className="text-[10px] text-tonal mt-0.5">Data transmission encrypted and verified by utility server.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-blue-500 font-semibold shrink-0">🔵 LEASE</span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">DHCP lease renewed by local access router</p>
                <p className="text-[10px] text-tonal mt-0.5">Assigned secure local network address for stable dashboard streaming.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-500 font-semibold shrink-0">🟢 BOOT</span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">Meter diagnostic boot successful</p>
                <p className="text-[10px] text-tonal mt-0.5">All internal self-check diagnostics operational.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-amber-500 font-semibold shrink-0">🟡 DRIFT</span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">Wi-Fi connection stabilized</p>
                <p className="text-[10px] text-tonal mt-0.5">Automatically recovered communication from temporary signal drift.</p>
              </div>
            </div>
          </div>
        </article>

        {/* Firmware Update controls */}
        <article className="surface-panel p-3.5 flex flex-col justify-between">
          <div>
            <p className="section-kicker">Meter Firmware</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Firmware Update Center</h3>
            <p className="mt-2 text-xs text-tonal leading-relaxed">
              Updates install the latest security patches, system optimizations, and communication protocols to keep your meter running securely.
            </p>
          </div>

          <div className="mt-4 p-3.5 rounded-[10px] bg-[var(--surface-soft)] border border-[var(--surface-border)]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-tonal font-semibold">Active Firmware Build</span>
              <span className="font-semibold text-[var(--text-primary)]">{meter.firmware || "v2.4.1"}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-tonal font-semibold">Registry Update Status</span>
              <span className="font-bold text-amber-500">{updateStatus}</span>
            </div>
          </div>

          <button
            type="button"
            className="primary-button w-full px-4 py-2.5 text-xs font-semibold mt-4 flex items-center justify-center gap-1.5 transition"
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
          >
            {checkingUpdate ? (
              <span>Checking for updates...</span>
            ) : (
              <span>Check for Updates</span>
            )}
          </button>
        </article>
      </section>
    </div>
  );
}
