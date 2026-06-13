import { useEffect, useMemo, useState } from "react";
import {
  createPaymentOrder,
  fetchPaymentHistory,
  getStoredPaymentHistory,
  verifyPayment,
} from "../services/api";

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI", note: "Google Pay, PhonePe, Paytm" },
  { id: "Card", label: "Card", note: "Debit or credit card" },
  { id: "Net Banking", label: "Net Banking", note: "Bank transfer login" },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uniquePayments(rows = []) {
  const seen = new Set();

  return rows.filter((row) => {
    const key = row.id || row.paymentId || `${row.billMonth}-${row.amount}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function DetailTile({ label, value, note }) {
  return (
    <div className="metric-tile px-4 py-4">
      <p className="section-kicker">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-tonal">{note}</p> : null}
    </div>
  );
}

export default function PaymentsPage({ token, user, bill, latestReading }) {
  const meterId = bill?.meterId || latestReading?.meterId || user?.meterId || "Unknown";
  const billMonth = bill?.billingCycle || new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());
  const payableAmount = Number(bill?.finalPayableEstimate ?? bill?.estimatedBill ?? 0);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [paymentHistory, setPaymentHistory] = useState(() => getStoredPaymentHistory(meterId));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successPayment, setSuccessPayment] = useState(null);
  const [receiptNote, setReceiptNote] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPayments() {
      try {
        const payload = await fetchPaymentHistory({ token, meterId });
        if (!ignore) {
          setPaymentHistory(payload.payments || []);
        }
      } catch (paymentError) {
        if (!ignore) {
          setError(paymentError.message || "Unable to load payment history.");
        }
      }
    }

    loadPayments();

    return () => {
      ignore = true;
    };
  }, [meterId, token]);

  const paidRecord = useMemo(
    () => paymentHistory.find((item) => item.billMonth === billMonth && item.status === "successful"),
    [billMonth, paymentHistory],
  );
  const paymentStatus = paidRecord ? "Paid" : "Unpaid";

  async function handlePayment() {
    setProcessing(true);
    setError("");
    setReceiptNote("");

    try {
      const orderPayload = await createPaymentOrder({
        token,
        meterId,
        amount: payableAmount,
        billMonth,
        bill,
      });

      const verificationPayload = await verifyPayment({
        token,
        order: orderPayload.order,
        meterId,
        billMonth,
        amount: payableAmount,
        paymentMethod: selectedMethod,
        user,
      });
      const payment = verificationPayload.payment;

      setSuccessPayment(payment);
      setPaymentHistory((current) => uniquePayments([payment, ...current]));
      setConfirmOpen(false);
    } catch (paymentError) {
      setError(paymentError.message || "Payment could not be completed.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Payments</p>
            <h2 className="mt-1 section-heading">Current payable bill</h2>
          </div>
          <span className="status-pill">{paymentStatus}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailTile label="Payable amount" value={formatCurrency(payableAmount)} note={billMonth} />
          <DetailTile label="Bill month" value={billMonth} note="Current billing cycle" />
          <DetailTile label="Meter ID" value={meterId} note="Linked meter account" />
          <DetailTile label="Payment status" value={paymentStatus} note={paidRecord ? formatDate(paidRecord.paidAt) : "Awaiting payment"} />
        </div>
      </section>

      <section className={successPayment ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]" : "grid gap-4"}>
        <section className="surface-panel p-4 lg:p-5">
          <div className="page-header">
            <div>
              <p className="section-kicker">Payment method</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Choose payment option</h3>
            </div>
            <span className="status-pill">Payment ready</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {PAYMENT_METHODS.map((method) => {
              const active = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`rounded-[12px] border px-4 py-4 text-left transition-colors ${
                    active
                      ? "border-[var(--accent-primary)] bg-[rgba(15,118,110,0.08)]"
                      : "border-[var(--surface-border)] bg-[var(--surface-solid)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{method.label}</p>
                    <span className={`h-3 w-3 rounded-full ${active ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-muted)]"}`} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-tonal">{method.note}</p>
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="mt-4 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/18 dark:bg-rose-500/10 dark:text-rose-100">
              {error}
            </div>
          ) : null}

          {successPayment ? (
            <div className="mt-4 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-400/18 dark:bg-emerald-500/10 dark:text-emerald-100">
              <p className="font-semibold">Payment successful</p>
              <p className="mt-1">Receipt {successPayment.receiptNumber} for {formatCurrency(successPayment.amount)} is saved in payment history.</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="primary-button px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processing || payableAmount <= 0 || Boolean(paidRecord)}
              onClick={() => setConfirmOpen(true)}
            >
              {processing ? "Processing..." : paidRecord ? "Already paid" : "Pay Now"}
            </button>
            <button
              type="button"
              className="secondary-button px-5 py-2.5 text-sm"
              onClick={() => setReceiptNote("Receipt download will be available after the payment is recorded.")}
            >
              Download receipt
            </button>
          </div>

          {receiptNote ? <p className="mt-3 text-sm text-tonal">{receiptNote}</p> : null}
        </section>

        {successPayment ? (
          <aside className="grid content-start gap-4">
            <section className="surface-panel p-4">
              <p className="section-kicker">Success receipt</p>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-tonal">Receipt</span>
                  <span className="font-semibold text-[var(--text-primary)]">{successPayment.receiptNumber}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-tonal">Method</span>
                  <span className="font-semibold text-[var(--text-primary)]">{successPayment.method}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-tonal">Paid at</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatDate(successPayment.paidAt)}</span>
                </div>
              </div>
            </section>
          </aside>
        ) : null}
      </section>

      <section className="surface-panel p-4 lg:p-5">
        <div className="page-header">
          <div>
            <p className="section-kicker">Payment history</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Recent transactions</h3>
          </div>
          <span className="status-pill">{paymentHistory.length} record</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-solid)]">
          <table className="soft-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Month</th>
                <th>Method</th>
                <th>Paid at</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length ? (
                paymentHistory.map((payment) => (
                  <tr key={payment.id || payment.paymentId}>
                    <td>{payment.receiptNumber || payment.paymentId}</td>
                    <td>{payment.billMonth}</td>
                    <td>{payment.method}</td>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td className="text-right font-semibold">{formatCurrency(payment.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-tonal">
                    Payment records will appear here after the first successful transaction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[14px] border border-[var(--surface-border)] bg-[var(--surface-solid)] p-5 shadow-[var(--shadow-panel)]">
            <p className="section-kicker">Confirm payment</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(payableAmount)}</h3>
            <p className="mt-2 text-sm leading-6 text-tonal">
              Pay {billMonth} bill for meter {meterId} using {selectedMethod}.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="secondary-button px-4 py-2 text-sm" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button px-4 py-2 text-sm" onClick={handlePayment} disabled={processing}>
                {processing ? "Processing..." : "Confirm Pay"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
