import PublicShell from "../components/PublicShell";

const STEPS = [
  {
    title: "Meter reads electricity",
    copy: "An ESP32 meter reads voltage and current from the connected home supply.",
  },
  {
    title: "Data is sent safely",
    copy: "The readings are sent to the app service in the cloud so the website can show fresh information.",
  },
  {
    title: "Readings are stored",
    copy: "MongoDB stores the meter readings, user account details, bills, alerts, and payment records.",
  },
  {
    title: "Website explains it",
    copy: "The website shows live usage, Telangana bill estimate, alerts, payments, graphs, and simple predictions.",
  },
];

function StepCard({ index, step }) {
  return (
    <article className="surface-card-quiet p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(15,118,110,0.1)] text-sm font-semibold text-[var(--accent-primary)]">
          {index + 1}
        </span>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-tonal">{step.copy}</p>
    </article>
  );
}

export default function AboutPage({ isAuthenticated = false, onDashboard, onNavigate }) {
  return (
    <PublicShell activePage="about" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      <section className="mx-auto max-w-[980px] px-4 py-8 lg:px-6 lg:py-10">
        <div className="surface-panel p-5 sm:p-7">
          <p className="section-kicker">About</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl">
            A simple way to understand your electricity meter.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-tonal">
            Smart Electricity Meter helps a home user see how much power is being used, what the bill may be, and when
            usage needs attention. It keeps the technical work in the background and shows only useful information on the
            website.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <StepCard key={step.title} index={index} step={step} />
            ))}
          </div>

          <div className="mt-6 rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">What the user sees</h2>
            <p className="mt-2 text-sm leading-7 text-tonal">
              Live meter status, updated readings, current energy use, bill estimate, usage alert, payment status, and
              next month prediction.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
