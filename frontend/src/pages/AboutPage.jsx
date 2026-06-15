import { useEffect } from "react";
import PublicShell from "../components/PublicShell";

const BENEFITS = [
  {
    title: "🌱 Save Energy",
    description: "Identify base appliance load standby draws and cut down electricity waste immediately.",
  },
  {
    title: "🛡️ Avoid Bill Surprises",
    description: "Know exactly when your billing consumption levels are crossing into higher domestic slabs.",
  },
  {
    title: "🔍 Understand Consumption",
    description: "Translate electric dial metrics into simple, visual curves showing daily active draws.",
  },
  {
    title: "🗓️ Better Planning",
    description: "Budget for home utility bills in advance using live forecasts and active cycle tracking.",
  },
];

export default function AboutPage({ isAuthenticated = false, onDashboard, onNavigate }) {
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

  const handleContactClick = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicShell activePage="about" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      {/* SECTION 1: WHY GRIDSENSE EXISTS */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:py-24 scroll-reveal relative">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/10 filter blur-[80px] pointer-events-none" />
        
        <div className="grid gap-12 lg:grid-cols-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Why GridSense Exists
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl leading-tight">
              Tackling the Lack of Consumption Awareness in Homes
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350">
              For most homeowners, electricity is a silent and invisible expense. Traditional meters hide usage behind complex dials, and monthly bills arrive without warning, leaving households with surprise charges that strain their budget.
            </p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350">
              We believe billing should never be a guessing game. GridSense exists to bridge this gap, translating electrical parameters into simple, visual insights that help households gain full control of their daily consumption footprint.
            </p>
          </div>

          {/* Graphic Side representing unexpected bill issues */}
          <div className="lg:col-span-5 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-3xl filter blur-3xl pointer-events-none" />
            
            <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4 hover-lift card-glow">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Common Homeowner Problems</h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3 text-rose-600 dark:text-rose-400">
                  <span className="text-base mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold">Unexpected Bills</p>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5">Sudden bill spikes due to unmonitored appliance usage during high tariff cycles.</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3 text-amber-600 dark:text-amber-400">
                  <span className="text-base mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold">Lack of Visibility</p>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5">Not knowing what appliances or standby loads contribute most to monthly usage.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW GRIDSENSE HELPS */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/40 border-y border-[var(--surface-border)] transition-colors scroll-reveal relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute bottom-0 right-10 h-[250px] w-[250px] rounded-full bg-purple-500/5 filter blur-[60px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="section-kicker">How GridSense Helps</span>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Bringing Utility Metrics Into Focus
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-slate-200/60 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800 hover-lift card-glow stagger-1">
              <span className="text-2xl">🔍</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">Monitor Usage</h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">
                Watch active household power draws update in real-time to locate standby losses.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800 hover-lift card-glow stagger-2">
              <span className="text-2xl">🔮</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">Predict Bills</h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">
                Forecast monthly expenses computed against domestic domestic utility tariff slabs.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800 hover-lift card-glow stagger-3">
              <span className="text-2xl">⚠️</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">Receive Alerts</h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">
                Get notified of critical grid dips, peak power limit overrides, and load warnings.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800 hover-lift card-glow stagger-4">
              <span className="text-2xl">💳</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">Manage Payments</h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">
                Verify monthly billing logs and settle utility transactions with UPI or Card safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Core Benefits */}
      <section className="py-16 lg:py-24 scroll-reveal relative">
        <div className="absolute top-10 right-10 h-[200px] w-[200px] rounded-full bg-indigo-500/5 filter blur-[80px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="section-kicker">Core Benefits</span>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Why Homeowners Trust GridSense
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, idx) => (
              <div
                key={benefit.title}
                className={`bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-5 rounded-xl hover-lift hover:shadow-sm transition-all card-glow stagger-${(idx % 4) + 1}`}
              >
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{benefit.title}</h4>
                <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CONTACT SECTION */}
      <section id="contact" className="bg-slate-50 py-16 dark:bg-slate-900/40 border-t border-[var(--surface-border)] transition-colors scroll-reveal relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-500/5 filter blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1280px] px-6 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="section-kicker">Get in Touch</span>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Support Center
            </h2>
            <p className="text-sm text-slate-505 dark:text-slate-400">
              Have questions about meter connectivity or payments? Let us know.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Phone Card */}
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col items-center text-center hover-lift hover:shadow-md transition-all card-glow stagger-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Phone Support</h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 mb-3">Direct call with support agents.</p>
              <a href="tel:+918374170152" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                +91 8374170152
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col items-center text-center hover-lift hover:shadow-md transition-all card-glow stagger-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Email Support</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 mb-3">Typical response within 24 hours.</p>
              <a href="mailto:saivamshidanthoju@gmail.com" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                saivamshidanthoju@gmail.com
              </a>
            </div>

            {/* Location Card */}
            <div className="bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col items-center text-center hover-lift hover:shadow-md transition-all card-glow stagger-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Office Location</h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 mb-3">Hyderabad branch office.</p>
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
