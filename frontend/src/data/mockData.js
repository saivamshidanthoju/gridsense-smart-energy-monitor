import {
  buildBillingForecastSeries as buildTariffForecastSeries,
  calculateTelanganaLtIDomesticBill,
  getBillingCycleLabel,
  getBillingDueDateLabel,
} from "../utils/telanganaTariff";

const DEFAULT_METER_ID = "SC-104829375";
const SIMULATION_INTERVAL_MS = 3000;

const meterSimulation = new Map();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function jitter(min, max) {
  return min + Math.random() * (max - min);
}

function createBaseReading(meterId = DEFAULT_METER_ID, timestamp = new Date()) {
  const seed = meterId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  const voltage = 226 + (seed % 7);
  
  // Power draw strictly between 10 to 20 W
  const power = 10 + (seed % 11); // 10 to 20 W
  const current = Number((power / voltage).toFixed(3));
  
  // Initialize cumulative energy reading between 100 and 120 kWh
  const energyKWh = 100 + (seed % 5) * 5; // 100 to 120 units

  return {
    meterId,
    voltage: +voltage.toFixed(1),
    current,
    power,
    energyKWh: +energyKWh.toFixed(2),
    timestamp: timestamp.toISOString(),
  };
}

function createNextReading(previousReading, timestamp) {
  const voltage = clamp(previousReading.voltage + jitter(-2.8, 3.1), 218, 242);
  
  // Fluctuate power draw between 10 to 20 W
  const power = clamp(previousReading.power + Math.round(jitter(-1.5, 1.8)), 10, 20);
  const current = Number((power / voltage).toFixed(3));
  
  const elapsedHours = Math.max(
    SIMULATION_INTERVAL_MS / 3600000,
    (timestamp.getTime() - new Date(previousReading.timestamp).getTime()) / 3600000,
  );

  return {
    meterId: previousReading.meterId,
    voltage: +voltage.toFixed(1),
    current,
    power,
    energyKWh: +(previousReading.energyKWh + (power / 1000) * elapsedHours).toFixed(3),
    timestamp: timestamp.toISOString(),
  };
}

function createInitialHistory(meterId = DEFAULT_METER_ID) {
  const startTime = new Date(Date.now() - SIMULATION_INTERVAL_MS * 24);
  const initialReading = createBaseReading(meterId, startTime);
  const history = [initialReading];

  for (let index = 1; index < 24; index += 1) {
    const nextTimestamp = new Date(startTime.getTime() + SIMULATION_INTERVAL_MS * index);
    history.push(createNextReading(history[index - 1], nextTimestamp));
  }

  return history;
}

function getSimulationState(meterId = DEFAULT_METER_ID) {
  if (!meterSimulation.has(meterId)) {
    meterSimulation.set(meterId, {
      history: createInitialHistory(meterId),
      deviceStatus: "online",
    });
  }

  return meterSimulation.get(meterId);
}

function advanceSimulation(meterId = DEFAULT_METER_ID) {
  const state = getSimulationState(meterId);
  const now = Date.now();
  let latestReading = state.history[state.history.length - 1];

  while (now - new Date(latestReading.timestamp).getTime() >= SIMULATION_INTERVAL_MS) {
    const nextTimestamp = new Date(new Date(latestReading.timestamp).getTime() + SIMULATION_INTERVAL_MS);
    latestReading = createNextReading(latestReading, nextTimestamp);
    state.history.push(latestReading);

    if (state.history.length > 36) {
      state.history = state.history.slice(-36);
    }
  }

  return {
    ...state,
    latestReading: state.history[state.history.length - 1],
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: overrides.id || `mock-${(overrides.meterId || DEFAULT_METER_ID).toLowerCase()}`,
    name: overrides.name || "Sai Vamshi",
    email: overrides.email || "user@gmail.com",
    meterId: overrides.meterId || DEFAULT_METER_ID,
    role: overrides.role || "consumer",
    createdAt: overrides.createdAt || new Date().toISOString(),
  };
}

export function getMockLatestReading(meterId = DEFAULT_METER_ID) {
  return advanceSimulation(meterId).latestReading;
}

export function getMockReadingHistory(meterId = DEFAULT_METER_ID) {
  return advanceSimulation(meterId).history.slice(-24);
}

export function getMockBilling(meterId = DEFAULT_METER_ID, latestReading = null) {
  const reading = latestReading || getMockLatestReading(meterId);
  return calculateTelanganaLtIDomesticBill({
    meterId,
    monthlyUnits: reading.energyKWh,
    phaseType: reading.phaseType || "single",
    contractedLoad: reading.contractedLoad || 1,
    billingCycle: getBillingCycleLabel(new Date()),
    dueDate: getBillingDueDateLabel(new Date()),
    status: reading.power > 1400 ? "High usage" : "Within LT-I(A)",
  });
}

