const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const os = require("os");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  calculateTelanganaLtIDomesticBill,
  getBillingCycleLabel,
  getBillingDueDateLabel,
} = require("./telanganaTariff");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";
const DEFAULT_METER_ID = "SC-104829375";
const READINGS_COLLECTION = "readings";
const DEVICE_API_KEY = process.env.ESP32_API_KEY || "";

let db;
let client;
const paymentHistory = new Map();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${
        Date.now() - startedAt
      }ms from ${req.ip}`,
    );
  });

  next();
});

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "smart_energy";

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in backend/.env");
  }

  client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  db = client.db(dbName);

  await db.command({ ping: 1 });
  await db.collection(READINGS_COLLECTION).createIndex({ meterId: 1, timestamp: -1 });
  await db.collection(READINGS_COLLECTION).createIndex({ timestamp: -1 });

  console.log(`MongoDB Atlas connected. Database: ${dbName}, collection: ${READINGS_COLLECTION}`);
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

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.socket?.remoteAddress || req.ip || "unknown";
}

function getLanAddresses() {
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, addresses = []]) =>
      addresses
        .filter((address) => address.family === "IPv4" && !address.internal)
        .map((address) => ({
          name,
          address: address.address,
        })),
    );
}

function logStartupUrls() {
  console.log(`Server listening on http://${HOST}:${PORT}`);
  console.log(`ESP32 POST route: http://<THIS_PC_WIFI_IP>:${PORT}/api/esp32/data`);
  console.log(`Health check: http://<THIS_PC_WIFI_IP>:${PORT}/api/health`);

  getLanAddresses().forEach((item) => {
    console.log(`LAN candidate (${item.name}): http://${item.address}:${PORT}`);
  });
}

function getReadingsCollection() {
  if (!db) {
    const error = new Error("Database connection is not ready");
    error.statusCode = 503;
    throw error;
  }

  return db.collection(READINGS_COLLECTION);
}

function getOptionalAuth(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function normalizeMeterIdValue(value = "") {
  return String(value || "").trim();
}

function resolveReadingMeterId(req) {
  return normalizeMeterIdValue(req.query?.meterId || getOptionalAuth(req)?.meterId || "");
}

function resolveProtectedMeterId(req) {
  return normalizeMeterIdValue(req.query?.meterId || DEFAULT_METER_ID);
}

function getMeterIdCandidates(preferredMeterId = "") {
  return [...new Set([normalizeMeterIdValue(preferredMeterId), DEFAULT_METER_ID].filter(Boolean))];
}

function parseFiniteNumber(body, fieldNames) {
  for (const fieldName of fieldNames) {
    const rawValue = body?.[fieldName];

    if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
      const numericValue = Number(rawValue);

      if (Number.isFinite(numericValue)) {
        return numericValue;
      }
    }
  }

  const error = new Error(`${fieldNames[0]} must be a finite number`);
  error.statusCode = 400;
  throw error;
}

function normalizeEsp32Reading(body = {}) {
  const meterId = String(body.meterId || DEFAULT_METER_ID).trim();

  if (!meterId) {
    const error = new Error("meterId is required");
    error.statusCode = 400;
    throw error;
  }

  const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();

  if (Number.isNaN(timestamp.getTime())) {
    const error = new Error("timestamp must be a valid date when provided");
    error.statusCode = 400;
    throw error;
  }

  const reading = {
    meterId,
    voltage: Number(parseFiniteNumber(body, ["voltage"]).toFixed(2)),
    current: Number(parseFiniteNumber(body, ["current"]).toFixed(3)),
    power: Number(parseFiniteNumber(body, ["power"]).toFixed(2)),
    energyKWh: Number(
      parseFiniteNumber(body, ["energyKWh", "energykWh", "energy", "kWh"]).toFixed(3),
    ),
    timestamp,
  };

  const deviceIp = String(body.deviceIp || body.ipAddress || "").trim();
  const rssi = Number(body.rssi);

  if (deviceIp) {
    reading.deviceIp = deviceIp;
  }

  if (Number.isFinite(rssi)) {
    reading.rssi = rssi;
  }

  return reading;
}

