# SmartClock ESP32-C3 Super Mini - Quick Start Guide

## Overview
This firmware runs on the **ESP32-C3 Super Mini** microcontroller and provides:
- Real-time clock display on SSD1306 OLED (128x64)
- WiFi connectivity for OTA updates
- Touch sensor input on GPIO1
- REST API for remote configuration
- Web-based firmware flashing

## Hardware Setup

### Required Components
- ESP32-C3 Super Mini
- SSD1306 OLED Display (128x64)
- Touch Sensor Module (or push button)
- USB-C Cable

### Pin Connections

**OLED Display (I2C)**
```
OLED VCC  → ESP32-C3 3.3V
OLED GND  → ESP32-C3 GND
OLED SDA  → ESP32-C3 GPIO20
OLED SCL  → ESP32-C3 GPIO21
```

**Touch Sensor**
```
Touch VCC → ESP32-C3 3.3V
Touch GND → ESP32-C3 GND
Touch I/O → ESP32-C3 GPIO1
```

## Installation Methods

### Method 1: Web Flasher (Easiest - No Installation Required)

1. Go to the SmartClock dashboard
2. Navigate to the **Flasher** page
3. Download the pre-built firmware from the **Releases** page
4. Connect your ESP32-C3 via USB-C
5. Click **Connect Device**
6. Select the firmware file (.bin)
7. Click **Start Flashing**

**Requirements:** Chrome, Edge, or Opera browser (WebSerial support)

### Method 2: Using PlatformIO CLI (Recommended for Development)

#### Prerequisites
- Visual Studio Code with PlatformIO extension
- Python 3.6+
- USB-C cable

#### Steps
```bash
# 1. Navigate to firmware directory
cd public/firmware/esp32-smart-clock

# 2. Install dependencies (automatic with PlatformIO)
pio run -e esp32c3

# 3. Connect ESP32-C3 via USB-C
# Update platform.ini if COM port is different (Windows: COM3, Linux: /dev/ttyUSB0)

# 4. Flash the firmware
pio run -e esp32c3 -t upload

# 5. Monitor serial output
pio device monitor
```

### Method 3: Using Arduino IDE

1. Install ESP32 Board Support:
   - File → Preferences
   - Add to Additional Board Manager URLs:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Tools → Board Manager → Search "ESP32" → Install

2. Select Board:
   - Tools → Board → ESP32 Arduino → ESP32C3 Dev Module
   - Tools → Port → Select your COM port
   - Tools → Upload Speed → 460800

3. Install Libraries:
   - Sketch → Include Library → Manage Libraries
   - Install: Adafruit SSD1306, Adafruit GFX Library

4. Open and Upload:
   - File → Open → `src/main.cpp`
   - Sketch → Upload (or Ctrl+U)

## First Boot

After flashing successfully:

1. **Device will show startup message** on OLED
2. **WiFi Setup Mode**:
   - If no WiFi credentials saved, ESP32-C3 creates AP: `SmartClock-Setup`
   - Password: `setup123`
   - Visit: `http://192.168.4.1` to configure WiFi
3. **Connected Mode**:
   - Once WiFi is connected, OLED shows time
   - Access via: `http://smartclock-c3.local`
   - mDNS name: `smartclock-c3.local`

## Features

### Display Output
```
12:34:56        (Time in 12/24h format)
Mon Jan 15      (Date)
WiFi: OK        (Connection status)
Brightness: 70% (Current setting)
Theme: auto     (UI Theme)
```

### Touch Sensor
- GPIO1 detects touch/button press
- Display inverts briefly as feedback
- Can be used for theme switching or brightness control

### REST API Endpoints
All accessible via:
- Direct: `http://<device-ip>/api/v1/...`
- mDNS: `http://smartclock-c3.local/api/v1/...`

```
GET  /api/v1/device/status        - Device info & metrics
GET  /api/v1/device/settings      - Current settings
POST /api/v1/device/settings      - Update settings
GET  /api/v1/firmware/latest      - Latest firmware info
POST /api/v1/firmware/ota         - Trigger OTA update
POST /api/v1/device/reboot        - Reboot device
```

