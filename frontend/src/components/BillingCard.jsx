function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatUnits(value) {
  return `${Number(value || 0).toFixed(1)} kWh`;
}

function formatLoad(value) {
  return `${Number(value || 0).toFixed(1)} kW`;
}

function DetailTile({ label, value, note }) {
  return (
    <div className="surface-card panel-hover px-4 py-4">
      <p className="section-kicker">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      {note ? <p className="mt-1 text-xs leading-6 text-tonal">{note}</p> : null}
    </div>
  );
}

export default function BillingCard({ bill, compact = false }) {
  if (!bill) {
    return null;
  }

  const monthlyUnits = bill.monthlyUnits ?? bill.unitsConsumed ?? bill.energyKWh ?? 0;
  const tariffLabel = bill.tariffBand || bill.tariffCategory || "LT-I Domestic";
  const slabBreakup = Array.isArray(bill.slabBreakup) ? bill.slabBreakup : [];

  return (
    <section className="surface-panel panel-hover p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Automatic billing</p>
          <h3 className="mt-2 text-[1.55rem] font-semibold text-[var(--text-primary)]">
            Telangana LT-I Domestic
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-tonal">Current month energy translated into a live Telangana bill estimate.</p>
        </div>

        <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-700 dark:text-cyan-100">
          {bill.status}
        </div>
      </div>

      <div className={`mt-4 grid gap-4 ${compact ? "lg:grid-cols-[1fr_0.95fr]" : "lg:grid-cols-[1.06fr_0.94fr]"}`}>
        <div className="surface-card-muted p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Current estimate</p>
              <p className="mt-3 text-[2.35rem] font-semibold leading-none text-[var(--text-primary)]">
                {formatCurrency(bill.finalPayableEstimate ?? bill.estimatedBill)}
              </p>
              <p className="mt-2 text-sm leading-7 text-tonal">
                {compact ? "Automatically calculated from current month units." : `Base ${formatCurrency(bill.baseAmount)} | Energy ${formatCurrency(bill.energyCharge)}`}
              </p>
            </div>

            {!compact ? (
              <div className="surface-card px-4 py-4 text-right">
                <p className="section-kicker">Billing cycle</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{bill.billingCycle}</p>
                <p className="mt-1 text-xs text-tonal">Due {bill.dueDate}</p>
              </div>
            ) : null}
          </div>

          <div className={`mt-4 grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
            <DetailTile label="Units Consumed" value={formatUnits(monthlyUnits)} note="Live meter total" />
            <DetailTile label="Tariff Category" value={tariffLabel} note={bill.tariffCategory || "Telangana LT-I Domestic"} />
            {!compact ? (
              <>
                <DetailTile label="Fixed Charge" value={formatCurrency(bill.fixedCharge)} note="Applied every month" />
                <DetailTile
                  label="Minimum Charge"
                  value={formatCurrency(bill.minimumCharge)}
                  note={bill.minimumChargeApplied ? "Applied to final payable" : "Threshold not triggered"}
                />
              </>
            ) : null}
          </div>
        </div>

        {!compact ? (
          <div className="space-y-4">
            <div className="surface-card px-5 py-5">
              <p className="section-kicker">Billing rule</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{bill.minimumChargeRule}</p>
              <p className="mt-3 text-sm leading-7 text-tonal">
                Final payable never drops below the applicable monthly minimum for the connected load and phase type.
              </p>
            </div>

            <div className="surface-card px-5 py-5">
              <p className="section-kicker">Connection snapshot</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <DetailTile label="Tariff Region" value={bill.tariffRegion || "Telangana"} note="Tariff details" />
                <DetailTile label="Load" value={formatLoad(bill.contractedLoad)} note={`Phase ${bill.phaseType || "single"}`} />
                <DetailTile label="Energy Charge" value={formatCurrency(bill.energyCharge)} note="Slab-wise energy cost" />
                <DetailTile label="Minimum Applied" value={bill.minimumChargeApplied ? "Yes" : "No"} note="Rule verification" />
              </div>
            </div>
          </div>
        ) : (
          <div className="surface-card px-5 py-5">
            <p className="section-kicker">Billing quick summary</p>
            <div className="mt-4 space-y-3">
              {[
                `Tariff ${tariffLabel}`,
                `Fixed charge ${formatCurrency(bill.fixedCharge)}`,
                `Minimum rule ${formatCurrency(bill.minimumCharge)}`,
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-solid)] px-3 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)]" />
                  <span className="text-sm text-[var(--text-primary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!compact ? (
        <div className="mt-6 surface-card px-5 py-5">
          <p className="section-kicker">Slab-wise bill breakup</p>
          <div className="mt-4 space-y-3">
            {slabBreakup.length ? (
              slabBreakup.map((row) => (
                <div
                  key={`${row.label}-${row.rate}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-solid)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{row.label}</p>
                    <p className="mt-1 text-xs leading-6 text-tonal">
                      {Number(row.units).toFixed(1)} kWh at {formatCurrency(row.rate)} / unit
                    </p>
                  </div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{formatCurrency(row.charge)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-solid)] px-4 py-3 text-sm text-tonal">
                Slab breakup will appear when the bill is computed from meter units.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