function formatReadingForResponse(reading) {
  const timestamp = reading?.timestamp instanceof Date ? reading.timestamp : new Date(reading?.timestamp);

  return {
    meterId: reading.meterId,
    voltage: Number(reading.voltage),
    current: Number(reading.current),
    power: Number(reading.power),
    energyKWh: Number(reading.energyKWh),
    timestamp: Number.isNaN(timestamp.getTime()) ? reading.timestamp : timestamp.toISOString(),
  };
}

async function findLatestReading(meterId) {
  const filter = meterId ? { meterId } : {};

  return getReadingsCollection()
    .find(filter)
    .sort({
      timestamp: -1,
    })
    .limit(1)
    .next();
}

async function findReadingHistory(meterId, limit = 20) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 200));
  const filter = meterId ? { meterId } : {};
  const readings = await getReadingsCollection()
    .find(filter)
    .sort({
      timestamp: -1,
    })
    .limit(safeLimit)
    .toArray();

  return readings.reverse();
}

async function getLatestReadingForMeter(meterId) {
  const requestedMeterId = normalizeMeterIdValue(meterId);
  const candidates = getMeterIdCandidates(requestedMeterId);

  for (const candidateMeterId of candidates) {
    const latestReading = await findLatestReading(candidateMeterId);

    if (latestReading) {
      return {
        requestedMeterId,
        meterId: latestReading.meterId || candidateMeterId,
        latestReading,
        fallbackUsed: Boolean(requestedMeterId && candidateMeterId !== requestedMeterId),
      };
    }
  }

  const latestReading = await findLatestReading();

  if (latestReading) {
    return {
      requestedMeterId,
      meterId: latestReading.meterId || requestedMeterId || DEFAULT_METER_ID,
      latestReading,
      fallbackUsed: Boolean(requestedMeterId && latestReading.meterId !== requestedMeterId),
    };
  }

  const error = new Error(
    requestedMeterId ? `No readings found for meterId ${requestedMeterId}` : "No readings found",
  );
  error.statusCode = 404;
  throw error;
}

async function findReadingHistoryForMeter(meterId, limit = 20) {
  const requestedMeterId = normalizeMeterIdValue(meterId);
  const candidates = getMeterIdCandidates(requestedMeterId);

  for (const candidateMeterId of candidates) {
    const readings = await findReadingHistory(candidateMeterId, limit);

    if (readings.length) {
      return {
        requestedMeterId,
        meterId: candidateMeterId,
        readings,
        fallbackUsed: Boolean(requestedMeterId && candidateMeterId !== requestedMeterId),
      };
    }
  }

  const latestReading = await findLatestReading();

  if (latestReading?.meterId && !candidates.includes(latestReading.meterId)) {
    const readings = await findReadingHistory(latestReading.meterId, limit);

    if (readings.length) {
      return {
        requestedMeterId,
        meterId: latestReading.meterId,
        readings,
        fallbackUsed: Boolean(requestedMeterId && latestReading.meterId !== requestedMeterId),
      };
    }
  }

  return {
    requestedMeterId,
    meterId: requestedMeterId || null,
    readings: [],
    fallbackUsed: false,
  };
}

