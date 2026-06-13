function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Waiting";
  }

  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeviceStatus(status = "unknown") {
  const normalizedStatus = String(status).trim().toLowerCase();

  if (!normalizedStatus) {
    return "Unknown";
  }

  if (normalizedStatus === "http / mqtt ready") {
    return "Online";
  }

  return normalizedStatus[0].toUpperCase() + normalizedStatus.slice(1);
}

function formatConnection(value = "") {
  const normalizedValue = String(value).trim().toLowerCase();

  if (!normalizedValue || normalizedValue.includes("http") || normalizedValue.includes("mqtt")) {
    return "Wi-Fi meter";
  }

  return value;
}

function formatSignal(value = "") {
  if (!value) {
    return "Good";
  }

  const numericSignal = Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numericSignal)) {
    return value;
  }

  if (numericSignal >= -60) {
    return "Strong";
  }

  if (numericSignal >= -75) {
    return "Good";
  }

  return "Weak";
}

function ProfileField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase text-faint">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm text-tonal">{label}</p>
      <p className="shrink-0 text-right text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function DeviceStatusCard({ user, meter }) {
  if (!user || !meter) {
    return null;
  }

  const deviceStatus = formatDeviceStatus(meter.status);
  const isOnline = deviceStatus.toLowerCase() !== "offline";
  const profileFields = [
    {
      label: "Name",
      value: user.name || "User",
    },
    {
      label: "Email",
      value: user.email || "Not available",
    },
    {
      label: "Meter ID",
      value: meter.meterId || user.meterId || "Assigned",
    },
    {
      label: "Location",
      value: meter.location || "Home",
    },
  ];

  return (
    <section className="surface-panel-secondary panel-hover p-4 lg:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Device Profile</p>
          <h2 className="mt-1 section-heading">Meter details</h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
          <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-400"}`} />
          <span>{isOnline ? "Meter Online" : "Meter Offline"}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="surface-card px-4 py-4 lg:px-5">
          <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            {profileFields.map((item) => (
              <ProfileField key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        </div>

        <div className="surface-card px-4 py-4 lg:px-5">
          <div className="space-y-3">
            <DetailRow label="Connection" value={formatConnection(meter.transport)} />
            <DetailRow label="Signal" value={formatSignal(meter.wifiSignal)} />
            <DetailRow label="Meter type" value="Smart meter" />
            <DetailRow label="Last updated" value={formatTimestamp(meter.lastSync)} />
          </div>
        </div>
      </div>
    </section>
  );
}
