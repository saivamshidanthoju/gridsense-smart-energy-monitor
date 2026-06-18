const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  calculateTelanganaLtIDomesticBill,
  getBillingCycleLabel,
  getBillingDueDateLabel,
} = require("./telanganaTariff");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SIMULATION_INTERVAL_MS = 3000;
const DEFAULT_METER_ID = "SC-104829375";

let db;
let client;
const meterSimulation = new Map();
const paymentHistory = new Map();

app.use(cors());
app.use(express.json());

async function connectDB() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log("MongoDB connected");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    meterId: user.meterId,
    createdAt: user.createdAt,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      meterId: user.meterId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

async function getUserFromAuth(auth) {
  if (!db || !auth) {
    return null;
  }

  const usersCollection = db.collection("users");

  if (auth.userId && ObjectId.isValid(auth.userId)) {
    const user = await usersCollection.findOne({ _id: new ObjectId(auth.userId) });
    if (user) {
      return user;
    }
  }

  return usersCollection.findOne({
    email: new RegExp(`^${escapeRegExp(auth.email)}$`, "i"),
    meterId: auth.meterId,
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function jitter(min, max) {
  return min + Math.random() * (max - min);
}

function createBaseReading(meterId, timestamp) {
  const seed = meterId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  const voltage = 226 + (seed % 7);
  
  // Power draw strictly between 10 to 20 W
  const power = 10 + (seed % 11); // 10 to 20 W
  const current = Number((power / voltage).toFixed(3));
  
  // Initialize cumulative energy reading between 100 and 120 kWh
  const energyKWh = 100 + (seed % 5) * 5; // 100 to 120 units

  return {
    meterId,
    voltage: Number(voltage.toFixed(1)),
    current,
    power,
    energyKWh: Number(energyKWh.toFixed(2)),
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
    voltage: Number(voltage.toFixed(1)),
    current,
    power,
    energyKWh: Number((previousReading.energyKWh + (power / 1000) * elapsedHours).toFixed(3)),
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

function buildDeviceStatus(meterId, latestReading) {
  return {
    meterId,
    location: "Home",
    status: "online",
    firmware: "v2.4.1",
    transport: "HTTP / MQTT ready",
    backend: "Node.js + Express",
    cloudDatabase: "MongoDB Atlas",
    lastSync: latestReading.timestamp,
    ipAddress: "192.168.0.38",
    wifiSignal: "-61 dBm",
  };
}

function buildAlerts(meterId, latestReading, bill) {
  const alertTime = latestReading.timestamp;

  return [
    {
      id: `${meterId}-power`,
      severity: latestReading.power > 1400 ? "critical" : "info",
      title: latestReading.power > 1400 ? "Peak load warning" : "Connection stabilized",
      message:
        latestReading.power > 1400
          ? `Power usage crossed ${latestReading.power} W. Consider turning off water heaters or heavy appliances.`
          : "Smart electricity meter is connected and transmitting usage updates in real-time.",
      createdAt: alertTime,
    },
    {
      id: `${meterId}-voltage`,
      severity: latestReading.voltage < 225 ? "warning" : "info",
      title: latestReading.voltage < 225 ? "Voltage dip observed" : "Voltage stable",
      message:
        latestReading.voltage < 225
          ? `Voltage is low at ${latestReading.voltage} V. Your line quality might be fluctuating.`
          : `Line voltage is stable near ${latestReading.voltage} V.`,
      createdAt: new Date(new Date(alertTime).getTime() - 60000).toISOString(),
    },
    {
      id: `${meterId}-billing`,
      severity: bill.finalPayableEstimate > 1000 ? "warning" : "info",
      title: "Estimated bill updated",
      message: `Estimated monthly bill updated based on current usage.`,
      createdAt: new Date(new Date(alertTime).getTime() - 120000).toISOString(),
    },
  ];
}

function getPaymentRows(meterId) {
  return paymentHistory.get(meterId) || [];
}

function savePaymentRow(meterId, row) {
  const rows = getPaymentRows(meterId);
  const nextRows = [row, ...rows.filter((item) => item.id !== row.id)].slice(0, 12);
  paymentHistory.set(meterId, nextRows);
  return nextRows;
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const meterId = String(body.meterId || "").trim();
    const password = String(body.password || "");

    if (!name || !email || !meterId || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!db) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const usersCollection = db.collection("users");
    const existingUser = await usersCollection.findOne({
      email: new RegExp(`^${escapeRegExp(email)}$`, "i"),
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      meterId,
      passwordHash,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);
    const storedUser = { ...user, _id: result.insertedId };
    const token = signToken(storedUser);

    return res.json({
      success: true,
      source: "database",
      token,
      user: sanitizeUser(storedUser),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const meterId = String(req.body?.meterId || "").trim();
    const password = String(req.body?.password || "");

    if (!db) {
      return res.status(503).json({ error: "Database connection not ready" });
    }

    const user = await db.collection("users").findOne({
      email: new RegExp(`^${escapeRegExp(email)}$`, "i"),
      meterId,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email or Meter ID" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      source: "database",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await getUserFromAuth(req.auth);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({
      source: "database",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Profile lookup error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/readings/latest", authenticateToken, async (req, res) => {
  try {
    const meterId = req.auth.meterId || DEFAULT_METER_ID;
    const snapshot = advanceSimulation(meterId);
    const latestReading = snapshot.latestReading;

    return res.json({
      source: "database",
      reading: latestReading,
      meter: buildDeviceStatus(meterId, latestReading),
    });
  } catch (error) {
    console.error("Latest reading error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/readings/history", authenticateToken, async (req, res) => {
  try {
    const meterId = req.auth.meterId || DEFAULT_METER_ID;
    const snapshot = advanceSimulation(meterId);

    return res.json({
      source: "database",
      readings: snapshot.history.slice(-24),
    });
  } catch (error) {
    console.error("Reading history error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/billing", authenticateToken, async (req, res) => {
  try {
    const meterId = req.auth.meterId || DEFAULT_METER_ID;
    const snapshot = advanceSimulation(meterId);
    const latestReading = snapshot.latestReading;
    const bill = calculateTelanganaLtIDomesticBill({
      meterId,
      monthlyUnits: latestReading.energyKWh,
      phaseType: latestReading.phaseType || "single",
      contractedLoad: latestReading.contractedLoad || 1,
      billingCycle: getBillingCycleLabel(new Date()),
      dueDate: getBillingDueDateLabel(new Date()),
    });

    return res.json({
      source: "database",
      bill,
    });
  } catch (error) {
    console.error("Billing error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const meterId = req.auth.meterId || DEFAULT_METER_ID;
    const snapshot = advanceSimulation(meterId);
    const latestReading = snapshot.latestReading;
    const bill = calculateTelanganaLtIDomesticBill({
      meterId,
      monthlyUnits: latestReading.energyKWh,
      phaseType: latestReading.phaseType || "single",
      contractedLoad: latestReading.contractedLoad || 1,
      billingCycle: getBillingCycleLabel(new Date()),
      dueDate: getBillingDueDateLabel(new Date()),
    });

    return res.json({
      source: "database",
      alerts: buildAlerts(meterId, latestReading, bill),
    });
  } catch (error) {
    console.error("Alerts error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments/create-order", authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    const meterId = String(body.meterId || req.auth.meterId || DEFAULT_METER_ID).trim();
    const amount = Number(body.amount || 0);
    const billMonth = String(body.billMonth || getBillingCycleLabel(new Date()));

    // Razorpay integration placeholder
    // Backend order creation will be connected here.
    const order = {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      amountRupees: amount,
      currency: "INR",
      receipt: `bill_${meterId}_${Date.now()}`,
      meterId,
      billMonth,
      status: "created",
      provider: "mock",
    };

    return res.json({
      source: "mock",
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (error) {
    console.error("Payment order error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments/verify", authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    const meterId = String(body.meterId || req.auth.meterId || DEFAULT_METER_ID).trim();
    const paidAt = new Date().toISOString();

    // Payment verification will be handled here.
    const payment = {
      id: body.paymentId || `pay_mock_${Date.now()}`,
      orderId: body.orderId || `order_mock_${Date.now()}`,
      paymentId: body.paymentId || `pay_mock_${Date.now()}`,
      meterId,
      billMonth: body.billMonth || getBillingCycleLabel(new Date()),
      amount: Number(body.amount || 0),
      currency: "INR",
      status: "successful",
      method: body.paymentMethod || "UPI",
      paidAt,
      receiptNumber: `SMR-${new Date(paidAt).getFullYear()}-${String(Date.now()).slice(-6)}`,
      provider: "mock",
    };

    savePaymentRow(meterId, payment);

    return res.json({
      source: "mock",
      payment,
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/payments/history", authenticateToken, async (req, res) => {
  try {
    const meterId = req.auth.meterId || DEFAULT_METER_ID;

    return res.json({
      source: "mock",
      payments: getPaymentRows(meterId),
    });
  } catch (error) {
    console.error("Payment history error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Smart Electricity Meter Backend Running");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
