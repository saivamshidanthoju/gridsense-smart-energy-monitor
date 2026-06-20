import {
  buildBillingForecastSeries,
  calculateTelanganaLtIDomesticBill,
} from "../utils/telanganaTariff";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const SESSION_STORAGE_KEY = "smart-power-meter-session";
const PAYMENT_HISTORY_STORAGE_KEY = "smart-power-meter-payments";
const MOCK_TOKEN_PREFIX = "mock-session-";
const DEFAULT_METER_ID = "SC-104829375";
const DEMO_CREDENTIALS = {
  email: "user@gmail.com",
  meterId: DEFAULT_METER_ID,
  password: "demo-password",
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

function createDemoUser(overrides = {}) {
  return {
    id: overrides.id || `demo-${(overrides.meterId || DEFAULT_METER_ID).toLowerCase()}`,
    name: overrides.name || "Sai Vamshi",
    email: overrides.email || DEMO_CREDENTIALS.email,
    meterId: overrides.meterId || DEFAULT_METER_ID,
    role: overrides.role || "consumer",
    createdAt: overrides.createdAt || new Date().toISOString(),
  };
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

function withQuery(endpoint, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalizedValue = String(value || "").trim();

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

function createFallbackSession(overrides = {}) {
  const user = createDemoUser(overrides);

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

function toFiniteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeReadingPayload(payload = null) {
  const rawReading = payload?.reading || payload?.latestReading || payload;

  if (!rawReading || typeof rawReading !== "object" || !rawReading.timestamp) {
    return null;
  }

  return {
    meterId: rawReading.meterId || DEFAULT_METER_ID,
    voltage: toFiniteNumber(rawReading.voltage),
    current: toFiniteNumber(rawReading.current),
    power: toFiniteNumber(rawReading.power),
    energyKWh: toFiniteNumber(rawReading.energyKWh),
    timestamp: rawReading.timestamp,
    phaseType: rawReading.phaseType,
    contractedLoad: rawReading.contractedLoad,
    deviceIp: rawReading.deviceIp,
    ipAddress: rawReading.ipAddress,
    rssi: rawReading.rssi,
  };
}

function normalizeHistoryPayload(payload = {}) {
  const rawReadings = Array.isArray(payload) ? payload : payload?.readings || [];

  return rawReadings
    .map(normalizeReadingPayload)
    .filter(Boolean)
    .slice(-20);
}

function buildDeviceStatusFromReading(reading, meterId = DEFAULT_METER_ID) {
  if (!reading) {
    return null;
  }

  return {
    meterId: reading.meterId || meterId || DEFAULT_METER_ID,
    location: "Home",
    status: "online",
    firmware: "v2.4.1",
    transport: "HTTP / MQTT ready",
    backend: "Node.js + Express",
    cloudDatabase: "MongoDB Atlas",
    lastSync: reading.timestamp,
    ipAddress: reading.deviceIp || reading.ipAddress || "Unknown",
    wifiSignal: Number.isFinite(Number(reading.rssi)) ? `${reading.rssi} dBm` : "Unknown",
  };
}

function buildLiveAlerts(reading, bill = null) {
  if (!reading) {
    return [];
  }

  const voltageWarning = reading.voltage < 210 || reading.voltage > 250;

  return [
    {
      id: `${reading.meterId}-power`,
      severity: reading.power > 1400 ? "critical" : "info",
      title: reading.power > 1400 ? "Peak load warning" : "Connection stabilized",
      message:
        reading.power > 1400
          ? `Power usage crossed ${reading.power} W. Consider reducing heavy appliance usage.`
          : "Smart electricity meter is connected and transmitting usage updates in real-time.",
      createdAt: reading.timestamp,
    },
    {
      id: `${reading.meterId}-voltage`,
      severity: voltageWarning ? "warning" : "info",
      title: voltageWarning ? "Voltage outside expected range" : "Voltage stable",
      message: voltageWarning
        ? `Latest voltage is ${reading.voltage} V. Check incoming line stability.`
        : `Line voltage is stable near ${reading.voltage} V.`,
      createdAt: reading.timestamp,
    },
    {
      id: `${reading.meterId}-billing`,
      severity: bill?.finalPayableEstimate > 1000 ? "warning" : "info",
      title: "Estimated bill updated",
      message: "Estimated monthly bill updated from the latest ESP32 reading.",
      createdAt: reading.timestamp,
    },
  ];
}

function getDayKey(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toISOString().slice(0, 10);
}

function getDayLabel(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Reading";
  }

  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function buildDailyUsageFromReadings({ history = [], latestReading = null } = {}) {
  const seen = new Set();
  const readings = [...history, latestReading]
    .filter(Boolean)
    .filter((reading) => {
      const key = `${reading.meterId || ""}:${reading.timestamp}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((first, second) => new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime());

  if (!readings.length) {
    return [];
  }

  const byDay = new Map();

  readings.forEach((reading) => {
    const key = getDayKey(reading.timestamp);
    const energyKWh = toFiniteNumber(reading.energyKWh);
    const current = byDay.get(key) || {
      day: getDayLabel(reading.timestamp),
      firstEnergy: energyKWh,
      lastEnergy: energyKWh,
      count: 0,
    };

    current.lastEnergy = energyKWh;
    current.count += 1;
    byDay.set(key, current);
  });

  return Array.from(byDay.values()).slice(-7).map((item) => ({
    day: item.day,
    kWh: Number((item.count > 1 ? Math.max(0, item.lastEnergy - item.firstEnergy) : item.lastEnergy).toFixed(3)),
  }));
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
      user: fallbackUser || createDemoUser(),
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
        user: fallbackUser || createDemoUser(),
        source: "mock",
      };
    }

    throw error;
  }
}

async function fetchLatestReadingFromBackend(meterId = "") {
  return request(withQuery("/api/readings/latest", { meterId }));
}

async function fetchHistoryFromBackend(meterId = "") {
  return request(withQuery("/api/readings/history", { meterId }));
}

async function fetchBillingFromBackend(token, meterId = "") {
  return request(withQuery("/api/billing", { meterId }), {
    headers: buildAuthHeaders(token),
  });
}

async function fetchAlertsFromBackend(token, meterId = "") {
  return request(withQuery("/api/alerts", { meterId }), {
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
  if (!latestReading?.timestamp) {
    return "Waiting for ESP32 data";
  }

  if (meter?.status === "offline") {
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
    lastUpdated: latestReading?.timestamp || meter?.lastSync || null,
    connectionLabel: getConnectionLabel(source, latestReading, meter),
  };
}

export async function fetchLatestReading(meterId = "") {
  try {
    const payload = await fetchLatestReadingFromBackend(meterId);
    const reading = normalizeReadingPayload(payload);

    return {
      reading,
      meter: buildDeviceStatusFromReading(reading),
      source: "database",
    };
  } catch (error) {
    if (isMissingDataRouteError(error)) {
      return {
        reading: null,
        meter: null,
        source: "database",
      };
    }

    throw new Error("Unable to connect to backend");
  }
}

export async function fetchReadingHistory(meterId = "") {
  try {
    const payload = await fetchHistoryFromBackend(meterId);
    return {
      readings: normalizeHistoryPayload(payload),
      source: "database",
    };
  } catch (error) {
    if (isMissingDataRouteError(error)) {
      return {
        readings: [],
        source: "database",
      };
    }

    throw new Error("Unable to connect to backend");
  }
}

export async function fetchBilling(token, meterId) {
  const payload = await fetchBillingFromBackend(token, meterId);
  return {
    bill: normalizeBillPayload(payload, null, meterId),
    source: payload.source || "database",
  };
}

export async function fetchAlerts(token, meterId = "") {
  const payload = await fetchAlertsFromBackend(token, meterId);
  return {
    alerts: payload.alerts || [],
    source: payload.source || "database",
  };
}

export async function fetchDashboardBundle({ token, meterId }) {
  try {
    const latestPayload = await fetchLatestReadingFromBackend();
    const latestReading = normalizeReadingPayload(latestPayload);

    if (!latestReading) {
      return buildDashboardFromSnapshot({
        latestReading: null,
        history: [],
        bill: null,
        alerts: [],
        meter: null,
        source: "database",
        dailyUsage: [],
        billingForecast: [],
      });
    }

    const liveMeterId = latestReading.meterId || meterId || DEFAULT_METER_ID;
    const historyPayload = await fetchHistoryFromBackend(liveMeterId);
    const history = normalizeHistoryPayload(historyPayload);
    let bill = normalizeBillPayload({}, latestReading, liveMeterId);
    let alerts = buildLiveAlerts(latestReading, bill);

    if (token && !isMockToken(token)) {
      const [billingResult, alertsResult] = await Promise.allSettled([
        fetchBillingFromBackend(token, liveMeterId),
        fetchAlertsFromBackend(token, liveMeterId),
      ]);

      if (billingResult.status === "rejected" && billingResult.reason?.status === 401) {
        throw billingResult.reason;
      }

      if (alertsResult.status === "rejected" && alertsResult.reason?.status === 401) {
        throw alertsResult.reason;
      }

      if (billingResult.status === "fulfilled") {
        bill = normalizeBillPayload(billingResult.value, latestReading, liveMeterId);
      }

      if (alertsResult.status === "fulfilled") {
        alerts = alertsResult.value.alerts || alerts;
      }
    }

    const dailyUsage = buildDailyUsageFromReadings({ history, latestReading });

    return buildDashboardFromSnapshot({
      latestReading,
      history,
      bill,
      alerts,
      meter: buildDeviceStatusFromReading(latestReading, liveMeterId),
      source: "database",
      dailyUsage,
      billingForecast: buildBillingForecastSeries({ bill, latestReading, history, dailyUsage, meterId: liveMeterId }),
    });
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }

    if (isMissingDataRouteError(error)) {
      return buildDashboardFromSnapshot({
        latestReading: null,
        history: [],
        bill: null,
        alerts: [],
        meter: null,
        source: "database",
        dailyUsage: [],
        billingForecast: [],
      });
    }

    throw new Error("Unable to connect to backend");
  }
}
