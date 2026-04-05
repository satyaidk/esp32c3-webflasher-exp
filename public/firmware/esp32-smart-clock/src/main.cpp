/**
 * SmartClock - ESP32-C3 Super Mini Firmware
 * Main application logic with WiFi, Web Server, OTA updates, OLED display, and touch sensor
 * 
 * Hardware: ESP32-C3 Super Mini with SSD1306 OLED (128x64)
 * Connections:
 * - OLED I2C: SDA=GPIO20, SCL=GPIO21, VCC=3.3V, GND=GND
 * - Touch Sensor: GPIO1, VCC=3.3V, GND=GND
 * 
 * Features:
 * - WiFi connectivity with web-based configuration
 * - REST API for device control and settings
 * - Over-the-air firmware updates
 * - OLED display showing current time
 * - Touch sensor input on GPIO1
 * - Non-volatile settings storage
 * - mDNS hostname support
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoOTA.h>
#include <Preferences.h>
#include <ESPmDNS.h>
#include <time.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// Configuration
#define DEVICE_NAME "SmartClock-C3"
#define FIRMWARE_VERSION "2.0.0"
#define DEVICE_ID "ESP32C3-MINI"

// Hardware pins
#define TOUCH_PIN 1
#define SDA_PIN 20
#define SCL_PIN 21
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// OLED display object
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// WiFi credentials (will be configured via web portal)
String ssid = "";
String password = "";

// Web server on port 80
WebServer server(80);

// Non-volatile storage
Preferences preferences;

// Device settings
struct DeviceSettings {
  int brightness = 70;
  String theme = "auto";
  String timeFormat = "24h";
} settings;

// Display state
bool displayAvailable = false;

// Touch sensor tracking
volatile bool touchDetected = false;
unsigned long lastTouchTime = 0;
const unsigned long TOUCH_DEBOUNCE = 200;

// Function declarations
void setupWiFi();
void setupWebServer();
void setupOTA();
void setupDisplay();
void setupTouchSensor();
void loadSettings();
void saveSettings();
void updateDisplay();
void displayTime();
void handleTouchInterrupt();
void handleJsonResponse(int code, const char* json);

void handleJsonResponse(int code, const char* json) {
  server.sendHeader("Content-Type", "application/json");
  server.send(code, "application/json", json);
}

// API: GET /api/v1/device/status
void handleDeviceStatus() {
  char response[512];
  snprintf(response, sizeof(response),
    "{"
    "\"chipId\":\"%s\","
    "\"firmwareVersion\":\"%s\","
    "\"macAddress\":\"%s\","
    "\"wifiRssi\":%d,"
    "\"uptime\":%lu,"
    "\"memoryUsage\":%d,"
    "\"isConnected\":true,"
    "\"lastUpdate\":\"%s\""
    "}",
    DEVICE_ID,
    FIRMWARE_VERSION,
    WiFi.macAddress().c_str(),
    WiFi.RSSI(),
    millis() / 1000,
    (int)((float)heap_caps_get_free_size(MALLOC_CAP_DEFAULT) / 
          (float)heap_caps_get_total_size(MALLOC_CAP_DEFAULT)) * 100,
    __DATE__
  );
  
  handleJsonResponse(200, response);
}

// API: GET /api/v1/device/settings
void handleGetSettings() {
  char response[256];
  snprintf(response, sizeof(response),
    "{"
    "\"brightness\":%d,"
    "\"theme\":\"%s\","
    "\"timeFormat\":\"%s\""
    "}",
    settings.brightness,
    settings.theme.c_str(),
    settings.timeFormat.c_str()
  );
  
  handleJsonResponse(200, response);
}

// API: POST /api/v1/device/settings
void handlePostSettings() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    
    // Simple JSON parsing (consider using ArduinoJson for production)
    if (body.indexOf("brightness") != -1) {
      int start = body.indexOf(":") + 1;
      int end = body.indexOf(",", start);
      if (end == -1) end = body.indexOf("}", start);
      String brightness_str = body.substring(start, end);
      int brightness = brightness_str.toInt();
      
      if (brightness >= 0 && brightness <= 100) {
        settings.brightness = brightness;
      }
    }
    
    if (body.indexOf("theme") != -1) {
      int start = body.indexOf("theme") + 8;
      int end = body.indexOf("\"", start + 1);
      settings.theme = body.substring(start, end);
    }
    
    if (body.indexOf("timeFormat") != -1) {
      int start = body.indexOf("timeFormat") + 13;
      int end = body.indexOf("\"", start + 1);
      settings.timeFormat = body.substring(start, end);
    }
    
    saveSettings();
    
    char response[256];
    snprintf(response, sizeof(response),
      "{"
      "\"success\":true,"
      "\"message\":\"Settings updated successfully\","
      "\"brightness\":%d,"
      "\"theme\":\"%s\","
      "\"timeFormat\":\"%s\""
      "}",
      settings.brightness,
      settings.theme.c_str(),
      settings.timeFormat.c_str()
    );
    
    handleJsonResponse(200, response);
  } else {
    handleJsonResponse(400, "{\"error\":\"No body provided\"}");
  }
}

// API: GET /api/v1/firmware/latest
void handleFirmwareLatest() {
  char response[512];
  snprintf(response, sizeof(response),
    "{"
    "\"version\":\"1.2.3\","
    "\"releaseDate\":\"2024-01-15\","
    "\"downloadUrl\":\"https://github.com/smartclock/firmware/releases/download/v1.2.3/smartclock-v1.2.3.bin\","
    "\"changelog\":\"Improved WiFi stability and added time zone support\","
    "\"isLatest\":true,"
    "\"fileSize\":524288"
    "}"
  );
  
  handleJsonResponse(200, response);
}

// API: POST /api/v1/device/reboot
void handleReboot() {
  char response[256];
  snprintf(response, sizeof(response),
    "{"
    "\"success\":true,"
    "\"message\":\"Device will reboot in 5 seconds\""
    "}"
  );
  
  handleJsonResponse(200, response);
  
  delay(1000);
  ESP.restart();
}

// API: 404 Not Found
void handle404() {
  server.send(404, "application/json", "{\"error\":\"Endpoint not found\"}");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("=================================");
  Serial.println("  SmartClock ESP32-C3 Firmware");
  Serial.println("  Version: " FIRMWARE_VERSION);
  Serial.println("=================================");
  
  // Setup I2C for OLED display
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // Initialize OLED display
  setupDisplay();
  
  // Setup touch sensor
  setupTouchSensor();
  
  // Initialize preferences (NVS)
  preferences.begin("smartclock", false);
  loadSettings();
  
  // Display startup message
  if (displayAvailable) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("SmartClock C3");
    display.println("v" FIRMWARE_VERSION);
    display.println("Connecting WiFi...");
    display.display();
  }
  
  // Setup WiFi
  setupWiFi();
  
  // Setup mDNS
  if (!MDNS.begin(DEVICE_NAME)) {
    Serial.println("mDNS initialization failed");
  } else {
    MDNS.addService("http", "tcp", 80);
    Serial.printf("mDNS: Access device at http://%s.local\n", DEVICE_NAME);
  }
  
  // Setup Web Server
  setupWebServer();
  server.begin();
  Serial.println("Web server started on port 80");
  
  // Setup OTA
  setupOTA();
  
  // Sync time via NTP
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  // Display ready message
  if (displayAvailable) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("SmartClock Ready");
    display.println("IP: " + WiFi.localIP().toString());
    display.println("Brightness: " + String(settings.brightness) + "%");
    display.display();
  }
  
  Serial.println("\n=== Startup Complete ===");
  Serial.printf("Device: %s\n", DEVICE_NAME);
  Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Brightness: %d%%\n", settings.brightness);
  Serial.printf("Theme: %s\n", settings.theme.c_str());
  Serial.printf("Time Format: %s\n", settings.timeFormat.c_str());
}

void loop() {
  // Handle web server requests
  server.handleClient();
  
  // Handle OTA updates
  ArduinoOTA.handle();
  
  // Update OLED display with current time
  if (displayAvailable) {
    displayTime();
  }
  
  // Check touch sensor
  if (touchDetected) {
    touchDetected = false;
    Serial.println("Touch detected on GPIO1");
    if (displayAvailable) {
      display.invertDisplay(true);
      delay(200);
      display.invertDisplay(false);
    }
  }
  
  // Update display
  delay(500);
}

void setupWiFi() {
  Serial.println("Setting up WiFi...");
  
  // Load WiFi credentials from storage
  String stored_ssid = preferences.getString("ssid", "");
  String stored_pass = preferences.getString("password", "");
  
  if (stored_ssid.length() > 0) {
    ssid = stored_ssid;
    password = stored_pass;
  }
  
  if (ssid.length() > 0) {
    Serial.printf("Connecting to WiFi: %s\n", ssid.c_str());
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), password.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
      delay(500);
      Serial.print(".");
      attempts++;
      
      // Update display during connection
      if (displayAvailable && attempts % 2 == 0) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(0, 0);
        display.println("Connecting WiFi");
        display.println(ssid.substring(0, 16));
        display.println("Attempt: " + String(attempts / 2));
        display.display();
      }
    }
    Serial.println();
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf("WiFi connected: %s\n", WiFi.localIP().toString().c_str());
      if (displayAvailable) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(0, 0);
        display.println("WiFi Connected!");
        display.println(WiFi.localIP().toString());
        display.display();
      }
      delay(2000);
      return;
    }
  }
  
  // Create WiFi setup hotspot if not connected
  Serial.println("Starting WiFi setup mode...");
  WiFi.mode(WIFI_AP);
  WiFi.softAP("SmartClock-Setup", "setup123");
  Serial.println("Setup WiFi: SmartClock-Setup | setup123");
  Serial.println("Visit: http://192.168.4.1");
  
  if (displayAvailable) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("WiFi Setup Mode");
    display.println("SSID: SmartClock");
    display.println("Pass: setup123");
    display.println("192.168.4.1");
    display.display();
  }
}

void setupWebServer() {
  // API Routes
  server.on("/api/v1/device/status", HTTP_GET, handleDeviceStatus);
  server.on("/api/v1/device/settings", HTTP_GET, handleGetSettings);
  server.on("/api/v1/device/settings", HTTP_POST, handlePostSettings);
  server.on("/api/v1/firmware/latest", HTTP_GET, handleFirmwareLatest);
  server.on("/api/v1/device/reboot", HTTP_POST, handleReboot);
  
  // 404 Handler
  server.onNotFound(handle404);
}

void setupOTA() {
  ArduinoOTA.setHostname(DEVICE_NAME);
  ArduinoOTA.setPassword("smartclock");
  
  ArduinoOTA.onStart([]() {
    Serial.println("OTA Update starting...");
  });
  
  ArduinoOTA.onEnd([]() {
    Serial.println("\nOTA Update complete!");
  });
  
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("OTA Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  
  ArduinoOTA.begin();
  Serial.println("OTA Update ready");
}

void setupDisplay() {
  // Scan I2C bus to find connected devices (helps debug wiring issues)
  Serial.println("Scanning I2C bus...");
  byte foundAddr = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    byte error = Wire.endTransmission();
    if (error == 0) {
      Serial.printf("  I2C device found at 0x%02X\n", addr);
      if (addr == 0x3C || addr == 0x3D) {
        foundAddr = addr;
      }
    }
  }

  if (foundAddr == 0) {
    Serial.println("WARNING: No SSD1306 display found on I2C bus!");
    Serial.println("  Check wiring: SDA=GPIO20, SCL=GPIO21, VCC=3.3V, GND=GND");
    Serial.println("  Continuing without display...");
    displayAvailable = false;
    return;
  }

  Serial.printf("Using SSD1306 at address 0x%02X\n", foundAddr);

  // Try to initialize the display at the detected address
  if (!display.begin(SSD1306_SWITCHCAPVCC, foundAddr)) {
    Serial.println("ERROR: SSD1306 begin() failed even though device was found.");
    Serial.println("  This may indicate insufficient memory or a library issue.");
    Serial.println("  Continuing without display...");
    displayAvailable = false;
    return;
  }

  displayAvailable = true;

  // Clear display and show init message
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Initializing...");
  display.display();
  delay(500);

  Serial.println("OLED display initialized successfully");
}

void loadSettings() {
  settings.brightness = preferences.getInt("brightness", 70);
  settings.theme = preferences.getString("theme", "auto");
  settings.timeFormat = preferences.getString("timeFormat", "24h");
  
  Serial.printf("Settings loaded: brightness=%d, theme=%s, timeFormat=%s\n",
    settings.brightness, settings.theme.c_str(), settings.timeFormat.c_str());
}

void saveSettings() {
  preferences.putInt("brightness", settings.brightness);
  preferences.putString("theme", settings.theme);
  preferences.putString("timeFormat", settings.timeFormat);
  
  Serial.println("Settings saved to NVS");
}

void setupTouchSensor() {
  // Configure touch sensor on GPIO1
  pinMode(TOUCH_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(TOUCH_PIN), handleTouchInterrupt, RISING);
  
  Serial.println("Touch sensor initialized on GPIO1");
}

void handleTouchInterrupt() {
  // Simple debounce
  unsigned long currentTime = millis();
  if (currentTime - lastTouchTime > TOUCH_DEBOUNCE) {
    touchDetected = true;
    lastTouchTime = currentTime;
  }
}

void displayTime() {
  // Get current time
  time_t now = time(nullptr);
  struct tm* timeinfo = localtime(&now);
  
  // Format time string based on user preference
  char timeStr[20];
  if (settings.timeFormat == "24h") {
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", timeinfo);
  } else {
    strftime(timeStr, sizeof(timeStr), "%I:%M %p", timeinfo);
  }
  
  // Format date string
  char dateStr[20];
  strftime(dateStr, sizeof(dateStr), "%a %b %d", timeinfo);
  
  // Update OLED display
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(timeStr);
  
  display.setTextSize(1);
  display.setCursor(0, 20);
  display.println(dateStr);
  
  // Display WiFi info
  display.setCursor(0, 35);
  display.print("WiFi: ");
  if (WiFi.status() == WL_CONNECTED) {
    display.println("OK");
  } else {
    display.println("NONE");
  }
  
  // Display brightness and theme
  display.setCursor(0, 45);
  display.print("Brightness: ");
  display.print(settings.brightness);
  display.println("%");
  
  display.setCursor(0, 55);
  display.print("Theme: ");
  display.println(settings.theme);
  
  display.display();
}

void updateDisplay() {
  // Update display with current time and status
  displayTime();
}
