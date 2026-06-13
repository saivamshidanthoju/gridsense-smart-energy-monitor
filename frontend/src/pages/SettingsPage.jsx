function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-border)] py-3 last:border-b-0">
      <span className="text-sm text-tonal">{label}</span>
      <span className="text-right text-sm font-semibold text-[var(--text-primary)]">{value}</span>
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
  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Settings</p>
            <h2 className="mt-1 section-heading">Account and meter profile</h2>
          </div>
          <span className="status-pill">Profile ready</span>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <section className="surface-panel p-4">
          <p className="section-kicker">Account</p>
          <div className="mt-3">
            <SettingRow label="Name" value={user?.name || "User"} />
            <SettingRow label="Email" value={user?.email || "Not available"} />
            <SettingRow label="Session" value={formatSessionLabel(authLabel)} />
          </div>
        </section>

        <section className="surface-panel p-4">
          <p className="section-kicker">Meter</p>
          <div className="mt-3">
            <SettingRow label="Meter ID" value={user?.meterId || meter?.meterId || "Assigned"} />
            <SettingRow label="Location" value={meter?.location || "Home"} />
            <SettingRow label="Status" value={formatMeterStatus(meter?.status)} />
          </div>
        </section>

        <section className="surface-panel p-4">
          <p className="section-kicker">Billing defaults</p>
          <div className="mt-3">
            <SettingRow label="Region" value={bill?.tariffRegion || "Telangana"} />
            <SettingRow label="Category" value={bill?.tariffCategory || "LT-I Domestic"} />
            <SettingRow label="Payment" value={bill?.status || "Bill estimate ready"} />
          </div>
        </section>
      </section>
    </div>
  );
}
