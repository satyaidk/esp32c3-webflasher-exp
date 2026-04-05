/**
 * WiFi Manager Header
 * Handles WiFi connectivity and configuration portal
 */

#pragma once

#include <WiFi.h>
#include <Preferences.h>

class WiFiManager {
private:
  Preferences &preferences;
  const char *ap_ssid = "SmartClock-Setup";
  const char *ap_password = "setup123";
  int max_connect_attempts = 20;
  int connect_timeout = 500; // ms

public:
  WiFiManager(Preferences &prefs) : preferences(prefs) {}

  /**
   * Initialize WiFi and attempt to connect to saved network
   * If connection fails, creates AP hotspot for configuration
   */
  void begin() {
    String stored_ssid = preferences.getString("wifi_ssid", "");
    String stored_password = preferences.getString("wifi_password", "");

    if (stored_ssid.length() > 0) {
      connectToWiFi(stored_ssid.c_str(), stored_password.c_str());
    }

    // If not connected, start AP mode
    if (WiFi.status() != WL_CONNECTED) {
      startAPMode();
    }
  }

  /**
   * Connect to WiFi network
   */
  bool connectToWiFi(const char *ssid, const char *password) {
    Serial.printf("Connecting to WiFi: %s\n", ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < max_connect_attempts) {
      delay(connect_timeout);
      Serial.print(".");
      attempts++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf("Connected! IP: %s\n", WiFi.localIP().toString().c_str());
      // Save credentials
      preferences.putString("wifi_ssid", ssid);
      preferences.putString("wifi_password", password);
      return true;
    }

    Serial.println("Failed to connect to WiFi");
    return false;
  }

  /**
   * Start Access Point mode for configuration
   */
  void startAPMode() {
    Serial.println("Starting WiFi AP mode for configuration");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password);
    Serial.printf("AP SSID: %s\n", ap_ssid);
    Serial.printf("AP Password: %s\n", ap_password);
    Serial.printf("Configure at: http://%s\n", WiFi.softAPIP().toString().c_str());
  }

  /**
   * Check if connected to WiFi
   */
  bool isConnected() {
    return WiFi.status() == WL_CONNECTED;
  }

  /**
   * Get WiFi signal strength
   */
  int getRSSI() {
    return WiFi.RSSI();
  }

  /**
   * Get device MAC address
   */
  String getMACAddress() {
    return WiFi.macAddress();
  }

  /**
   * Clear saved WiFi credentials
   */
  void clearCredentials() {
    preferences.remove("wifi_ssid");
    preferences.remove("wifi_password");
  }
};
