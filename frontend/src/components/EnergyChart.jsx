function getMetricConfig(metric) {
  switch (metric) {
    case "voltage":
      return { label: "Voltage", unit: "V", stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.18)" };
    case "current":
      return { label: "Current", unit: "A", stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.18)" };
    case "energyKWh":
      return { label: "Energy", unit: "kWh", stroke: "#14b8a6", fill: "rgba(20, 184, 166, 0.18)" };
    case "power":
    default:
      return { label: "Power", unit: "W", stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.18)" };
  }
}

export default function EnergyChart({
  history = [],
  metric = "power",
  title,
  subtitle,
}) {
  const config = getMetricConfig(metric);
  const width = 720;
  const height = 220;

  if (!history.length) {
    return (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/75 p-6">
        <p className="text-lg font-medium text-white">{title || `${config.label} Trend`}</p>
        <p className="mt-4 text-sm text-slate-400">No readings are available yet.</p>
      </div>
    );
  }

  const values = history.map((reading) => Number(reading[metric]) || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * (width - 48) + 24;
    const y = height - 30 - ((value - minValue) / range) * (height - 60);
    return `${x},${y}`;
  });

  const areaPath = `M 24 ${height - 30} L ${points.join(" L ")} L ${width - 24} ${height - 30} Z`;
  const linePath = `M ${points.join(" L ")}`;
  const latestValue = values[values.length - 1];

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/75 p-6 shadow-[0_18px_50px_rgba(6,18,22,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-lg font-medium text-white">{title || `${config.label} Trend`}</p>
          <p className="mt-1 text-sm text-slate-400">
            {subtitle || `Latest ${config.label.toLowerCase()} reading from your cloud-connected smart meter.`}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {latestValue}
            <span className="ml-2 text-sm font-normal text-slate-400">{config.unit}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/80">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full">
          <defs>
            <linearGradient id={`fill-${metric}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={config.stroke} stopOpacity="0.45" />
              <stop offset="100%" stopColor={config.stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#fill-${metric})`} />
          <path d={linePath} fill="none" stroke={config.stroke} strokeWidth="4" strokeLinecap="round" />
          <circle
            cx={(values.length / Math.max(values.length, 1)) * (width - 48) + 24}
            cy={height - 30 - ((latestValue - minValue) / range) * (height - 60)}
            r="5"
            fill={config.stroke}
          />

          <line x1="24" y1={height - 30} x2={width - 24} y2={height - 30} stroke="rgba(148, 163, 184, 0.18)" />
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>Min: {minValue} {config.unit}</span>
        <span>Max: {maxValue} {config.unit}</span>
        <span>Points: {history.length}</span>
      </div>
    </div>
  );
}
