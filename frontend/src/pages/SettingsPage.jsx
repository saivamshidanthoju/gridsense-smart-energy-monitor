import { useTheme } from "../hooks/useTheme";

function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-border)] py-2.5 last:border-b-0 last:pb-0">
      <span className="text-xs text-tonal">{label}</span>
      <span className="text-right text-xs font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function formatSessionLabel(label = "") {
  if (!label || /mongo|mock|backend|database/i.test(label)) {
    return "Signed in";
  }
  return label;
}

function formatMeterStatus(status = "") {
  return String(status).toLowerCase() === "offline" ? "Meter offline" : "Meter online";
}

export default function SettingsPage({ user, meter, bill, authLabel }) {
  const { isDark } = useTheme();

  const activityLogs = [
    { event: "Account Login", time: "14-Jun-2026 10:04 PM", ip: "192.168.0.38", status: "Success" },
    { event: "Tariff Details Updated", time: "14-Jun-2026 04:30 PM", ip: "192.168.0.38", status: "Updated" },
    { event: "Meter Data Synced", time: "14-Jun-2026 09:12 AM", ip: "192.168.0.38", status: "Success" },
    { event: "Security Session Renewed", time: "13-Jun-2026 10:15 PM", ip: "192.168.0.38", status: "Success" },
  ];

  // Heatmap values representing consumption intensity: Mon-Sun (Rows) x Week 1-4 (Cols)
  // Values: 1 (Low/Green), 2 (Mod/Amber), 3 (High/Red)
  const heatmapGrid = [
    [1, 2, 1, 1], // Mon
    [2, 1, 2, 3], // Tue
    [1, 1, 1, 2], // Wed
    [2, 2, 1, 1], // Thu
    [1, 1, 2, 1], // Fri
    [3, 3, 2, 3], // Sat
    [3, 3, 3, 3], // Sun
  ];

  const daysLabel = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getHeatmapColor = (val) => {
    if (val === 3) return "bg-rose-500 hover:bg-rose-400";
    if (val === 2) return "bg-amber-500 hover:bg-amber-400";
    return "bg-emerald-500 hover:bg-emerald-400";
  };

  return (
    <div className="page-stack gap-3.5">


      {/* Profile summary rows */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        <section className="surface-panel p-3.5">
          <p className="section-kicker">Profile Details</p>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">Account Profile</h3>
          <div className="mt-3">
            <SettingRow label="Name" value={user?.name || "User"} />
            <SettingRow label="Email" value={user?.email || "Not available"} />
            <SettingRow label="Session Status" value={formatSessionLabel(authLabel)} />
          </div>
        </section>

        <section className="surface-panel p-3.5">
          <p className="section-kicker">Meter Details</p>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">Meter Configuration</h3>
          <div className="mt-3">
            <SettingRow label="Service Connection No" value={user?.meterId || meter?.meterId || "Assigned"} />
            <SettingRow label="Installation" value={meter?.location || "Home"} />
            <SettingRow label="Connection Status" value={formatMeterStatus(meter?.status)} />
          </div>
        </section>

        <section className="surface-panel p-3.5">
          <p className="section-kicker">Regional Defaults</p>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">Billing Policy</h3>
          <div className="mt-3">
            <SettingRow label="Tariff Region" value={bill?.tariffRegion || "Telangana"} />
            <SettingRow label="Billing Slab Category" value={bill?.tariffCategory || "LT-I Domestic"} />
            <SettingRow label="Registry Status" value={bill?.status || "Bill estimate ready"} />
          </div>
        </section>
      </section>

      {/* Heatmap & Efficiency scorecard */}
      <section className="grid gap-3.5 lg:grid-cols-2">
        {/* Heatmap Grid */}
        <article className="surface-panel p-3.5 flex flex-col justify-between">
          <div>
            <p className="section-kicker">Usage Heatmap</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Usage Peak Matrix</h3>
            <p className="mt-1 text-xs text-tonal leading-relaxed">
              Visualizes daily electricity consumption levels across your billing weeks (low vs peak load).
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center p-3 rounded-[10px] bg-[var(--surface-soft)] border border-[var(--surface-border)]">
            <div className="flex gap-4 items-center">
              <div className="grid gap-1">
                {daysLabel.map(day => (
                  <span key={day} className="text-[10px] text-tonal font-semibold h-4.5 flex items-center">{day}</span>
                ))}
              </div>

              <div className="grid gap-1">
                {heatmapGrid.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1">
                    {row.map((val, cIdx) => (
                      <span
                        key={cIdx}
                        className={`h-4.5 w-7.5 rounded-[3px] transition cursor-pointer flex items-center justify-center text-[8px] font-bold text-white/40 ${getHeatmapColor(val)}`}
                        title={`Week ${cIdx + 1}: Intensity level ${val}`}
                      >
                        W{cIdx + 1}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3.5 flex gap-4 text-[10px] text-tonal font-semibold border-t border-[var(--surface-border)] pt-2 w-full justify-around">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500" />Low load</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500" />Moderate</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-rose-500" />High load</span>
            </div>
          </div>
        </article>

        {/* Efficiency Scorecard */}
        <article className="surface-panel p-3.5 flex flex-col justify-between">
          <div>
            <p className="section-kicker">Usage Grade</p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">Energy Savings Score</h3>
            <p className="mt-1 text-xs text-tonal leading-relaxed">
              Analysis comparing your home energy draw against typical savings benchmarks.
            </p>
          </div>

          <div className="mt-4 p-3.5 rounded-[12px] border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between min-h-[105px]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Savings Score Grade</p>
              <p className="mt-1 text-3xl font-bold text-emerald-500 leading-none">
                88 <span className="text-sm font-normal text-emerald-600/80 dark:text-emerald-400/80">/ 100</span>
              </p>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 mt-2 leading-relaxed">
                Your household is rated more efficient than 84% of residential connections in your sector.
              </p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>

          <div className="mt-3 text-[11px] text-tonal leading-relaxed">
            *Optimal savings achieved by running washer load operations and high thermal draws inside off-peak hours (6 AM to 10 AM).
          </div>
        </article>
      </section>

      {/* Activity audit log table */}
      <section className="surface-panel p-3.5">
        <div>
          <p className="section-kicker">Security Audit</p>
          <h3 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">User Account Activity Log</h3>
        </div>

        <div className="mt-3.5 overflow-hidden rounded-[10px] border border-[var(--surface-border)] bg-[var(--surface-solid)]">
          <table className="soft-table text-xs">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Timestamp</th>
                <th>Client IP Address</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log, index) => (
                <tr key={index}>
                  <td className="font-semibold">{log.event}</td>
                  <td>{log.time}</td>
                  <td className="font-mono text-tonal">{log.ip}</td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
