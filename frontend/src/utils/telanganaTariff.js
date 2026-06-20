const DEFAULT_METER_ID = "SC-104829375";
const TARIFF_REGION = "Telangana";
const TARIFF_CATEGORY = "LT-I Domestic";
const DEFAULT_PHASE_TYPE = "single";
const DEFAULT_CONTRACTED_LOAD = 1;
const FIXED_MONTHLY_CHARGE = 10;
const SINGLE_PHASE_MINIMUM_UP_TO_1KW = 25;
const SINGLE_PHASE_MINIMUM_ABOVE_1KW = 50;
const THREE_PHASE_MINIMUM = 150;

const SLAB_MAP = {
  "LT-I(A)": [
    { label: "0-50 units", upto: 50, rate: 1.95 },
    { label: "51-100 units", upto: 100, rate: 3.1 },
  ],
  "LT-I(B)(i)": [
    { label: "0-100 units", upto: 100, rate: 3.4 },
    { label: "101-200 units", upto: 200, rate: 4.8 },
  ],
  "LT-I(B)(ii)": [
    { label: "0-200 units", upto: 200, rate: 5.1 },
    { label: "201-300 units", upto: 300, rate: 7.7 },
    { label: "301-400 units", upto: 400, rate: 9 },
    { label: "401-800 units", upto: 800, rate: 9.5 },
    { label: "Above 800 units", upto: Number.POSITIVE_INFINITY, rate: 10 },
  ],
};

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || Number.isNaN(numericValue)) {
    return 0;
  }

  return numericValue;
}

function roundToTwo(value) {
  return Math.round(normalizeNumber(value) * 100) / 100;
}

function roundToOne(value) {
  return Math.round(normalizeNumber(value) * 10) / 10;
}

function normalizeUnits(value) {
  return Math.max(0, roundToTwo(value));
}

function normalizePhaseType(value) {
  const normalizedValue = String(value || DEFAULT_PHASE_TYPE).toLowerCase();

  if (normalizedValue.includes("three") || normalizedValue.includes("3")) {
    return "three";
  }

  return DEFAULT_PHASE_TYPE;
}

function normalizeContractedLoad(value) {
  const numericValue = normalizeNumber(value);

  if (numericValue > 0) {
    return roundToTwo(numericValue);
  }

  return DEFAULT_CONTRACTED_LOAD;
}

export function getTariffBand(monthlyUnits = 0) {
  const units = normalizeUnits(monthlyUnits);

  if (units <= 100) {
    return "LT-I(A)";
  }

  if (units <= 200) {
    return "LT-I(B)(i)";
  }

  return "LT-I(B)(ii)";
}

function getSlabsForUnits(monthlyUnits = 0) {
  return SLAB_MAP[getTariffBand(monthlyUnits)];
}

export function getBillingCycleLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getBillingDueDateLabel(date = new Date()) {
  const dueDate = new Date(date);
  dueDate.setDate(1);
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(0);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dueDate);
}

export function getMinimumCharge(phaseType = DEFAULT_PHASE_TYPE, contractedLoad = DEFAULT_CONTRACTED_LOAD) {
  if (normalizePhaseType(phaseType) === "three") {
    return THREE_PHASE_MINIMUM;
  }

  return normalizeContractedLoad(contractedLoad) > 1
    ? SINGLE_PHASE_MINIMUM_ABOVE_1KW
    : SINGLE_PHASE_MINIMUM_UP_TO_1KW;
}

export function getMinimumChargeRule(phaseType = DEFAULT_PHASE_TYPE, contractedLoad = DEFAULT_CONTRACTED_LOAD) {
  if (normalizePhaseType(phaseType) === "three") {
    return "Three phase connection: Rs.150 monthly minimum";
  }

  return normalizeContractedLoad(contractedLoad) > 1
    ? "Single phase above 1kW: Rs.50 monthly minimum"
    : "Single phase up to 1kW: Rs.25 monthly minimum";
}

function buildSlabBreakup(monthlyUnits = 0, slabs = []) {
  let previousLimit = 0;
  let energyCharge = 0;
  const slabBreakup = [];
  const units = normalizeUnits(monthlyUnits);

  for (const slab of slabs) {
    const upperLimit = Number.isFinite(slab.upto) ? Math.min(units, slab.upto) : units;
    const slabUnits = Math.max(0, upperLimit - previousLimit);

    if (slabUnits > 0) {
      const charge = roundToTwo(slabUnits * slab.rate);

      slabBreakup.push({
        label: slab.label,
        units: roundToTwo(slabUnits),
        rate: slab.rate,
        charge,
      });

      energyCharge += charge;
    }

    if (Number.isFinite(slab.upto)) {
      previousLimit = slab.upto;
    } else {
      previousLimit = units;
    }
  }

  return {
    energyCharge: roundToTwo(energyCharge),
    slabBreakup,
  };
}