export function getMockAlerts(meterId = DEFAULT_METER_ID, latestReading = null) {
  const reading = latestReading || getMockLatestReading(meterId);
  const alertTime = reading.timestamp;

  return [
    {
      id: `${meterId}-power`,
      severity: reading.power > 1400 ? "critical" : "info",
      title: reading.power > 1400 ? "High usage detected" : "Meter data updated",
      message:
        reading.power > 1400
          ? `Power crossed ${reading.power} W. Consider reducing heavy appliance usage.`
          : "Your latest meter reading is available.",
      createdAt: alertTime,
    },
    {
      id: `${meterId}-voltage`,
      severity: reading.voltage < 225 ? "warning" : "info",
      title: reading.voltage < 225 ? "Voltage dip observed" : "Voltage within nominal band",
      message:
        reading.voltage < 225
          ? `Latest voltage is ${reading.voltage} V. Check incoming line stability.`
          : `Voltage is stable near ${reading.voltage} V for meter ${meterId}.`,
      createdAt: new Date(new Date(alertTime).getTime() - 60000).toISOString(),
    },
    {
      id: `${meterId}-billing`,
      severity: "info",
      title: "Estimated bill refreshed",
      message: `Estimated monthly bill updated from live energy usage for meter ${meterId}.`,
      createdAt: new Date(new Date(alertTime).getTime() - 120000).toISOString(),
    },
  ];
}

export function getMockDeviceStatus(meterId = DEFAULT_METER_ID, overrides = {}, latestReading = null) {
  const reading = latestReading || getMockLatestReading(meterId);

  return {
    meterId,
    location: overrides.location || "Home",
    status: overrides.status || "online",
    firmware: overrides.firmware || "v2.4.1",
    transport: overrides.transport || "HTTP / MQTT ready",
    backend: overrides.backend || "Node.js + Express",
    cloudDatabase: overrides.cloudDatabase || "MongoDB Atlas",
    lastSync: reading.timestamp,
    ipAddress: overrides.ipAddress || "192.168.0.38",
    wifiSignal: overrides.wifiSignal || "-61 dBm",
  };
}

function getRecentDayLabels(count = 7) {
  const labels = [];
  const baseDate = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() - index);
    labels.push(day.toLocaleDateString("en-IN", { weekday: "short" }));
  }

  return labels;
}

export function buildDailyUsageSeries({ history = [], latestReading = null, meterId = DEFAULT_METER_ID } = {}) {
  const latest = latestReading || history[history.length - 1] || getMockLatestReading(meterId);
  const currentDay = new Date(latest.timestamp).getDate() || 14;
  const baseline = Math.max(3.0, Math.min(8.0, latest.energyKWh / currentDay));

  return getRecentDayLabels(7).map((day, index) => {
    const drift = 0.86 + index * 0.045 + Math.sin((latest.current + index) * 0.75) * 0.08;
    return {
      day,
      kWh: +(baseline * drift).toFixed(2),
    };
  });
}

function getForecastMonthLabels(count = 6) {
  const labels = [];
  const baseDate = new Date();
  baseDate.setDate(1);

  for (let index = 0; index < count; index += 1) {
    const month = new Date(baseDate);
    month.setMonth(baseDate.getMonth() + index);
    labels.push(month.toLocaleDateString("en-IN", { month: "short" }));
  }

  return labels;
}

export function buildBillingForecastSeries({
  bill = null,
  latestReading = null,
  history = [],
  dailyUsage = [],
  meterId = DEFAULT_METER_ID,
} = {}) {
  const latest = latestReading || getMockLatestReading(meterId);
  const billing = bill || getMockBilling(meterId, latest);

  return buildTariffForecastSeries({
    bill: billing,
    latestReading: latest,
    history,
    dailyUsage,
    meterId,
  });
}

export function summarizeHistory(history = []) {
  if (!history.length) {
    return {
      averageVoltage: 0,
      averageCurrent: 0,
      peakPower: 0,
      totalEnergy: 0,
    };
  }

  const totals = history.reduce(
    (summary, reading) => ({
      voltage: summary.voltage + reading.voltage,
      current: summary.current + reading.current,
      peakPower: Math.max(summary.peakPower, reading.power),
    }),
    { voltage: 0, current: 0, peakPower: 0 },
  );

  return {
    averageVoltage: +(totals.voltage / history.length).toFixed(1),
    averageCurrent: +(totals.current / history.length).toFixed(2),
    peakPower: totals.peakPower,
    totalEnergy: history[history.length - 1].energyKWh,
  };
}

export function getDefaultMeterId() {
  return DEFAULT_METER_ID;
}

export function getMockDashboardSnapshot(meterId = DEFAULT_METER_ID) {
  const state = advanceSimulation(meterId);
  const latestReading = state.latestReading;
  const history = state.history.slice(-24);
  const bill = getMockBilling(meterId, latestReading);
  const alerts = getMockAlerts(meterId, latestReading);
  const meter = getMockDeviceStatus(meterId, {}, latestReading);

  return {
    latestReading,
    history,
    bill,
    alerts,
    meter,
    dailyUsage: buildDailyUsageSeries({ history, latestReading, meterId }),
    billingForecast: buildBillingForecastSeries({ bill, latestReading, history, meterId }),
    source: "mock",
  };
}
