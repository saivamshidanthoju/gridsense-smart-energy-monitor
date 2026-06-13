import {
  buildBillingForecastSeries,
  buildDailyUsageSeries,
  createMockUser,
  getMockDashboardSnapshot,
  getMockDeviceStatus,
} from "../data/mockData";
import { calculateTelanganaLtIDomesticBill } from "../utils/telanganaTariff";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const SESSION_STORAGE_KEY = "smart-power-meter-session";
const PAYMENT_HISTORY_STORAGE_KEY = "smart-power-meter-payments";
const MOCK_TOKEN_PREFIX = "mock-session-";
const DEMO_CREDENTIALS = {
  email: "user@gmail.com",
  meterId: "ESP32-A4F2",
  password: "123456",
};

function isNetworkError(error) {
  return error?.name === "TypeError" || /fetch|network|failed/i.test(error?.message || "");
}

function isMissingDataRouteError(error) {
  return error?.status === 404;
}

function isMockToken(token = "") {
  return token.startsWith(MOCK_TOKEN_PREFIX);
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed for ${endpoint}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

function createFallbackSession(overrides = {}) {
  const user = createMockUser(overrides);

  return {
    token: `${MOCK_TOKEN_PREFIX}${user.meterId.toLowerCase()}`,
    user,
    authSource: "mock",
    authLabel: "Demo mode",
  };
}

function createMockSession(overrides = {}) {
  return createFallbackSession({
    name: overrides.name || "Demo User",
    email: overrides.email || DEMO_CREDENTIALS.email,
    meterId: overrides.meterId || DEMO_CREDENTIALS.meterId,
  });
}

function isDemoCredentials(formData = {}) {
  return (
    formData.email?.toLowerCase() === DEMO_CREDENTIALS.email &&
    (formData.meterId || DEMO_CREDENTIALS.meterId) === DEMO_CREDENTIALS.meterId &&
    formData.password === DEMO_CREDENTIALS.password
  );
}

function buildAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function normalizeSessionResponse(payload) {
  return {
    token: payload.token,
    user: payload.user,
    authSource: payload.source === "database" ? "database" : "mock",
    authLabel: payload.source === "database" ? "Signed in" : "Demo mode",
  };
}

function normalizeBillPayload(payload = {}, latestReading = null, meterId = "") {
  const rawBill = payload?.bill || payload || {};
  const normalizedMonthlyUnits =
    rawBill.monthlyUnits ??
    rawBill.unitsConsumed ??
    rawBill.energyKWh ??
    latestReading?.energyKWh ??
    0;

  return calculateTelanganaLtIDomesticBill({
    ...rawBill,
    meterId: rawBill.meterId || meterId || latestReading?.meterId,
    monthlyUnits: normalizedMonthlyUnits,
    phaseType: rawBill.phaseType || latestReading?.phaseType,
    contractedLoad: rawBill.contractedLoad || latestReading?.contractedLoad,
    tariffRegion: rawBill.tariffRegion,
    tariffCategory: rawBill.tariffCategory,
    billingCycle: rawBill.billingCycle,
    dueDate: rawBill.dueDate,
    status: rawBill.status,
  });
}

export function loadStoredSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);

    if (!parsedSession?.token || !parsedSession?.user) {
      return null;
    }

    return {
      ...parsedSession,
      authSource: parsedSession.authSource || (isMockToken(parsedSession.token) ? "mock" : "database"),
      authLabel:
        parsedSession.authLabel || (isMockToken(parsedSession.token) ? "Demo mode" : "Signed in"),
    };
  } catch (error) {
    console.error("Unable to read stored session", error);
    return null;
  }
}

export function saveStoredSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function getPaymentHistoryKey(meterId = "") {
  return `${PAYMENT_HISTORY_STORAGE_KEY}:${meterId || "default"}`;
}

export function getStoredPaymentHistory(meterId = "") {
  try {
    const rawHistory = localStorage.getItem(getPaymentHistoryKey(meterId));
    return rawHistory ? JSON.parse(rawHistory) : [];
  } catch (error) {
    console.error("Unable to read stored payment history", error);
    return [];
  }
}

function setStoredPaymentHistory(meterId = "", history = []) {
  localStorage.setItem(getPaymentHistoryKey(meterId), JSON.stringify(history));
}

function saveStoredPaymentRecord(record) {
  const meterId = record?.meterId || "";
  const currentHistory = getStoredPaymentHistory(meterId);
  const nextHistory = [record, ...currentHistory.filter((item) => item.id !== record.id)].slice(0, 12);
  setStoredPaymentHistory(meterId, nextHistory);
  return nextHistory;
}