function getStatusLabel({ tariffBand, minimumChargeApplied }) {
  if (minimumChargeApplied) {
    return "Minimum charge applied";
  }

  if (tariffBand === "LT-I(B)(ii)") {
    return "Higher slab active";
  }

  if (tariffBand === "LT-I(B)(i)") {
    return "Mid slab active";
  }

  return "Within LT-I(A)";
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
  }).format(date);
}

function getForecastLabels(count = 6) {
  const labels = [];
  const baseDate = new Date();
  baseDate.setDate(1);

  for (let index = 0; index < count; index += 1) {
    const monthDate = new Date(baseDate);
    monthDate.setMonth(baseDate.getMonth() + index);
    labels.push({
      month: formatMonthLabel(monthDate),
      date: monthDate,
    });
  }

  return labels;
}

export function getNextTariffThreshold(monthlyUnits = 0) {
  const units = normalizeUnits(monthlyUnits);

  if (units < 50) {
    return 50;
  }

  if (units < 100) {
    return 100;
  }

  if (units < 200) {
    return 200;
  }

  if (units < 300) {
    return 300;
  }

  if (units < 400) {
    return 400;
  }

  if (units < 800) {
    return 800;
  }

  return null;
}

export function getTariffWarningMessage(currentUnits = 0, projectedUnits = 0) {
  const currentBand = getTariffBand(currentUnits);
  const projectedBand = getTariffBand(projectedUnits);
  const threshold = getNextTariffThreshold(currentUnits);

  if (currentBand !== projectedBand) {
    return `Projected usage moves from ${currentBand} to ${projectedBand}.`;
  }

  if (threshold && projectedUnits >= threshold * 0.9) {
    return `Projected usage is close to the next slab at ${threshold} units.`;
  }

  return `Projected usage stays within ${currentBand}.`;
}

export function projectMonthlyUnits({
  monthlyUnits,
  latestReading,
  history = [],
  dailyUsage = [],
} = {}) {
  const currentUnits = normalizeUnits(
    monthlyUnits ?? latestReading?.energyKWh ?? history[history.length - 1]?.energyKWh ?? 0,
  );

  if (dailyUsage.length > 0) {
    const averageDailyUsage =
      dailyUsage.reduce((total, item) => total + normalizeUnits(item?.kWh), 0) / dailyUsage.length;
    const powerBoost = Math.max(0.06, Math.min(0.22, normalizeNumber(latestReading?.power) / 5000));
    return roundToTwo(Math.max(currentUnits * 1.05, averageDailyUsage * 30 * (1 + powerBoost)));
  }

  if (history.length >= 2) {
    const recentWindow = history.slice(-6);
    const firstReading = recentWindow[0];
    const lastReading = recentWindow[recentWindow.length - 1];
    const deltaUnits = Math.max(0, normalizeUnits(lastReading?.energyKWh) - normalizeUnits(firstReading?.energyKWh));
    const deltaHours = Math.max(
      (new Date(lastReading?.timestamp).getTime() - new Date(firstReading?.timestamp).getTime()) / 3600000,
      0.001,
    );
    const hourlyRate = deltaUnits / deltaHours;
    const projectedFromTrend = hourlyRate * 24 * 30;

    return roundToTwo(Math.max(currentUnits * 1.08, projectedFromTrend));
  }

  const powerFactor = Math.max(0.08, Math.min(0.24, normalizeNumber(latestReading?.power) / 4500));
  return roundToTwo(currentUnits * (1 + powerFactor));
}

