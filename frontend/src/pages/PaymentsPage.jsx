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
  { id: "Net Banking", label: "Net Banking", note: "Secure bank portal login" },
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

function DetailTile({ label, value, note, dotColor }) {
  return (
    <div className="metric-tile px-4 py-4 card-glow hover-lift">
      <div className="flex items-center justify-between">
        <p className="section-kicker">{label}</p>
        {dotColor ? <span className={`h-2 w-2 rounded-full ${dotColor}`} /> : null}
      </div>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-tonal">{note}</p> : null}
    </div>
  );
}

function isCurrentOrPreviousMonth(billMonth) {
  if (!billMonth) return false;
  const now = new Date();
  
  const currentLong = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);
  const currentShort = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(now);
  
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevLong = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(prevDate);
  const prevShort = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(prevDate);
  
  const m = billMonth.trim().toLowerCase();
  return (
    m.includes(currentLong.toLowerCase()) ||
    m.includes(currentShort.toLowerCase()) ||
    m.includes(prevLong.toLowerCase()) ||
    m.includes(prevShort.toLowerCase())
  );
}

export default function PaymentsPage({ token, user, bill, latestReading }) {
  const meterId = bill?.meterId || latestReading?.meterId || user?.meterId || "Unknown";
  const billMonth = bill?.billingCycle || new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());
  const payableAmount = Number(bill?.finalPayableEstimate ?? bill?.estimatedBill ?? 0);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [paymentHistory, setPaymentHistory] = useState(() => getStoredPaymentHistory(meterId));
  const [showAllHistory, setShowAllHistory] = useState(false);
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

  const amountDue = paidRecord ? 0 : payableAmount;
  const dueDate = bill?.dueDate || "28-Jun-2026";

  const displayedPayments = useMemo(() => {
    if (showAllHistory) {
      return paymentHistory;
    }
    return paymentHistory.filter((payment) => isCurrentOrPreviousMonth(payment.billMonth));
  }, [paymentHistory, showAllHistory]);

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

  function handleDownloadReceipt(receiptNum) {
    if (!receiptNum) {
      setReceiptNote("Receipt unavailable.");
      return;
    }
    alert(`Downloading receipt ${receiptNum} for ₹${payableAmount}...`);
  }

  return (
    <div className="page-stack animate-fade-up">
      {/* Account Info and Overview */}
      <section className="surface-panel p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-tonal border-b border-[var(--surface-border)] pb-3.5 mb-4">
          <span>Linked Meter ID: <span className="font-mono font-semibold text-[var(--text-primary)]">{meterId}</span></span>
          <span>Billing Cycle: <span className="font-semibold text-[var(--text-primary)]">{billMonth}</span></span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailTile label="Current Bill Amount" value={formatCurrency(payableAmount)} note={`Cycle: ${billMonth}`} dotColor="bg-[var(--accent-primary)]" />
          <DetailTile label="Amount Due" value={formatCurrency(amountDue)} note={paidRecord ? "Balance cleared" : "Outstanding balance"} dotColor={paidRecord ? "bg-emerald-500" : "bg-rose-500"} />
          <DetailTile label="Due Date" value={dueDate} note={paidRecord ? "No pending actions" : "Pay before late fee applies"} dotColor="bg-amber-500" />
          <DetailTile label="Payment Status" value={paymentStatus} note={paidRecord ? `Settled on ${formatDate(paidRecord.paidAt)}` : "Awaiting Transaction"} dotColor={paidRecord ? "bg-emerald-500" : "bg-rose-500"} />
        </div>
      </section>

      {/* Payment checkout block */}
      <section className={successPayment ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]" : "grid gap-4"}>
        <section className="surface-panel p-4 lg:p-5 card-glow">
          <div className="page-header">
            <div>
              <p className="section-kicker">Secure Checkout</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Payment Method Selection</h3>
            </div>
            <span className="status-pill">Payment Desk Ready</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {PAYMENT_METHODS.map((method) => {
              const active = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`rounded-[12px] border px-4 py-4 text-left transition-colors hover-lift ${
                    active
                      ? "border-[var(--accent-primary)] bg-[var(--surface-soft)]"
                      : "border-[var(--surface-border)] bg-[var(--surface-solid)] hover:bg-[var(--surface-soft)]"
                  }`}
                  disabled={Boolean(paidRecord)}
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
            <div className="mt-4 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-400/18 dark:bg-emerald-500/10 dark:text-emerald-100 animate-fade-up">
              <p className="font-semibold">Payment successful</p>
              <p className="mt-1">Receipt {successPayment.receiptNumber} for {formatCurrency(successPayment.amount)} is registered in your log.</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="primary-button px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processing || payableAmount <= 0 || Boolean(paidRecord)}
              onClick={() => setConfirmOpen(true)}
            >
              {processing ? "Processing..." : paidRecord ? "Bill Cleared ✓" : `Pay ₹${payableAmount.toFixed(0)} Now`}
            </button>
            {paidRecord && (
              <button
                type="button"
                className="secondary-button px-5 py-2.5 text-sm flex items-center gap-1.5"
                onClick={() => handleDownloadReceipt(paidRecord.receiptNumber)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download Receipt</span>
              </button>
            )}
          </div>

          {receiptNote ? <p className="mt-3 text-sm text-tonal">{receiptNote}</p> : null}
        </section>

        {successPayment ? (
          <aside className="grid content-start gap-4 animate-fade-up">
            <section className="surface-panel p-4 card-glow">
              <p className="section-kicker">Success receipt</p>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-[var(--surface-border)] pb-2">
                  <span className="text-tonal">Receipt No</span>
                  <span className="font-semibold text-[var(--text-primary)]">{successPayment.receiptNumber}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-[var(--surface-border)] pb-2">
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

      {/* Transaction Log */}
      <section className="surface-panel p-4 lg:p-5 card-glow">
        <div className="page-header">
          <div>
            <p className="section-kicker">Audit Trails</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Transaction & Payments History</h3>
          </div>
          <span className="status-pill">
            {showAllHistory ? paymentHistory.length : displayedPayments.length} of {paymentHistory.length} records
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-solid)]">
          <table className="soft-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Cycle</th>
                <th>Payment Method</th>
                <th>Transaction Date</th>
                <th className="text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {displayedPayments.length ? (
                displayedPayments.map((payment) => (
                  <tr key={payment.id || payment.paymentId} className="hover:bg-[var(--surface-soft)] transition-colors">
                    <td className="font-semibold text-[var(--accent-primary)]">{payment.receiptNumber || payment.paymentId}</td>
                    <td>{payment.billMonth}</td>
                    <td>{payment.method}</td>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td className="text-right font-semibold text-[var(--text-primary)]">{formatCurrency(payment.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-tonal text-center py-4">
                    Payment records will appear here after the first successful transaction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {paymentHistory.length > displayedPayments.length && !showAllHistory && (
          <div className="mt-4 flex justify-center pb-1">
            <button
              type="button"
              className="secondary-button text-xs font-semibold px-4 py-2"
              onClick={() => setShowAllHistory(true)}
            >
              View Full Payment History ({paymentHistory.length - displayedPayments.length} older records)
            </button>
          </div>
        )}

        {showAllHistory && paymentHistory.length > 2 && (
          <div className="mt-4 flex justify-center pb-1">
            <button
              type="button"
              className="secondary-button text-xs font-semibold px-4 py-2"
              onClick={() => setShowAllHistory(false)}
            >
              Collapse Older Records
            </button>
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[14px] border border-[var(--surface-border)] bg-[var(--surface-solid)] p-5 shadow-[var(--shadow-panel)] animate-fade-up">
            <p className="section-kicker">Confirm Transaction</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(payableAmount)}</h3>
            <p className="mt-2 text-sm leading-6 text-tonal">
              Complete the payment of {billMonth} bill for meter {meterId} using {selectedMethod}.
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