function mergePaymentHistory(primary = [], secondary = []) {
  const seen = new Set();
  return [...primary, ...secondary].filter((item) => {
    const key = item.id || item.paymentId || `${item.billMonth}-${item.amount}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function getDemoCredentials() {
  return { ...DEMO_CREDENTIALS };
}

export async function registerUser(formData) {
  try {
    const payload = await request("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return normalizeSessionResponse(payload);
  } catch (error) {
    if (error.status || !isNetworkError(error)) {
      throw error;
    }

    return createMockSession(formData);
  }
}

export async function loginUser(formData) {
  try {
    const payload = await request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return normalizeSessionResponse(payload);
  } catch (error) {
    if (isNetworkError(error)) {
      if (isDemoCredentials(formData)) {
        return createMockSession(formData);
      }

      throw new Error("The service is unavailable right now. Please try again in a moment.");
    }

    if (error.status === 401 && isDemoCredentials(formData)) {
      return createMockSession(formData);
    }

    throw error;
  }
}

export async function getCurrentUser(token, fallbackUser) {
  if (isMockToken(token)) {
    return {
      user: fallbackUser || createMockUser(),
      source: "mock",
    };
  }

  try {
    return await request("/api/auth/me", {
      headers: buildAuthHeaders(token),
    });
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error)) {
      return {
        user: fallbackUser || createMockUser(),
        source: "mock",
      };
    }

    throw error;
  }
}

async function fetchLatestReadingFromBackend(token) {
  return request("/api/readings/latest", {
    headers: buildAuthHeaders(token),
  });
}

async function fetchHistoryFromBackend(token) {
  return request("/api/readings/history", {
    headers: buildAuthHeaders(token),
  });
}

async function fetchBillingFromBackend(token) {
  return request("/api/billing", {
    headers: buildAuthHeaders(token),
  });
}

async function fetchAlertsFromBackend(token) {
  return request("/api/alerts", {
    headers: buildAuthHeaders(token),
  });
}

function buildMockPaymentOrder({ meterId, amount, billMonth }) {
  const amountRupees = Number(amount || 0);

  return {
    id: `order_mock_${Date.now()}`,
    amount: Math.round(amountRupees * 100),
    amountRupees,
    currency: "INR",
    receipt: `bill_${meterId || "meter"}_${Date.now()}`,
    meterId,
    billMonth,
    status: "created",
    provider: "mock",
  };
}

function buildMockPaymentRecord({ order, meterId, billMonth, amount, paymentMethod, user }) {
  const paidAt = new Date().toISOString();
  const amountRupees = Number(order?.amountRupees ?? amount ?? (Number(order?.amount || 0) / 100));

  return {
    id: `pay_mock_${Date.now()}`,
    orderId: order?.id || `order_mock_${Date.now()}`,
    paymentId: `pay_mock_${Date.now()}`,
    meterId,
    billMonth,
    amount: amountRupees,
    currency: "INR",
    status: "successful",
    method: paymentMethod,
    paidAt,
    customerName: user?.name || "Customer",
    receiptNumber: `SMR-${new Date(paidAt).getFullYear()}-${String(Date.now()).slice(-6)}`,
    provider: "mock",
  };
}

export async function createPaymentOrder({ token, meterId, amount, billMonth, bill }) {
  const fallbackOrder = buildMockPaymentOrder({ meterId, amount, billMonth });

  // Razorpay integration placeholder
  // Backend order creation will be connected here.
  if (!token || isMockToken(token)) {
    return {
      source: "mock",
      order: fallbackOrder,
    };
  }

  try {
    return await request("/api/payments/create-order", {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meterId,
        amount,
        billMonth,
        bill,
      }),
    });
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      return {
        source: "mock",
        order: fallbackOrder,
      };
    }

    throw error;
  }
}

export async function verifyPayment({
  token,
  order,
  meterId,
  billMonth,
  amount,
  paymentMethod,
  user,
}) {
  const fallbackPayment = buildMockPaymentRecord({
    order,
    meterId,
    billMonth,
    amount,
    paymentMethod,
    user,
  });

  // Payment verification will be handled here.
  if (!token || isMockToken(token)) {
    saveStoredPaymentRecord(fallbackPayment);
    return {
      source: "mock",
      payment: fallbackPayment,
    };
  }

  try {
    const payload = await request("/api/payments/verify", {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order?.id,
        paymentId: fallbackPayment.paymentId,
        amount,
        meterId,
        billMonth,
        paymentMethod,
        // Razorpay signature will be sent here by the checkout callback.
        razorpaySignature: "mock-signature",
      }),
    });
    const payment = payload.payment || fallbackPayment;
    saveStoredPaymentRecord(payment);
    return {
      ...payload,
      payment,
    };
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      saveStoredPaymentRecord(fallbackPayment);
      return {
        source: "mock",
        payment: fallbackPayment,
      };
    }

    throw error;
  }
}

export async function fetchPaymentHistory({ token, meterId }) {
  const localHistory = getStoredPaymentHistory(meterId);

  if (!token || isMockToken(token)) {
    return {
      source: "mock",
      payments: localHistory,
    };
  }

  try {
    const payload = await request("/api/payments/history", {
      headers: buildAuthHeaders(token),
    });

    return {
      source: payload.source || "database",
      payments: mergePaymentHistory(payload.payments || [], localHistory),
    };
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      return {
        source: "mock",
        payments: localHistory,
      };
    }

    throw error;
  }
}

export function getConnectionLabel(source, latestReading, meter) {
  if (!latestReading?.timestamp || meter?.status === "offline") {
    return "Meter Offline";
  }

  const ageInMs = Date.now() - new Date(latestReading.timestamp).getTime();

  if (ageInMs > 20000) {
    return "Meter Offline";
  }

  if (source !== "database") {
    return "Meter Online";
  }

  return "Meter Online";
}

function buildDashboardFromSnapshot(snapshot) {
  const { latestReading, history, bill, alerts, meter, source, dailyUsage, billingForecast } = snapshot;

  return {
    latestReading,
    history,
    bill,
    alerts,
    meter,
    dailyUsage,
    billingForecast,
    source,
    lastUpdated: latestReading?.timestamp || meter.lastSync,
    connectionLabel: getConnectionLabel(source, latestReading, meter),
  };
}

export async function fetchLatestReading(token, meterId) {
  if (isMockToken(token)) {
    const snapshot = getMockDashboardSnapshot(meterId);
    return {
      reading: snapshot.latestReading,
      meter: snapshot.meter,
      source: snapshot.source,
    };
  }

  try {
    const payload = await fetchLatestReadingFromBackend(token);
    return {
      reading: payload.reading,
      meter: payload.meter,
      source: payload.source || "database",
    };
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      const snapshot = getMockDashboardSnapshot(meterId);
      return {
        reading: snapshot.latestReading,
        meter: snapshot.meter,
        source: snapshot.source,
      };
    }

    throw error;
  }
}

export async function fetchReadingHistory(token, meterId) {
  if (isMockToken(token)) {
    const snapshot = getMockDashboardSnapshot(meterId);
    return {
      readings: snapshot.history,
      source: snapshot.source,
    };
  }

  try {
    const payload = await fetchHistoryFromBackend(token);
    return {
      readings: payload.readings,
      source: payload.source || "database",
    };
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      const snapshot = getMockDashboardSnapshot(meterId);
      return {
        readings: snapshot.history,
        source: snapshot.source,
      };
    }

    throw error;
  }
}

export async function fetchBilling(token, meterId) {
  if (isMockToken(token)) {
    const snapshot = getMockDashboardSnapshot(meterId);
    return {
      bill: snapshot.bill,
      source: snapshot.source,
    };
  }

  try {
    const payload = await fetchBillingFromBackend(token);
    return {
      bill: normalizeBillPayload(payload, null, meterId),
      source: payload.source || "database",
    };
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      const snapshot = getMockDashboardSnapshot(meterId);
      return {
        bill: snapshot.bill,
        source: snapshot.source,
      };
    }

    throw error;
  }
}

export async function fetchAlerts(token, meterId) {
  if (isMockToken(token)) {
    const snapshot = getMockDashboardSnapshot(meterId);
    return {
      alerts: snapshot.alerts,
      source: snapshot.source,
    };
  }

  try {
    const payload = await fetchAlertsFromBackend(token);
    return {
      alerts: payload.alerts,
      source: payload.source || "database",
    };
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      const snapshot = getMockDashboardSnapshot(meterId);
      return {
        alerts: snapshot.alerts,
        source: snapshot.source,
      };
    }

    throw error;
  }
}

export async function fetchDashboardBundle({ token, meterId }) {
  // Flow: ESP32 sensors -> cloud/backend API -> MongoDB Atlas -> React charts.
  // When the API is unavailable, we fall back to a live mock simulation so the
  // UI keeps updating every 3 seconds during local development.
  if (isMockToken(token)) {
    return buildDashboardFromSnapshot(getMockDashboardSnapshot(meterId));
  }

  try {
    const [latestPayload, historyPayload, billingPayload, alertsPayload] = await Promise.all([
      fetchLatestReadingFromBackend(token),
      fetchHistoryFromBackend(token),
      fetchBillingFromBackend(token),
      fetchAlertsFromBackend(token),
    ]);

    const latestReading = latestPayload.reading;
    const history = historyPayload.readings || [];
    const bill = normalizeBillPayload(billingPayload, latestReading, meterId);
    const alerts = alertsPayload.alerts || [];
    const source = [latestPayload, historyPayload, billingPayload, alertsPayload].every(
      (result) => result.source === "database",
    )
      ? "database"
      : "mock";
    const meter = latestPayload.meter || getMockDeviceStatus(meterId, {}, latestReading);
    const dailyUsage = buildDailyUsageSeries({ history, latestReading, meterId });

    return buildDashboardFromSnapshot({
      latestReading,
      history,
      bill,
      alerts,
      meter,
      source,
      dailyUsage,
      billingForecast: buildBillingForecastSeries({ bill, latestReading, history, dailyUsage, meterId }),
    });
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isNetworkError(error) || isMissingDataRouteError(error)) {
      return buildDashboardFromSnapshot(getMockDashboardSnapshot(meterId));
    }

    throw error;
  }
}