export function calculateTelanganaLtIDomesticBill(input = {}) {
  const monthlyUnits = normalizeUnits(input.monthlyUnits ?? input.unitsConsumed ?? input.energyKWh ?? 0);
  const phaseType = normalizePhaseType(input.phaseType);
  const contractedLoad = normalizeContractedLoad(input.contractedLoad);
  const tariffBand = input.tariffBand || getTariffBand(monthlyUnits);
  const slabs = getSlabsForUnits(monthlyUnits);
  const { energyCharge, slabBreakup } = buildSlabBreakup(monthlyUnits, slabs);
  const fixedCharge = FIXED_MONTHLY_CHARGE;
  const minimumCharge = getMinimumCharge(phaseType, contractedLoad);
  const baseAmount = roundToTwo(energyCharge + fixedCharge);
  const finalPayableEstimate = roundToTwo(Math.max(baseAmount, minimumCharge));
  const minimumChargeApplied = finalPayableEstimate > baseAmount;
  const billingCycle = input.billingCycle || getBillingCycleLabel(input.billingDate || input.generatedAt || new Date());
  const dueDate = input.dueDate || getBillingDueDateLabel(input.billingDate || input.generatedAt || new Date());

  return {
    meterId: input.meterId || DEFAULT_METER_ID,
    monthlyUnits,
    unitsConsumed: monthlyUnits,
    energyKWh: monthlyUnits,
    phaseType,
    contractedLoad,
    tariffRegion: input.tariffRegion || TARIFF_REGION,
    tariffCategory: input.tariffCategory || TARIFF_CATEGORY,
    tariffBand,
    tariffLabel: tariffBand,
    billingCycle,
    dueDate,
    fixedCharge,
    minimumCharge,
    minimumChargeRule: getMinimumChargeRule(phaseType, contractedLoad),
    minimumChargeApplied,
    energyCharge,
    slabBreakup,
    baseAmount,
    finalPayableEstimate,
    estimatedBill: finalPayableEstimate,
    currency: "INR",
    status: input.status || getStatusLabel({ tariffBand, minimumChargeApplied }),
    generatedAt: new Date().toISOString(),
  };
}

export function buildBillingForecastSeries({
  bill = null,
  latestReading = null,
  history = [],
  dailyUsage = [],
  meterId = DEFAULT_METER_ID,
  count = 6,
} = {}) {
  const normalizedBill = bill
    ? calculateTelanganaLtIDomesticBill({
        meterId: bill.meterId || meterId,
        monthlyUnits: bill.monthlyUnits ?? bill.unitsConsumed ?? bill.energyKWh ?? latestReading?.energyKWh,
        phaseType: bill.phaseType || latestReading?.phaseType,
        contractedLoad: bill.contractedLoad || latestReading?.contractedLoad,
        tariffRegion: bill.tariffRegion,
        tariffCategory: bill.tariffCategory,
        billingCycle: bill.billingCycle,
        dueDate: bill.dueDate,
        status: bill.status,
      })
    : calculateTelanganaLtIDomesticBill({
        meterId,
        monthlyUnits: latestReading?.energyKWh,
        phaseType: latestReading?.phaseType,
        contractedLoad: latestReading?.contractedLoad,
      });

  const baseProjectedUnits = projectMonthlyUnits({
    monthlyUnits: normalizedBill.monthlyUnits,
    latestReading,
    history,
    dailyUsage,
  });
  const monthLabels = getForecastLabels(count);

  return monthLabels.map((item, index) => {
    const growthFactor = 1 + index * 0.035 + Math.sin((baseProjectedUnits + index) * 0.32) * 0.02;
    const projectedUnits = roundToOne(baseProjectedUnits * growthFactor);
    const projectedBill = calculateTelanganaLtIDomesticBill({
      meterId: normalizedBill.meterId,
      monthlyUnits: projectedUnits,
      phaseType: normalizedBill.phaseType,
      contractedLoad: normalizedBill.contractedLoad,
      tariffRegion: normalizedBill.tariffRegion,
      tariffCategory: normalizedBill.tariffCategory,
      billingCycle: item.month,
      dueDate: getBillingDueDateLabel(item.date),
    });

    return {
      month: item.month,
      projectedUnits,
      bill: projectedBill.finalPayableEstimate,
      tariffBand: projectedBill.tariffBand,
      tariffCategory: projectedBill.tariffCategory,
      minimumChargeApplied: projectedBill.minimumChargeApplied,
    };
  });
}

export function getDefaultTariffContext(overrides = {}) {
  return calculateTelanganaLtIDomesticBill({
    meterId: overrides.meterId || DEFAULT_METER_ID,
    monthlyUnits: overrides.monthlyUnits,
    phaseType: overrides.phaseType,
    contractedLoad: overrides.contractedLoad,
    tariffRegion: overrides.tariffRegion,
    tariffCategory: overrides.tariffCategory,
  });
}
