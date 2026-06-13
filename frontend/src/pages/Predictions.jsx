import {
  calculateTelanganaLtIDomesticBill,
  getTariffBand,
  getTariffWarningMessage,
  projectMonthlyUnits,
} from "../utils/telanganaTariff";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatKwh(amount) {
  return `${Number(amount || 0).toFixed(1)} kWh`;
}

function PredictionCard({ title, billAmount, units, tariffBand, note, tone = "bg-[var(--accent-primary)]" }) {
  return (
    <article className="surface-panel p-4 lg:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="section-kicker">{title}</p>
          <p className="mt-2 text-3xl font-semibold leading-none text-[var(--text-primary)]">{billAmount}</p>
          <p className="mt-2 text-sm leading-6 text-tonal">{note}</p>
        </div>
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${tone}`} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="metric-tile px-4 py-3">
          <p className="section-kicker">Units</p>
          <p className="mt-1.5 text-base font-semibold text-[var(--text-primary)]">{units}</p>
        </div>
        <div className="metric-tile px-4 py-3">
          <p className="section-kicker">Tariff slab</p>
          <p className="mt-1.5 text-base font-semibold text-[var(--text-primary)]">{tariffBand}</p>
        </div>
      </div>
    </article>
  );
}

export default function Predictions({
  bill,
  dailyUsage = [],
  history = [],
  latestReading,
}) {
  const currentUnits = Number(bill?.monthlyUnits ?? bill?.unitsConsumed ?? latestReading?.energyKWh ?? 0);
  const currentBill = bill || calculateTelanganaLtIDomesticBill({
    meterId: latestReading?.meterId,
    monthlyUnits: currentUnits,
    phaseType: latestReading?.phaseType,
    contractedLoad: latestReading?.contractedLoad,
  });
  const projectedMonthlyUnits = projectMonthlyUnits({
    monthlyUnits: currentUnits,
    latestReading,
    history,
    dailyUsage,
  });
  const projectedBill = calculateTelanganaLtIDomesticBill({
    meterId: bill?.meterId || latestReading?.meterId,
    monthlyUnits: projectedMonthlyUnits,
    phaseType: bill?.phaseType || latestReading?.phaseType,
    contractedLoad: bill?.contractedLoad || latestReading?.contractedLoad,
  });
  const currentBand = getTariffBand(currentUnits);
  const projectedBand = projectedBill.tariffBand;
  const trendMessage = getTariffWarningMessage(currentUnits, projectedMonthlyUnits);
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthLabel = nextMonthDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Predictions</p>
            <h2 className="mt-1 section-heading">Current and next month</h2>
          </div>
          <span className="status-pill">Bill estimate</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-tonal">
          This page keeps the forecast simple: what the current month looks like and what next month may look like if
          usage continues in the same pattern.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PredictionCard
          title={bill?.billingCycle || "Current month"}
          billAmount={formatCurrency(currentBill.finalPayableEstimate)}
          units={formatKwh(currentUnits)}
          tariffBand={currentBand}
          note="Based on the units recorded so far this month."
          tone="bg-[var(--accent-primary)]"
        />
        <PredictionCard
          title={nextMonthLabel}
          billAmount={formatCurrency(projectedBill.finalPayableEstimate)}
          units={formatKwh(projectedMonthlyUnits)}
          tariffBand={projectedBand}
          note={trendMessage}
          tone={projectedBand !== currentBand ? "bg-amber-500" : "bg-blue-500"}
        />
      </section>
    </div>
  );
}
