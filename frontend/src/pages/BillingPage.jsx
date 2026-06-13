import { getStoredPaymentHistory } from "../services/api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatUnits(amount) {
  return `${Number(amount || 0).toFixed(1)} kWh`;
}

function SummaryTile({ label, value, note }) {
  return (
    <div className="metric-tile px-4 py-4">
      <p className="section-kicker">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-tonal">{note}</p> : null}
    </div>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--surface-border)] py-3 last:border-b-0">
      <span className="text-sm text-tonal">{label}</span>
      <span className="text-right text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function BillingPage({ bill, latestReading, onNavigate }) {
  if (!bill) {
    return (
      <section className="surface-panel fade-rise p-6">
        <p className="section-kicker">Billing</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">No bill available yet</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-tonal">
          The automatic Telangana tariff estimate will appear after the first monthly reading is available.
        </p>
      </section>
    );
  }

  const meterId = bill.meterId || latestReading?.meterId || "Unknown";
  const monthlyUnits = bill.monthlyUnits ?? bill.unitsConsumed ?? 0;
  const finalBill = bill.finalPayableEstimate ?? bill.estimatedBill;
  const tariffLabel = bill.tariffBand || bill.tariffCategory || "LT-I Domestic";
  const slabBreakup = Array.isArray(bill.slabBreakup) ? bill.slabBreakup : [];
  const paymentHistory = getStoredPaymentHistory(meterId);
  const paidRecord = paymentHistory.find(
    (item) => item.billMonth === bill.billingCycle && item.status === "successful",
  );
  const paymentStatus = paidRecord ? "Paid" : "Unpaid";
  const dueStatus = paidRecord
    ? `Paid on ${new Date(paidRecord.paidAt).toLocaleDateString("en-IN")}`
    : bill.dueDate
      ? `Due by ${bill.dueDate}`
      : "Payment pending";

  const summaryCards = [
    { label: "Current month bill", value: formatCurrency(finalBill), note: bill.billingCycle },
    { label: "Units consumed", value: formatUnits(monthlyUnits), note: "Current month usage" },
    { label: "Tariff category", value: bill.tariffCategory || "LT-I Domestic", note: tariffLabel },
    { label: "Due status", value: paymentStatus, note: dueStatus },
  ];

  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Billing</p>
            <h2 className="mt-1 section-heading">Current month bill</h2>
          </div>
          <span className="status-pill">{paymentStatus}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryTile key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <section className="surface-panel p-4 lg:p-5">
          <div className="page-header">
            <div>
              <p className="section-kicker">Telangana tariff slab breakdown</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Energy charges</h3>
            </div>
            <span className="status-pill">{tariffLabel}</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-solid)]">
            <table className="soft-table">
              <thead>
                <tr>
                  <th>Slab</th>
                  <th>Units</th>
                  <th>Rate</th>
                  <th className="text-right">Charge</th>
                </tr>
              </thead>
              <tbody>
                {slabBreakup.length ? (
                  slabBreakup.map((row) => (
                    <tr key={`${row.label}-${row.rate}`}>
                      <td>{row.label}</td>
                      <td>{formatUnits(row.units)}</td>
                      <td>{formatCurrency(row.rate)} / unit</td>
                      <td className="text-right font-semibold">{formatCurrency(row.charge)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-tonal">
                      Slab rows will appear after the bill is computed from meter units.
                    </td>
                  </tr>
                )}
                <tr>
                  <td>Fixed charge</td>
                  <td>-</td>
                  <td>Monthly</td>
                  <td className="text-right font-semibold">{formatCurrency(bill.fixedCharge)}</td>
                </tr>
                <tr>
                  <td>Monthly minimum</td>
                  <td>-</td>
                  <td>{bill.minimumChargeApplied ? "Applied" : "Not applied"}</td>
                  <td className="text-right font-semibold">{formatCurrency(bill.minimumCharge)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="surface-panel p-4">
            <p className="section-kicker">Due status</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(finalBill)}</p>
            <p className="mt-1 text-sm text-tonal">{dueStatus}</p>

            <div className="mt-4 rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4">
              <StatusRow label="Meter ID" value={meterId} />
              <StatusRow label="Payment status" value={paymentStatus} />
              <StatusRow label="Billing cycle" value={bill.billingCycle} />
              <StatusRow label="Units consumed" value={formatUnits(monthlyUnits)} />
            </div>

            <button type="button" className="primary-button mt-4 w-full px-4 py-2.5 text-sm" onClick={() => onNavigate?.("payments")}>
              Pay Bill
            </button>
          </section>
        </aside>
      </section>
    </div>
  );
}
