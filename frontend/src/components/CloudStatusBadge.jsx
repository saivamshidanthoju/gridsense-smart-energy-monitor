const STATUS_STYLES = {
  "Meter Online": {
    dot: "bg-emerald-400",
    tone: "border-emerald-300/25 bg-emerald-50/90 text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-500/10 dark:text-emerald-100",
  },
  "Data updated": {
    dot: "bg-cyan-400",
    tone: "border-cyan-300/25 bg-cyan-50/90 text-cyan-700 dark:border-cyan-400/18 dark:bg-cyan-500/10 dark:text-cyan-100",
  },
  "Waiting for data": {
    dot: "bg-slate-400",
    tone: "border-slate-300/35 bg-slate-100/90 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200",
  },
  "Demo data": {
    dot: "bg-amber-400",
    tone: "border-amber-300/25 bg-amber-50/90 text-amber-700 dark:border-amber-400/18 dark:bg-amber-500/10 dark:text-amber-100",
  },
  "Meter Offline": {
    dot: "bg-rose-400",
    tone: "border-rose-300/25 bg-rose-50/90 text-rose-700 dark:border-rose-400/18 dark:bg-rose-500/10 dark:text-rose-100",
  },
};

function resolveStatusLabel(status = "") {
  const normalizedStatus = String(status).trim().toLowerCase();

  if (!normalizedStatus) {
    return "Waiting for data";
  }

  if (normalizedStatus.includes("offline")) {
    return "Meter Offline";
  }

  if (normalizedStatus.includes("standby")) {
    return "Waiting for data";
  }

  if (normalizedStatus.includes("mock") || normalizedStatus.includes("demo")) {
    return "Demo data";
  }

  if (
    normalizedStatus.includes("connected") ||
    normalizedStatus.includes("backend") ||
    normalizedStatus.includes("cloud")
  ) {
    return "Meter Online";
  }

  return status;
}

export default function CloudStatusBadge({ status }) {
  const resolvedStatus = resolveStatusLabel(status);
  const style = STATUS_STYLES[resolvedStatus] || STATUS_STYLES["Waiting for data"];

  return (
    <div className={`inline-flex h-9 items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.tone}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      <span>{resolvedStatus}</span>
    </div>
  );
}
