import { useState, useEffect } from "react";
import PublicShell from "../components/PublicShell";

// Scroll-triggered Animating Counter Component
function AnimatingCounter({ value, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    const el = document.getElementById(`counter-trigger-${value}`);
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [value, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) {
      setCount(value);
      return;
    }

    const isDecimal = value.toString().includes(".");
    const decimals = isDecimal ? value.toString().split(".")[1].length : 0;
    
    const stepTime = Math.max(Math.floor(duration / 30), 15);
    const timer = setInterval(() => {
      start += end / (duration / stepTime);
      if (start >= end) {
        setCount(end.toFixed(decimals));
        clearInterval(timer);
      } else {
        setCount(start.toFixed(decimals));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, value, duration]);

  return (
    <span id={`counter-trigger-${value}`} className="font-mono">
      {count}{suffix}
    </span>
  );
}

export default function HomePage({ isAuthenticated = false, onDashboard, onNavigate }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [faqOpen, setFaqOpen] = useState({ 0: false, 1: false, 2: false });
  const [worksStep, setWorksStep] = useState(1); // 0-5 mapping Sensors to Dashboard
  const [liveWatts, setLiveWatts] = useState(744);
  const [wattsHistory, setWattsHistory] = useState([740, 746, 742, 745, 741, 748, 743, 746, 742, 744]);

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Live telemetry cycle loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveWatts((prev) => {
        // Fluctuate around 744W in a realistic narrow window (736W to 752W)
        const delta = Math.floor(Math.random() * 6) - 3;
        const nextWatts = Math.max(736, Math.min(752, prev + delta));
        setWattsHistory((history) => [...history.slice(1), nextWatts]);
        return nextWatts;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal IntersectionObserver (Trigger once)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            observer.unobserve(entry.target); // Trigger once
          }
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  const handleHardwareScroll = () => {
    document.getElementById("hardware-setup")?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate real-time mini line chart path and filled area coordinates
  const pathData = wattsHistory.map((val, idx) => {
    const x = (idx / (wattsHistory.length - 1)) * 400;
    // Normalise val between 730 and 760 W to show ripples clearly
    const norm = Math.max(0, Math.min(1, (val - 730) / 30));
    const y = 65 - norm * 45; // range from 20 to 65
    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const fillData = `${pathData} L 400 80 L 0 80 Z`;

  // How it works details mapping
  const FLOW_STEPS = [
    {
      title: "Sensors",
      description: "ACS712 current and ZMPT101B voltage modules gather raw voltage and current waveform data directly from the residential mains load lines.",
      badge: "Analog Layer",
      spec: "1.2 kHz Sample Rate",
    },
    {
      title: "ESP32 MCU",
      description: "Applies analog-to-digital conversions (ADC) and processes digital root-mean-square (RMS) voltage, current draw, and power factor equations in real-time.",
      badge: "Core Controller",
      spec: "Dual Core Tensilica",
    },
    {
      title: "WiFi Uplink",
      description: "Packages raw metrics into a structured JSON string and pushes payloads securely via MQTT / WebSockets client client protocol loops.",
      badge: "Network Layer",
      spec: "TLS Encrypted MQTT",
    },
    {
      title: "Backend API",
      description: "Node.js/Express server ingests data pipelines, recalculates billing thresholds, and triggers warning flags for usage anomalies.",
      badge: "Ingestion System",
      spec: "Express API Service",
    },
    {
      title: "MongoDB",
      description: "A secure NoSQL dataset logs timeseries logs, archives historical payments, and processes query index points efficiently.",
      badge: "Storage Engine",
      spec: "Timeseries Indexing",
    },
    {
      title: "Dashboard UI",
      description: "A fast Vite/React SPA pulls logs and projects current runs against tariffs to keep you ahead of tier boundaries.",
      badge: "Visual Client",
      spec: "Vite + React SPA",
    },
  ];

  return (
    <PublicShell activePage="home" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-[var(--bg-deep)] py-16 lg:py-24 border-b border-[var(--surface-border)] bg-blueprint-pattern scroll-reveal">
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            
            {/* Left Hero side (40% visual weight) */}
            <div className="lg:col-span-5 space-y-4 text-left relative z-10 scroll-reveal reveal-fade-right">
              <span className="inline-flex items-center gap-1.5 rounded bg-[var(--surface-soft)] border border-[var(--surface-border-strong)] px-2.5 py-0.5 text-[9px] font-mono font-bold text-[var(--accent-primary)] uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                <span>ESP32 IoT Meter Project</span>
              </span>
              
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold leading-[1.2] tracking-tight text-[var(--text-primary)] max-w-[18ch]">
                Track Electricity Consumption Before It Impacts Your Bill
              </h1>
              
              <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[var(--text-secondary)] max-w-[48ch]">
                A real IoT-based Smart Energy Meter built using ESP32, ACS712, ZMPT101B, MongoDB, Express, React, and Vite.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-1">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={onDashboard}
                    className="rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-md shadow-[var(--accent-primary)]/15"
                  >
                    Access Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate?.("login")}
                      className="rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-md shadow-[var(--accent-primary)]/15"
                    >
                      Access Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleHardwareScroll}
                      className="rounded-lg border border-[var(--surface-border-strong)] bg-[var(--surface-solid)] px-5 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-all"
                    >
                      View Hardware Setup
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Hero side: Realistic industrial energy panel (60% visual weight) */}
            <div className="lg:col-span-7 relative z-10 scroll-reveal reveal-fade-left stagger-2 lg:dashboard-hero-offset">
              <div className="border border-[var(--surface-border)] bg-[var(--surface-solid)] rounded-xl overflow-hidden p-5 text-left relative shadow-xl">
                
                {/* Console Header */}
                <div className="flex justify-between items-center pb-3 border-b border-[var(--surface-border)] mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wider text-[var(--text-primary)]">METER: GS-SC1048-A</span>
                  </div>
                  <div className="flex gap-4 text-[9px] text-[var(--text-secondary)]">
                    <span>SYNC: 2s ago</span>
                    <span className="text-[var(--accent-primary)] font-bold">STATUS: ONLINE</span>
                  </div>
                </div>

                {/* Main Metrics Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 font-mono">
                  
                  {/* Active Power */}
                  <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-3 rounded-lg">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider">Active Power</span>
                    <div className="text-xl font-bold text-[var(--text-primary)] mt-1 tracking-tight">
                      {liveWatts} <span className="text-[10px] font-normal text-[var(--text-secondary)]">W</span>
                    </div>
                    <div className="text-[8px] text-[var(--accent-primary)] mt-0.5">Measured RMS</div>
                  </div>

                  {/* Voltage */}
                  <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-3 rounded-lg">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider">RMS Voltage</span>
                    <div className="text-xl font-bold text-[var(--text-primary)] mt-1 tracking-tight">
                      230.8 <span className="text-[10px] font-normal text-[var(--text-secondary)]">V</span>
                    </div>
                    <div className="text-[8px] text-[var(--accent-primary)] mt-0.5">Stable 50Hz</div>
                  </div>

                  {/* Current */}
                  <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-3 rounded-lg">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider">Line Current</span>
                    <div className="text-xl font-bold text-[var(--text-primary)] mt-1 tracking-tight">
                      {(liveWatts / 230.8).toFixed(2)} <span className="text-[10px] font-normal text-[var(--text-secondary)]">A</span>
                    </div>
                    <div className="text-[8px] text-[var(--text-tertiary)] mt-0.5">ACS712 Sensor</div>
                  </div>

                  {/* Energy Today */}
                  <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-3 rounded-lg">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider">Energy Today</span>
                    <div className="text-xl font-bold text-[var(--text-primary)] mt-1 tracking-tight">
                      4.21 <span className="text-[10px] font-normal text-[var(--text-secondary)]">kWh</span>
                    </div>
                    <div className="text-[8px] text-[var(--text-tertiary)] mt-0.5">Accumulating</div>
                  </div>

                  {/* Est. Cost */}
                  <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-3 rounded-lg">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider">Estimated Bill</span>
                    <div className="text-xl font-bold text-[#c26d4b] mt-1 tracking-tight">
                      ₹ 622
                    </div>
                    <div className="text-[8px] text-[var(--text-tertiary)] mt-0.5">Current Slab</div>
                  </div>

                  {/* Meter Status */}
                  <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider">Load Rating</span>
                    <div className="text-[10px] font-bold text-[var(--accent-primary)] bg-[var(--surface-soft)] border border-[var(--surface-border-strong)] py-0.5 px-2 rounded text-center mt-2 max-w-max">
                      NORMAL
                    </div>
                  </div>

                </div>

                {/* SVG Oscilloscope Waveform Grid */}
                <div className="bg-[var(--surface-soft)] border border-[var(--surface-border)] p-4 rounded-lg font-mono">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">TELEMETRY WAVEFORM RECORD // ACTIVE DRAW</span>
                    <span className="text-[8px] text-[var(--text-tertiary)]">SAMPLING: 1.2 kHz</span>
                  </div>
                  <div className="h-24 w-full relative">
                    <svg viewBox="0 0 400 80" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-area-glow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      {/* Grid background reference lines (Oscilloscope style) */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="var(--surface-border)" strokeWidth="0.75" />
                      <line x1="0" y1="40" x2="400" y2="40" stroke="var(--surface-border)" strokeWidth="0.75" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="var(--surface-border)" strokeWidth="0.75" />
                      <line x1="100" y1="0" x2="100" y2="80" stroke="var(--surface-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                      <line x1="200" y1="0" x2="200" y2="80" stroke="var(--surface-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                      <line x1="300" y1="0" x2="300" y2="80" stroke="var(--surface-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                      
                      {/* Filled Area */}
                      <path d={fillData} fill="url(#chart-area-glow)" className="transition-all duration-300" />

                      {/* Stroke path line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section id="problem-section" className="bg-[var(--surface-soft)] py-20 lg:py-24 border-b border-[var(--surface-border)] relative scroll-reveal">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Column: Problem Copy */}
            <div className="lg:col-span-6 space-y-6 text-left scroll-reveal reveal-fade-right">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest font-mono">SaaS Problem Domain</span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                Why Electricity Bills Surprise Homeowners
              </h2>
              <p className="text-base leading-[1.7] text-[var(--text-secondary)] max-w-[65ch] saas-body-copy">
                Residential meters sit enclosed in utility boxes outside. Without active logging systems, consumers are locked out of their own telemetry data, leading to surprise charges.
              </p>

              <div className="space-y-6 pt-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-6 w-6 text-rose-500 font-bold">✕</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Unexpected Bill Spikes</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      One high-load appliance running overnight crosses limits and retroactively shifts you into higher price brackets.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-6 w-6 text-rose-500 font-bold">✕</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">No Visibility Into Appliance Usage</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      You cannot check how many Watts your water heater, AC unit, or pumps draw when they switch on.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-6 w-6 text-rose-500 font-bold">✕</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">No Real-Time Monitoring</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Standard smart meters only record data for utility bill extraction, not for consumer diagnostics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-6 w-6 text-rose-500 font-bold">✕</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Delayed Monthly Feedback</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Receiving energy parameters 30 days after consumption prevents users from correcting high-cost habits.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Visual Step Graph (Slab Jump Illustration) */}
            <div className="lg:col-span-6 scroll-reveal reveal-fade-left stagger-2">
              <div className="bg-[var(--surface-solid)] border border-[var(--surface-border)] rounded-xl p-6 text-left">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">The Multiplier Effect of Slab Traps</h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-6">
                  Unlike normal pricing, utility tariffs scale in discrete blocks. Breach a slab, and your total run cost jumps retroactively.
                </p>

                {/* Slab Chart graphic */}
                <div className="h-44 w-full relative border-l border-b border-[var(--surface-border)] mt-2">
                  {/* Step lines */}
                  <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                    {/* Grid background lines */}
                    <line x1="0" y1="90" x2="300" y2="90" stroke="var(--surface-border)" strokeDasharray="3 2" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="var(--surface-border)" strokeDasharray="3 2" />
                    <line x1="0" y1="30" x2="300" y2="30" stroke="var(--surface-border)" strokeDasharray="3 2" />
                    
                    {/* Slab Step line */}
                    <path
                      d="M 0,110 L 100,110 L 100,75 L 200,75 L 200,35 L 300,35"
                      fill="none"
                      stroke="#cf5b36"
                      strokeWidth="3.5"
                    />

                    {/* Threshold markers */}
                    <line x1="100" y1="0" x2="100" y2="120" stroke="var(--surface-border-strong)" strokeWidth="1.5" strokeDasharray="2 2" />
                    <line x1="200" y1="0" x2="200" y2="120" stroke="var(--surface-border-strong)" strokeWidth="1.5" strokeDasharray="2 2" />
                    
                    {/* Point indicators */}
                    <circle cx="100" cy="75" r="4.5" fill="#cf5b36" />
                    <circle cx="200" cy="35" r="4.5" fill="#cf5b36" />
                  </svg>
                  
                  <span className="absolute bottom-2 left-6 text-[8px] font-bold text-[var(--text-tertiary)]">Slab 1 (Base)</span>
                  <span className="absolute bottom-12 left-[38%] text-[8px] font-bold text-[var(--text-tertiary)]">Slab 2 (+85%)</span>
                  <span className="absolute bottom-24 right-6 text-[8px] font-bold text-[var(--text-tertiary)]">Slab 3 (+170%)</span>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--surface-border)] text-[10px] text-[var(--text-secondary)]">
                  <span>Slab 2 threshold: <b>200 Units</b></span>
                  <span>Slab 3 threshold: <b>300 Units</b></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5 — KEY FEATURES */}
      <section className="bg-[var(--bg-base)] py-20 lg:py-24 border-b border-[var(--surface-border)] relative overflow-hidden scroll-reveal">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest font-mono">Platform Capabilities</span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-base leading-[1.7] text-[var(--text-secondary)] max-w-[65ch] saas-body-copy mx-auto">
              We design software specifically for household microgrid management. No bloated, generic marketing templates.
            </p>
          </div>

          {/* Clean 3-column layout, no glass floats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Live Monitoring",
                desc: "Check active voltage phases, load currents, and instant watt parameters. Refreshes continuously.",
                icon: "⚡",
              },
              {
                title: "Energy Analytics",
                desc: "Review logs, cycle records, and daily charts to isolate high load patterns.",
                icon: "📈",
              },
              {
                title: "Bill Estimation",
                desc: "GridSense calculates live projections against regional tariffs, accounting for slab rate boundaries.",
                icon: "₹",
              },
              {
                title: "Consumption Prediction",
                desc: "Runs linear heuristics based on seasonal statistics to forecast total billing statements.",
                icon: "🔮",
              },
              {
                title: "Smart Alerts",
                desc: "Instant warning notifications if active power draws breach peak contract thresholds.",
                icon: "🔔",
              },
              {
                title: "Secure Login",
                desc: "Protects consumer parameters and timeseries databases with robust authentication hooks.",
                icon: "🔐",
              },
            ].map((f, idx) => (
              <div key={f.title} className={`flat-card p-6 text-left scroll-reveal reveal-scale-in stagger-${(idx % 3) + 1}`}>
                <div className="text-xl mb-3 text-[var(--accent-primary)]">{f.icon}</div>
                <h4 className="text-[20px] font-bold text-[var(--text-primary)] mb-2">{f.title}</h4>
                <p className="text-base leading-[1.7] text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* SECTION 6 — PROJECT HARDWARE */}
      <section id="hardware-setup" className="bg-[var(--bg-deep)] py-20 lg:py-24 border-b border-[var(--surface-border)] relative overflow-hidden scroll-reveal">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest font-mono">Hardware spec</span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              Project Hardware Infrastructure
            </h2>
            <p className="text-base leading-[1.7] text-[var(--text-secondary)] max-w-[65ch] saas-body-copy mx-auto">
              We leverage raw microcontrollers and sensory modules to translate high-voltage phases into digital datasets.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: "ESP32 MCU",
                spec: "Xtensa 32-bit",
                desc: "Orchestrates ADC conversions, calculates power variables, and maintains WiFi client protocols.",
                pin: "38 GPIO Pins",
              },
              {
                title: "ACS712 Sensor",
                spec: "Current Transducer",
                desc: "Gathers alternating current signatures from 0 to 30A using Hall-effect transducers.",
                pin: "Analog Output",
              },
              {
                title: "ZMPT101B Sensor",
                spec: "Voltage Transformer",
                desc: "Reads phase AC voltage waveforms up to 250V using electromagnetic coupling.",
                pin: "High-Impedance Pin",
              },
              {
                title: "LCD Display",
                spec: "16x2 I2C Screen",
                desc: "Presents instant parameters locally on the hardware box for quick spot inspections.",
                pin: "I2C Interface",
              },
              {
                title: "WiFi Connectivity",
                spec: "2.4 GHz Module",
                desc: "Handles network negotiations and secures connections to timeseries ingest servers.",
                pin: "Built-In Antenna",
              },
            ].map((h, idx) => (
              <div key={h.title} className={`bg-[var(--surface-solid)] border border-[var(--surface-border)] rounded-xl p-5 text-left flex flex-col justify-between scroll-reveal reveal-fade-up stagger-${idx + 1}`}>
                <div>
                  <h4 className="text-[20px] font-bold text-[var(--text-primary)]">{h.title}</h4>
                  <p className="text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-wider mt-0.5">{h.spec}</p>
                  <p className="text-base leading-[1.7] text-[var(--text-secondary)] mt-3">
                    {h.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--surface-border)] text-[9px] font-mono text-[var(--text-tertiary)]">
                  Port: {h.pin}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — IMPACT METRICS */}
      <section className="bg-[#e8f0eb] text-[var(--text-primary)] py-16 border-b border-[var(--surface-border)] relative overflow-hidden scroll-reveal">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 divide-y divide-[var(--surface-border-strong)] sm:divide-y-0 sm:divide-x divide-[var(--surface-border-strong)]">
            
            <div className="p-4 text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[var(--accent-primary)]">
                <AnimatingCounter value="100" suffix="%" />
              </div>
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] mt-2 uppercase tracking-wider">Real-Time Monitoring</h4>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-[1.6]">Continuous sub-second tracking of voltage, current, and active load.</p>
            </div>

            <div className="p-4 pt-8 sm:pt-4 text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[var(--accent-primary)]">
                <AnimatingCounter value="95" suffix="%" />
              </div>
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] mt-2 uppercase tracking-wider">Bill Awareness</h4>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-[1.6]">Avoid tier limits by tracking billing parameters dynamically.</p>
            </div>

            <div className="p-4 pt-8 sm:pt-4 text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[var(--accent-primary)]">
                <AnimatingCounter value="24" suffix="/7" />
              </div>
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] mt-2 uppercase tracking-wider">Consumption Tracking</h4>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-[1.6]">Historical charts aggregate hourly data for optimization.</p>
            </div>

            <div className="p-4 pt-8 sm:pt-4 text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[var(--accent-primary)]">
                <AnimatingCounter value="99.9" suffix="%" />
              </div>
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] mt-2 uppercase tracking-wider">24/7 Accessibility</h4>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-[1.6]">Secure cloud database keeps parameter values retrievable globally.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 8 — FAQ */}
      <section className="bg-[var(--bg-base)] py-20 lg:py-24 relative overflow-hidden scroll-reveal">
        <div className="mx-auto max-w-[840px] px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest font-mono">FAQ Panel</span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base leading-[1.7] text-[var(--text-secondary)] max-w-[65ch] saas-body-copy mx-auto">
              Clear technical details explaining the sensory architecture and slab configurations.
            </p>
          </div>

          {/* Accordion list */}
          <div className="space-y-4">
            {[
              [
                "How does the hardware measure power variables?",
                "The ZMPT101B voltage transformer captures line voltage waveforms, and the ACS712 sensor records line currents. The ESP32 gathers these analog signals and computes active power (P = V * I * cosφ) to account for phase displacements."
              ],
              [
                "Is internet access mandatory for the local unit?",
                "Yes. The ESP32 requires a local 2.4 GHz WiFi connection to deliver telemetry parameters to the central Timeseries Ingestion service. An onboard LCD display shows load values locally in case of disconnect."
              ],
              [
                "How does the slab predictor alert users?",
                "The billing algorithm calculates daily average usage rates. If current values indicate consumption will cross local slab rate limits before the end of the month, the engine triggers notifications."
              ]
            ].map(([q, a], idx) => {
              const open = faqOpen[idx];
              return (
                <div key={idx} className={`border border-[var(--surface-border)] bg-[var(--surface-solid)] rounded-xl overflow-hidden scroll-reveal reveal-fade-up stagger-${idx + 1}`}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-[15px] text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors"
                  >
                    <span>{q}</span>
                    <span className="text-xs text-[var(--accent-primary)] font-bold shrink-0 ml-3">
                      {open ? "▲" : "▼"}
                    </span>
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-base leading-[1.7] text-[var(--text-secondary)] border-t border-[var(--surface-border)] pt-3 animate-fade-up">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 9 — CTA */}
      <section className="bg-[#f4f0e6] text-[var(--text-primary)] py-20 border-t border-[var(--surface-border)] relative overflow-hidden scroll-reveal">
        <div className="mx-auto max-w-[800px] px-6 text-center space-y-6 scroll-reveal reveal-cta">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            Start Monitoring Your Electricity Smarter
          </h2>
          <p className="text-base leading-[1.7] text-[var(--text-secondary)] max-w-[65ch] mx-auto saas-body-copy">
            Link your sensory node or service connection number, view power factor curves, and optimize billing boundaries today.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => onNavigate?.("login")}
              className="rounded-lg bg-[var(--accent-primary)] px-8 py-3.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-primary)]/15"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

    </PublicShell>
  );
}
