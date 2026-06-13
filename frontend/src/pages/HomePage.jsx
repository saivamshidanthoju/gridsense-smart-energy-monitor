import PublicShell from "../components/PublicShell";

const FEATURES = [
  {
    title: "Live meter monitoring",
    copy: "See voltage, current, power, and energy use as your meter updates.",
    icon: (
      <>
        <path d="M5 12.5h3l2-5 3.5 9 2-4h3.5" />
        <path d="M4.5 5.5h15v13h-15z" />
      </>
    ),
  },
  {
    title: "Telangana billing estimate",
    copy: "Check the current month bill using Telangana domestic tariff slabs.",
    icon: (
      <>
        <path d="M7 5.5h10v13H7z" />
        <path d="M9.5 9h5" />
        <path d="M9.5 12.5h5" />
      </>
    ),
  },
  {
    title: "Usage graphs",
    copy: "Understand daily usage and power changes with simple charts.",
    icon: (
      <>
        <path d="M5 18V6" />
        <path d="M5 18h14" />
        <path d="m8 14 3-4 3 2 4-5" />
      </>
    ),
  },
  {
    title: "Alerts",
    copy: "Get clear messages when usage is high or the meter needs attention.",
    icon: (
      <>
        <path d="M12 6.5v5" />
        <path d="M12 15.5h.01" />
        <path d="M10.2 4.7 4.8 14a1.2 1.2 0 0 0 1.04 1.8h12.32A1.2 1.2 0 0 0 19.2 14l-5.4-9.3a1.2 1.2 0 0 0-2.08 0Z" />
      </>
    ),
  },
  {
    title: "Payments",
    copy: "View the payable amount and pay the bill from one place.",
    icon: (
      <>
        <rect x="4.5" y="6.5" width="15" height="11" rx="2" />
        <path d="M4.5 10h15" />
        <path d="M8 14h3.5" />
      </>
    ),
  },
];

function FeatureCard({ feature }) {
  return (
    <article className="surface-card-quiet p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(15,118,110,0.1)] text-[var(--accent-primary)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {feature.icon}
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-tonal">{feature.copy}</p>
    </article>
  );
}

function MeterPreview() {
  return (
    <div className="rounded-[18px] border border-white/22 bg-slate-950/74 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop-blur">
      <div className="rounded-[14px] border border-white/12 bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase text-white/55">Meter Online</p>
            <p className="mt-1 text-lg font-semibold text-white">Home meter</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/14 px-3 py-1 text-xs font-semibold text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Live
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Voltage", "231.4 V"],
            ["Current", "3.12 A"],
            ["Power", "721 W"],
            ["Energy", "42.8 kWh"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[12px] border border-white/10 bg-white/[0.06] px-3 py-3">
              <p className="text-[11px] uppercase text-white/52">{label}</p>
              <p className="mt-1.5 text-base font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[12px] border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center justify-between text-xs text-white/66">
            <span>Today</span>
            <span>Updated now</span>
          </div>
          <div className="mt-3 grid grid-cols-12 items-end gap-1.5">
            {[32, 38, 44, 36, 50, 58, 46, 42, 62, 54, 48, 40].map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="rounded-full bg-cyan-300"
                style={{ height: `${height}px`, opacity: 0.34 + index * 0.04 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ isAuthenticated = false, onDashboard, onNavigate }) {
  return (
    <PublicShell activePage="home" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      <section className="mx-auto max-w-[1180px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="relative overflow-hidden rounded-[18px] bg-[var(--surface-solid)] shadow-[var(--shadow-shell)]">
          <div className="absolute inset-0 bg-[url('/smart-meter-hero.svg')] bg-cover bg-center opacity-95" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.82)_46%,rgba(15,23,42,0.44)_100%)]" />

          <div className="relative grid min-h-[470px] items-center gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-cyan-100">Simple home electricity tracking</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-white lg:text-5xl">
                Smart Electricity Meter
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-100">
                Monitor your home meter, understand daily usage, estimate the Telangana bill, receive alerts, and make
                payments from one simple website.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <button type="button" className="primary-button px-5 py-3 text-sm" onClick={onDashboard}>
                    Open Dashboard
                  </button>
                ) : (
                  <>
                    <button type="button" className="primary-button px-5 py-3 text-sm" onClick={() => onNavigate?.("login")}>
                      Login
                    </button>
                    <button
                      type="button"
                      className="rounded-[10px] border border-white/26 bg-white/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/18"
                      onClick={() => onNavigate?.("signup")}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <MeterPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:px-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
