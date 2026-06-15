import { useState, useEffect } from "react";
import PublicShell from "../components/PublicShell";

const BENEFITS = [
  {
    title: "⚡ Real-Time Usage Tracking",
    description: "Track electricity usage as it happens. Watch active power loads and appliance draws update instantly.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "📈 Monthly Bill Estimation",
    description: "Know your expected bill before it arrives. Track usage and see cost estimates computed against slab rates.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "📊 Usage History",
    description: "Track bills, review monthly cycles, and access historical logs from a centralized dashboard.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "🔔 Instant Alerts",
    description: "Receive warnings for abnormal consumption patterns. Protect your home from peak load limits.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect Meter",
    description: "Enter your Service Connection Number to link your residential meter instantly.",
  },
  {
    step: "02",
    title: "Track Usage",
    description: "Log in to watch daily and hourly energy usage curves update dynamically.",
  },
  {
    step: "03",
    title: "Monitor Bills",
    description: "Get monthly bill predictions computed dynamically based on current usage slabs.",
  },
  {
    step: "04",
    title: "Pay Online",
    description: "Track historical bills, payment schedules, and clear outstanding balances securely.",
  },
];

const PREVIEWS = {
  dashboard: {
    label: "Usage Overview",
    title: "Household Energy Dashboard",
    description: "A centralized control panel showing live active power load, accumulated daily energy consumption, and connection status.",
    badge: "Real-time stream",
    element: (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">GridSense Dashboard</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Current Load</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">720 W</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Today's Usage</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">4.2 kWh</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Est. Month Bill</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">₹ 622.00</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Usage Curve</p>
          <div className="flex items-end gap-1.5 h-16">
            {[10, 25, 45, 30, 20, 55, 40, 35, 60, 45, 50, 65].map((h, i) => (
              <span key={i} className="flex-1 rounded-sm bg-indigo-500" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  billing: {
    label: "Billing Details",
    title: "Billing & Cost breakdown",
    description: "Detailed breakdowns showing fixed utility costs versus active energy consumption, itemized by regional slabs.",
    badge: "Tariff estimates",
    element: (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Billing Period - June 2026</span>
          <span className="rounded bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[9px] font-bold">Unpaid</span>
        </div>
        <div className="mt-4 flex gap-4 items-center">
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Total Charges Due</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">₹ 622.00</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Due date: 28-Jun-2026</p>
          </div>
          <div className="h-16 w-16 border-4 border-indigo-500 border-t-orange-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-slate-800 dark:text-white">88% Energy</span>
          </div>
        </div>
        <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Energy Charges (Slab 1)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">₹ 512.00</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400 border-b border-dashed pb-2">
            <span>Fixed Customer Charges</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">₹ 110.00</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-850 dark:text-slate-150">
            <span>Total Payable</span>
            <span>₹ 622.00</span>
          </div>
        </div>
      </div>
    ),
  },
  alerts: {
    label: "Usage Alerts",
    title: "Grid & Hardware Alerts",
    description: "Receive push notifications or email alerts for abnormal peak loads, voltage stabilizer risks, and localized outages.",
    badge: "Consumer safety",
    element: (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">System Notifications</span>
          <span className="text-[10px] text-rose-500 font-bold">1 Active Issue</span>
        </div>
        
        <div className="rounded-lg border border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 p-3 flex gap-3">
          <span className="text-base mt-0.5">⚠️</span>
          <div>
            <h5 className="text-xs font-semibold text-rose-700 dark:text-rose-455">High Usage Alert</h5>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 leading-normal">
              Consumption exceeded 2.1 kW peak limit. Consider turning off water heaters or heavy appliances.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3 flex gap-3">
          <span className="text-base mt-0.5">ℹ️</span>
          <div>
            <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-350">Estimated Bill Computed</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              Estimated bill for the active cycle has been recalculated from new smart meter logs.
            </p>
          </div>
        </div>
      </div>
    ),
  },
};

export default function HomePage({ isAuthenticated = false, onDashboard, onNavigate }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [faqOpen, setFaqOpen] = useState({ 0: false, 1: false, 2: false, 3: false });

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const preview = PREVIEWS[activeTab] || PREVIEWS.dashboard;

  const handleLearnMore = () => {
    document.getElementById("why-choose")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <PublicShell activePage="home" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      {/* SECTION 1: HERO SECTION */}
      <section className="mx-auto max-w-[1360px] px-6 py-16 lg:py-24 scroll-reveal relative">
        {/* Glow behind Hero content */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/10 filter blur-[80px] pointer-events-none" />
        
        <div className="grid gap-12 lg:grid-cols-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight">
              Know Your Electricity Usage <br className="hidden md:inline" />
              Before Your Bill Arrives
            </h1>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
              Track daily consumption, estimate monthly bills, receive alerts, and manage payments from one simple dashboard.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onDashboard}
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all hover-lift"
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("login")}
                    className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all hover-lift"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={handleLearnMore}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-55 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 hover-lift"
                  >
                    Learn More
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Right: Realistic dashboard preview card */}
          <div className="lg:col-span-5 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-3xl filter blur-3xl pointer-events-none" />
            
            <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85 transition-colors card-glow hover-lift">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Smart Meter Dashboard</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">SC No: SC-104829375</span>
              </div>

              {/* Homeowner KPIs */}
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                  <span className="text-xs text-slate-500 font-medium">Today's Usage</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">4.2 kWh</span>
                </div>
                <div className="flex justify-between items-center rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                  <span className="text-xs text-slate-500 font-medium">Estimated Monthly Bill</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">₹ 622.00</span>
                </div>
                <div className="flex justify-between items-center rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                  <span className="text-xs text-slate-500 font-medium">Consumption Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-450">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Normal usage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY CHOOSE GRIDSENSE */}
      <section id="why-choose" className="bg-slate-50 py-16 dark:bg-slate-900/40 transition-colors border-y border-[var(--surface-border)] scroll-reveal relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute bottom-0 right-10 h-[250px] w-[250px] rounded-full bg-purple-500/5 filter blur-[60px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Why Choose GridSense
            </h2>
            <p className="text-sm text-slate-650 dark:text-slate-350">
              A simple, reliable utility tool designed to help you keep tabs on your home's power consumption.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, idx) => (
              <div
                key={b.title}
                className={`bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800/80 dark:hover:border-slate-700 transition-all duration-200 hover-lift card-glow stagger-${(idx % 4) + 1}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
                  {b.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: STATISTICS SECTION */}
      <section className="py-16 scroll-reveal relative overflow-hidden border-b border-[var(--surface-border)]">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/5 filter blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 rounded-2xl p-6 text-center hover-lift card-glow stagger-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 font-mono leading-none">
                14.2%
              </span>
              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">Average Energy Saved</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Optimized by real-time load analytics and alerts</p>
            </div>
            
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 rounded-2xl p-6 text-center hover-lift card-glow stagger-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 font-mono leading-none">
                98.4%
              </span>
              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">Estimation Accuracy</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Dynamic billing slab calculation accuracy</p>
            </div>
            
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 rounded-2xl p-6 text-center hover-lift card-glow stagger-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500 dark:from-indigo-400 dark:to-emerald-450 font-mono leading-none">
                2,400+
              </span>
              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">Active Connections</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">GridSense smart meters monitored nationwide</p>
            </div>
            
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 rounded-2xl p-6 text-center hover-lift card-glow stagger-4">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 dark:from-pink-400 dark:to-orange-400 font-mono leading-none">
                24/7
              </span>
              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">Uptime Monitoring</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Constant outage tracking and anomaly detection</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="py-16 scroll-reveal relative">
        <div className="absolute top-10 left-10 h-[200px] w-[200px] rounded-full bg-indigo-500/5 filter blur-[80px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Simple Steps to Energy Control
            </h2>
            <p className="text-sm text-slate-650 dark:text-slate-350">
              Getting started is quick and requires no hardware installations.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            {STEPS.map((s, idx) => (
              <div key={s.title} className={`relative group p-5 rounded-2xl bg-white/50 border border-transparent hover:border-slate-200/60 dark:bg-transparent dark:hover:bg-slate-900/20 dark:hover:border-slate-800/60 transition-all hover-lift stagger-${(idx % 4) + 1}`}>
                <div className="text-5xl font-extrabold text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors select-none font-mono">
                  {s.step}
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE PREVIEW TABS (DASHBOARD PREVIEW) */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/40 transition-colors border-y border-[var(--surface-border)] scroll-reveal relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full bg-purple-500/5 filter blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            
            {/* Left side info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Explore the Platform
              </h2>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350">
                GridSense organizes your utilities in a simple, readable dashboard designed for your phone, tablet, or desktop.
              </p>

              {/* Tab Selector Buttons */}
              <div className="flex flex-col gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                {Object.keys(PREVIEWS).map((k) => {
                  const item = PREVIEWS[k];
                  const isActive = activeTab === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActiveTab(k)}
                      className={`text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/20"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side interactive visual */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl dark:bg-slate-900 dark:border-slate-800 hover-lift card-glow">
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{preview.badge}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{preview.title}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {preview.description}
                </p>
                {preview.element}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ SECTION */}
      <section className="py-16 transition-colors scroll-reveal relative">
        <div className="absolute bottom-10 left-10 h-[250px] w-[250px] rounded-full bg-indigo-500/5 filter blur-[90px] pointer-events-none" />
        
        <div className="mx-auto max-w-[980px] px-6 relative z-10">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-655 dark:text-slate-350">
              Clear answers to help you get the most out of your home energy tracker.
            </p>
          </div>

          <div className="space-y-3">
            {[
              [
                "How does GridSense connect to my electricity meter?",
                "GridSense syncs securely with your home's smart meter using digital connections, fetching electricity usage updates automatically without requiring any extra sensors or installations."
              ],
              [
                "Is my electricity data secure?",
                "Absolutely. GridSense employs standard data encryption protocols. Your daily household usage details, billing cycle metrics, and account credentials are saved securely and kept private."
              ],
              [
                "How accurate are the monthly bill estimates?",
                "The estimates are calculated against local utility slab tariffs. They generally maintain 95%+ accuracy and update continuously as your household usage habits fluctuate."
              ],
              [
                "Can I pay my utility bills directly inside the portal?",
                "Yes. GridSense integrates secure digital payment integrations allowing you to settle cycle invoices instantly via cards, net banking, or UPI, downloading official digital receipts directly."
              ]
            ].map(([q, a], idx) => {
              const open = faqOpen[idx];
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-white overflow-hidden dark:bg-slate-900 dark:border-slate-800 card-glow"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{q}</span>
                    <span className="text-xs text-indigo-500 font-bold shrink-0 ml-3">
                      {open ? "▲" : "▼"}
                    </span>
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-xs text-slate-550 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 animate-fade-in">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: CONTACT SUPPORT SECTION */}
      <section id="contact" className="bg-slate-50 py-16 dark:bg-slate-900/40 transition-colors border-t border-[var(--surface-border)] scroll-reveal relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-500/5 filter blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Need Help?
            </h2>
            <p className="text-sm text-slate-650 dark:text-slate-350">
              Have questions about your connection or payment? Contact our support team.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Phone Card */}
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col items-center text-center hover-lift hover:shadow-md transition-all card-glow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Phone Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Speak directly with our support engineers.</p>
              <a href="tel:+918374170152" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                +91 8374170152
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col items-center text-center hover-lift hover:shadow-md transition-all card-glow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Email Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Drop us an email and we'll reply within 24 hours.</p>
              <a href="mailto:saivamshidanthoju@gmail.com" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                saivamshidanthoju@gmail.com
              </a>
            </div>

            {/* Location Card */}
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col items-center text-center hover-lift hover:shadow-md transition-all card-glow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Location</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Our operational headquarters.</p>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Hyderabad, India
              </span>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