function requireDeviceApiKey(req, res, next) {
  if (!DEVICE_API_KEY) {
    return next();
  }

  const providedKey = req.get("x-device-key") || "";

  if (providedKey !== DEVICE_API_KEY) {
    console.warn(`[ESP32] Rejected upload from ${getClientIp(req)} because x-device-key was invalid`);
    return res.status(401).json({
      success: false,
      error: "Invalid device API key",
    });
  }

  return next();
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

app.get("/api/readings/latest", async (req, res) => {
  try {
    const { latestReading, requestedMeterId, fallbackUsed } = await getLatestReadingForMeter(
      resolveReadingMeterId(req),
    );
    const formattedReading = formatReadingForResponse(latestReading);

    return res.json({
      source: "database",
      ...formattedReading,
      reading: formattedReading,
      latestReading: formattedReading,
      requestedMeterId: requestedMeterId || null,
      fallbackUsed,
    });
  } catch (error) {
    console.error("Latest Reading Error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
});

app.get("/api/readings/history", async (req, res) => {
  try {
    const { readings, meterId, requestedMeterId, fallbackUsed } = await findReadingHistoryForMeter(
      resolveReadingMeterId(req),
      req.query.limit,
    );

    return res.json({
      source: "database",
      storage: "mongodb",
      collection: READINGS_COLLECTION,
      meterId: meterId || null,
      requestedMeterId: requestedMeterId || null,
      fallbackUsed,
      readings: readings.map(formatReadingForResponse),
    });
  } catch (error) {
    console.error("History Error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
});

app.get("/api/billing", authenticateToken, async (req, res) => {
  try {
    const { meterId, latestReading, requestedMeterId, fallbackUsed } = await getLatestReadingForMeter(
      resolveProtectedMeterId(req),
    );
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
      meterId,
      requestedMeterId: requestedMeterId || null,
      fallbackUsed,
      bill,
    });
  } catch (error) {
    console.error("Billing error:", error.message);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const { meterId, latestReading, requestedMeterId, fallbackUsed } = await getLatestReadingForMeter(
      resolveProtectedMeterId(req),
    );
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
      meterId,
      requestedMeterId: requestedMeterId || null,
      fallbackUsed,
      alerts: buildAlerts(meterId, latestReading, bill),
    });
  } catch (error) {
    console.error("Alerts error:", error.message);
    return res.status(error.statusCode || 500).json({ error: error.message });
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

app.get("/api/health", async (req, res) => {
  try {
    await db.command({ ping: 1 });

    return res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      host: HOST,
      port: PORT,
      database: process.env.DB_NAME || "smart_energy",
      readingsCollection: READINGS_COLLECTION,
      mongoConnected: true,
      routes: {
        esp32Data: "POST /api/esp32/data",
        latestReading: "GET /api/readings/latest",
        readingHistory: "GET /api/readings/history",
      },
      lanUrls: getLanAddresses().map((item) => ({
        interface: item.name,
        url: `http://${item.address}:${PORT}`,
      })),
    });
  } catch (error) {
    console.error("Health Check Error:", error);
    return res.status(503).json({
      status: "degraded",
      mongoConnected: false,
      error: error.message,
    });
  }
});

app.get("/api/esp32/ping", (req, res) => {
  return res.json({
    success: true,
    message: "ESP32 route is reachable",
    serverTime: new Date().toISOString(),
    clientIp: getClientIp(req),
  });
});

app.post("/api/esp32/data", requireDeviceApiKey, async (req, res) => {
  try {
    console.log("ESP32 DATA RECEIVED");
    console.log(req.body);
    console.log(`[ESP32] Remote IP: ${getClientIp(req)}`);

    const reading = normalizeEsp32Reading(req.body || {});
    const result = await getReadingsCollection().insertOne(reading);

    console.log(
      `[ESP32] Stored reading ${result.insertedId.toString()} in ${READINGS_COLLECTION} for ${reading.meterId}`,
    );

    return res.status(201).json({
      success: true,
      message: "Reading stored successfully",
      insertedId: result.insertedId,
      collection: READINGS_COLLECTION,
      reading,
    });
  } catch (error) {
    console.error("ESP32 Upload Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
    hint:
      req.method === "POST"
        ? "For ESP32 uploads, use POST /api/esp32/data with Content-Type: application/json"
        : "Use GET /api/health to verify the backend is reachable",
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    console.error("Invalid JSON Body:", error.message);
    return res.status(400).json({
      success: false,
      error: "Invalid JSON body",
    });
  }

  console.error("Unhandled Server Error:", error);
  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal server error",
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      logStartupUrls();
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