## Configuration

### WiFi Setup Portal
1. Connect to `SmartClock-Setup` WiFi
2. Open browser to `http://192.168.4.1`
3. Select your WiFi network
4. Enter password
5. Device automatically connects on next restart

### Settings via API
```bash
# Set brightness
curl -X POST http://smartclock-c3.local/api/v1/device/settings \
  -H "Content-Type: application/json" \
  -d '{"brightness": 80, "theme": "dark", "timeFormat": "24h"}'

# Get current settings
curl http://smartclock-c3.local/api/v1/device/settings

# Reboot device
curl -X POST http://smartclock-c3.local/api/v1/device/reboot
```

## Troubleshooting

### Device not detected
- Check USB-C cable is properly connected
- Try different USB port
- Install CH340 drivers if using older ESP32 boards
- Restart browser if using Web Flasher

### Firmware won't flash
- **Error: "Device not detected"** - Reconnect USB cable, select correct COM port
- **Error: "Upload timeout"** - Reduce upload speed in settings, check cable quality
- **Error: "Verification failed"** - Use factory reset script before flashing

### Display not showing
- Check SDA/SCL connections (GPIO20/GPIO21)
- Verify OLED I2C address is 0x3C
- Check pull-up resistors on I2C lines
- Restart device

### WiFi connection issues
- Move closer to router
- Check WiFi credentials in setup portal
- Restart device
- Check Serial Monitor for detailed error messages

### Touch sensor not working
- Verify GPIO1 connection
- Check if pin is not shorted to GND
- Try calibrating: long press to reset

## Building from Source

### Prerequisites
```bash
# Install Python tools
pip install platformio

# Or use VS Code PlatformIO extension
```

### Build Steps
```bash
cd public/firmware/esp32-smart-clock

# Clean build
pio run -e esp32c3 -t clean
pio run -e esp32c3

# Upload
pio run -e esp32c3 -t upload

# Monitor
pio device monitor -e esp32c3
```

### Custom Configuration
Edit `include/config.h` to customize:
- Device name
- Default WiFi credentials
- Pin assignments
- Display refresh rate

## Serial Debugging

Connect via Serial Monitor to see detailed logs:

**PlatformIO:**
```bash
pio device monitor -b 115200
```

**Arduino IDE:**
- Tools → Serial Monitor → 115200 baud

**Common Log Messages:**
```
SmartClock ESP32-C3 Firmware
Version: 2.0.0
OLED display initialized successfully
Setting up WiFi...
Connecting to WiFi: MyNetwork
WiFi connected: 192.168.1.100
Web server started on port 80
mDNS: Access device at http://smartclock-c3.local
```

## OTA Updates

### Via Web Dashboard
1. Build new firmware: `pio run -e esp32c3`
2. Located at: `firmware/.pio/build/esp32c3/firmware.bin`
3. Upload via dashboard OTA section

### Via Arduino IDE
- Sketch → Upload Using Programmer (over network)

### Via API
```bash
curl -X POST http://smartclock-c3.local/api/v1/firmware/ota \
  -F "file=@path/to/firmware.bin"
```

## Support & Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See `README.md` and `BUILDING.md`
- **API Docs**: Visit `/docs` endpoint on device
- **Serial Logs**: Check Serial Monitor for detailed output

## Safety & Best Practices

⚠️ **Important:**
- Do NOT disconnect USB during flashing
- Do NOT exceed 3.3V on GPIO pins
- Use proper USB cable (power + data)
- Check connections before powering on
- Avoid touching components while powered

## Next Steps

1. **Flash the firmware** using one of the methods above
2. **Connect to WiFi** via setup portal
3. **Access the dashboard** at `http://smartclock-c3.local`
4. **Configure settings** for brightness, theme, time format
5. **Enjoy your smart clock!**
