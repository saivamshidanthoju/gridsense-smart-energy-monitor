#include <WiFi.h>
#include <HTTPClient.h>
#include <string.h>

const char* ssid = "Siri 2";
const char* password = "19786072";

const char* backendHost = "192.168.0.125";
const uint16_t backendPort = 5000;
const char* backendPath = "/api/esp32/data";

// Optional. Keep empty unless ESP32_API_KEY is set in backend/.env.
const char* deviceApiKey = "";

// Sensor Pins
const int voltagePin = 34;   // ZMPT101B
const int currentPin = 35;   // ACS712

float totalEnergy = 0.0;
unsigned long previousMillis = 0;

String backendUrl() {
  return "http://" + String(backendHost) + ":" + String(backendPort) + String(backendPath);
}

void printNetworkDetails() {
  Serial.println("WiFi Connected");
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("Subnet: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("Backend URL: ");
  Serial.println(backendUrl());
}

bool canReachBackend() {
  WiFiClient probe;
  probe.setTimeout(5000);

  Serial.print("TCP check to backend: ");
  Serial.print(backendHost);
  Serial.print(":");
  Serial.println(backendPort);

  if (!probe.connect(backendHost, backendPort)) {
    Serial.println("TCP check failed. Check PC IP, firewall, Express bind host, and WiFi network.");
    return false;
  }

  probe.stop();
  Serial.println("TCP check passed");
  return true;
}

String buildPayload(float voltage, float current, float power, float energyKWh) {
  String payload = "{";
  payload += "\"meterId\":\"SC-104829375\",";
  payload += "\"deviceIp\":\"" + WiFi.localIP().toString() + "\",";
  payload += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  payload += "\"voltage\":" + String(voltage, 2) + ",";
  payload += "\"current\":" + String(current, 3) + ",";
  payload += "\"power\":" + String(power, 2) + ",";
  payload += "\"energyKWh\":" + String(energyKWh, 3);
  payload += "}";
  return payload;
}

void sendReading(float voltage, float current, float power, float energyKWh) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.reconnect();
    return;
  }

  if (!canReachBackend()) {
    return;
  }

  WiFiClient client;
  HTTPClient http;

  http.setTimeout(8000);
  http.begin(client, backendUrl());
  http.addHeader("Content-Type", "application/json");

  if (strlen(deviceApiKey) > 0) {
    http.addHeader("x-device-key", deviceApiKey);
  }

  String payload = buildPayload(voltage, current, power, energyKWh);
  int responseCode = http.POST(payload);

  Serial.print("Response Code: ");
  Serial.println(responseCode);

  if (responseCode > 0) {
    Serial.print("Response Body: ");
    Serial.println(http.getString());
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(responseCode));
  }

  Serial.println(payload);
  http.end();
}

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  printNetworkDetails();

  previousMillis = millis();
}

void loop() {

  // Read ADC values
  int voltageADC = analogRead(voltagePin);
  int currentADC = analogRead(currentPin);

  // Temporary conversion formulas
  float voltage = (voltageADC / 4095.0) * 250.0;
  float current = (currentADC / 4095.0) * 10.0;

  float power = voltage * current;

  // Energy calculation
  unsigned long currentMillis = millis();
  float hours =
      (currentMillis - previousMillis)
      / 3600000.0;

  totalEnergy += (power / 1000.0) * hours;

  previousMillis = currentMillis;

  Serial.println("------------");
  Serial.print("Voltage: ");
  Serial.println(voltage);

  Serial.print("Current: ");
  Serial.println(current);

  Serial.print("Power: ");
  Serial.println(power);

  Serial.print("Energy: ");
  Serial.println(totalEnergy);

  sendReading(voltage, current, power, totalEnergy);

  delay(5000);
}
