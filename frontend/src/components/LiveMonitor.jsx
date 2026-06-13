import { useEffect, useRef } from "react";

function MetricCard({ label, value, unit, color, icon, subtitle }) {
  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${color.badge}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold tabular-nums ${color.text}`}>{value}</span>
        <span className="text-gray-500 text-sm">{unit}</span>
      </div>
      {subtitle && <p className="text-gray-600 text-xs">{subtitle}</p>}
    </div>
  );
}

function Sparkline({ data, color = "#22d3ee", height = 60 }) {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const vals = data.map(d => d.power);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    const pts = vals.map((v, i) => ({
      x: (i / (vals.length - 1)) * w,
      y: h - ((v - min) / range) * (h - 10) - 5,
    }));
    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "40");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h);
    ctx.fillStyle = grad;
    ctx.fill();
    // Line
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
    // Dot at end
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color, height]);

  return <canvas ref={canvasRef} width={600} height={height} className="w-full" style={{ height }} />;
}

function GaugeMeter({ value, min, max, label, unit, colorClass, dangerPct = 85 }) {
  const pct = Math.min(100, ((value - min) / (max - min)) * 100);
  const isDanger = pct >= dangerPct;
  const angle = -135 + (pct / 100) * 270;
  const r = 48, cx = 64, cy = 64;
  const toRad = deg => (deg * Math.PI) / 180;
  const arcPt = deg => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });
  const startAngle = -135 + 90; // adjusted for SVG
  const endDeg = -135 + (pct / 100) * 270 + 90;
  const largeArc = pct > 50 ? 1 : 0;
  const s = arcPt(-135 + 90);
  const e = arcPt(endDeg);
  const trackS = arcPt(-135 + 90);
  const trackE = arcPt(-135 + 270 + 90);
  const strokeColor = isDanger ? "#ef4444" : colorClass === "cyan" ? "#22d3ee" : colorClass === "amber" ? "#f59e0b" : "#a78bfa";

  return (
    <div className="flex flex-col items-center">
      <svg width="128" height="80" viewBox="0 0 128 90">
        {/* Track */}
        <path
          d={`M ${trackS.x} ${trackS.y} A ${r} ${r} 0 1 1 ${trackE.x} ${trackE.y}`}
          fill="none" stroke="#1f2937" strokeWidth="8" strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`}
            fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
          />
        )}
        {/* Value text */}
        <text x="64" y="66" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="monospace">{value}</text>
        <text x="64" y="80" textAnchor="middle" fill="#6b7280" fontSize="9">{unit}</text>
      </svg>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

export default function LiveMonitor({ liveData, readings, todayKwh, monthKwh, user }) {
  const powerKw = (liveData.power / 1000).toFixed(2);
  const dailyCost = (todayKwh * 6.5).toFixed(1);
  const meterId = user?.meterId || "ESP32-A4F2";

  return (
    <div className="space-y-5">
      {/* Top metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Power" value={powerKw} unit="kW" icon="⚡"
          color={{ text: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400" }}
          subtitle={liveData.power > 2000 ? "⚠ High load" : "Normal range"} />
        <MetricCard label="Voltage" value={liveData.voltage} unit="V" icon="〜"
          color={{ text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400" }}
          subtitle={liveData.voltage < 210 ? "⚠ Low voltage" : "Stable"} />
        <MetricCard label="Current" value={liveData.current} unit="A" icon="↯"
          color={{ text: "text-violet-400", badge: "bg-violet-500/10 text-violet-400" }}
          subtitle={`PF: ${liveData.pf}`} />
        <MetricCard label="Frequency" value={liveData.frequency} unit="Hz" icon="∿"
          color={{ text: "text-green-400", badge: "bg-green-500/10 text-green-400" }}
          subtitle="Grid synchronized" />
      </div>

      {/* Gauges + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauges */}
        <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Live Gauges</h3>
            <span className="flex items-center gap-1.5 text-green-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />ESP32 Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <GaugeMeter value={liveData.voltage} min={180} max={260} label="Voltage" unit="V" colorClass="amber" dangerPct={90} />
            <GaugeMeter value={liveData.current} min={0} max={15} label="Current" unit="A" colorClass="violet" dangerPct={85} />
            <GaugeMeter value={+powerKw} min={0} max={6} label="Power" unit="kW" colorClass="cyan" dangerPct={80} />
          </div>
        </div>

        {/* Daily/Monthly summary */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Today's Usage</p>
            <p className="text-3xl font-bold text-white tabular-nums">{todayKwh} <span className="text-lg font-normal text-gray-500">kWh</span></p>
            <p className="text-cyan-400 text-sm mt-1">₹ {dailyCost} so far</p>
            <div className="mt-3 bg-gray-800 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (todayKwh / 30) * 100)}%` }} />
            </div>
            <p className="text-gray-600 text-xs mt-1">{Math.round((todayKwh / 30) * 100)}% of 30 kWh target</p>
          </div>
          <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">This Month</p>
            <p className="text-3xl font-bold text-white tabular-nums">{monthKwh} <span className="text-lg font-normal text-gray-500">kWh</span></p>
            <p className="text-violet-400 text-sm mt-1">₹ {(monthKwh * 6.5).toFixed(0)} estimated</p>
            <div className="mt-3 bg-gray-800 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (monthKwh / 450) * 100)}%` }} />
            </div>
            <p className="text-gray-600 text-xs mt-1">{Math.round((monthKwh / 450) * 100)}% of 450 kWh budget</p>
          </div>
          {/* Sparkline */}
          <div className="col-span-2 bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium">Power trend (last 30 readings)</p>
              <p className="text-cyan-400 text-xs font-mono">{liveData.power.toFixed(0)} W</p>
            </div>
            {readings.length > 2 && <Sparkline data={readings} />}
          </div>
        </div>
      </div>

      {/* ESP32 Data Stream */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-gray-400 text-xs font-mono">
            ESP32 Serial Stream · MQTT Topic: <span className="text-cyan-400 font-bold">energy/meter/{meterId}</span>
          </p>
        </div>
        <div className="bg-gray-950 rounded-xl p-3 font-mono text-xs text-green-400 overflow-x-auto">
          <p>{`>> [${new Date().toLocaleTimeString()}] V=${liveData.voltage}V | I=${liveData.current}A | P=${liveData.power.toFixed(1)}W | F=${liveData.frequency}Hz | PF=${liveData.pf}`}</p>
          <p className="text-gray-600">{`>> [${new Date(Date.now() - 2000).toLocaleTimeString()}] Relay status: R1=ON R2=OFF R3=ON R4=OFF R5=ON R6=ON`}</p>
          <p className="text-gray-600">{`>> [${new Date(Date.now() - 4000).toLocaleTimeString()}] WiFi RSSI: -62 dBm | IP: 192.168.1.104 | Uptime: 14h32m`}</p>
        </div>
      </div>
    </div>
  );
}
