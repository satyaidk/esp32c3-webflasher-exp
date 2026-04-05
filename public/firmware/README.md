# SmartClock ESP32-C3 Super Mini Firmware

Complete, real-world firmware for ESP32-C3 Super Mini microcontroller with SSD1306 OLED display, WiFi connectivity, touch sensor input, and OTA updates.

## Hardware Overview

### Microcontroller
- **ESP32-C3 Super Mini**: Ultra-compact 32-bit RISC-V processor
- **WiFi**: 2.4GHz 802.11 b/g/n (single antenna)
- **Memory**: 4MB Flash, 384KB SRAM

### Peripherals
- **Display**: SSD1306 OLED (128x64 pixels, I2C interface)
- **Touch Sensor**: Capacitive touch on GPIO1
- **Power**: USB-C connector for power and programming

## Features

- **Real-time Clock Display**: 12/24-hour format with date
- **WiFi Connectivity**: Station mode with automatic AP fallback
- **WiFi Provisioning**: Web portal (no hardcoding credentials)
- **Over-the-air Updates**: Secure HTTP firmware updates
- **REST API**: Complete remote control and monitoring
- **Touch Input**: GPIO1 capacitive sensor for user interaction
- **mDNS Discovery**: Access via `smartclock-c3.local`
- **NTP Time Sync**: Automatic internet time synchronization
- **Persistent Storage**: NVS (Non-Volatile Storage) for settings
- **Web Dashboard**: Monitor and control from any browser

## Pin Configuration

### ESP32-C3 Super Mini Pinout

| Component | VCC/I/O | GND | Pin | Notes |
|-----------|---------|-----|-----|-------|
| **OLED SSD1306** | | | |
| | 3.3V | GND | VCC/GND | Power |
| | GPIO20 | | SDA | I2C Data |
| | GPIO21 | | SCL | I2C Clock |
| **Touch Sensor** | | | |
| | 3.3V | GND | VCC/GND | Power |
| | GPIO1 | | I/O | Touch Input |
| **USB Port** | 5V → Regulator | | | USB-C |

```
ESP32-C3 Super Mini Pinout:
    ┌─────────────────────────┐
    │  ★ USB-C (Top)          │
    ├─────────────────────────┤
    │ GND  RX  TX  IO9  IO8   │
    │ 5V   IO3 IO4 IO2  IO7   │
    │ EN   IO5 IO6 IO1  IO0   │
    │ GND  IO21 (SCL)         │
    │      IO20 (SDA)         │
    └─────────────────────────┘
```

## Directory Structure

```
firmware/
├── esp32-smart-clock/              # PlatformIO project
│   ├── src/
│   │   └── main.cpp                # Complete application (WiFi, API, Display, Touch)
│   ├── include/
│   │   └── wifi-manager.h          # WiFi configuration header
│   └── platformio.ini              # Build configuration for ESP32-C3
├── QUICK_START.md                  # Installation & usage guide
├── BUILDING.md                     # Detailed build instructions
├── FLASHING.md                     # Flashing methods & troubleshooting
└── README.md                       # This file
```

## Quick Start (3 Steps)

### 1. Get Firmware
- **Build from Source**: See [BUILDING.md](./BUILDING.md)
- **Download Pre-built**: See [Releases](../../releases)

### 2. Flash Device
Choose your method:
- **Web Flasher** (Easiest): Visit dashboard → Flasher page → Connect → Flash
- **PlatformIO CLI**: `pio run -e esp32c3 -t upload`
- **Arduino IDE**: Select ESP32C3 Dev Module → Upload

### 3. Configure WiFi
- Device creates AP: `SmartClock-Setup` / `setup123`
- Visit `http://192.168.4.1`
- Enter your WiFi credentials
- Device connects automatically

**Full guide**: See [QUICK_START.md](./QUICK_START.md)

## Building

### Option 1: PlatformIO CLI (Recommended)
```bash
cd esp32-smart-clock
pio run -e esp32c3           # Build
pio run -e esp32c3 -t upload # Build & Flash
pio device monitor           # View serial output
```

### Option 2: Visual Studio Code
- Install PlatformIO extension
- Open folder → Select `esp32c3` environment
- Click Build icon → Upload icon

### Option 3: Arduino IDE
- Install ESP32 boards + libraries
- Tools → Board: ESP32C3 Dev Module
- Select COM port and upload speed (460800)
- Sketch → Upload

See [BUILDING.md](./BUILDING.md) for detailed instructions.

## API Endpoints

All endpoints accessible via `http://smartclock-c3.local/api/v1/` or direct IP.

### Device Status
```
GET /api/v1/device/status
Returns: Chip ID, firmware version, MAC, WiFi RSSI, uptime, memory, connection status
```

### Device Settings
```
GET /api/v1/device/settings
Returns: Current brightness, theme, time format

POST /api/v1/device/settings
Body: {"brightness": 0-100, "theme": "auto|light|dark", "timeFormat": "12h|24h"}
Returns: Updated settings confirmation
```

### Firmware Management
```
GET /api/v1/firmware/latest
Returns: Latest firmware version, download URL, changelog, file size

POST /api/v1/firmware/ota
Triggers over-the-air update process
```

### Device Control
```
POST /api/v1/device/reboot
Reboots the device (responds before reboot)
```

## OLED Display Output

The display shows real-time information with automatic refresh:

```
╔════════════════════╗
║ 14:30:45           │  ← Current time (12/24h format)
║ Wed Jan 15         │  ← Date (auto-updated)
║ WiFi: OK           │  ← Connection status
║ Brightness: 75%    │  ← Current brightness level
║ Theme: auto        │  ← Active theme
╚════════════════════╝
```

## Touch Sensor

- **GPIO1**: Detects capacitive touch
- **Action**: Display inverts briefly as tactile feedback
- **Use Cases**: Theme switching, brightness adjustment, wake from sleep
- **Debounce**: 200ms hardware debounce built-in

## WiFi Setup Portal

If device cannot connect to saved WiFi:

1. **AP Mode Active**: Creates hotspot `SmartClock-Setup`
2. **Connect**: Use password `setup123`
3. **Portal**: Visit `http://192.168.4.1` on mobile/computer
4. **Configure**: 
   - Select your WiFi network
   - Enter password
   - Submit
5. **Auto-Connect**: Device stores credentials and connects on next boot

## Settings Persistence

All settings stored in ESP32-C3 NVS (Non-Volatile Storage):
- Brightness level (0-100)
- Theme preference (auto/light/dark)
- Time format (12h/24h)
- WiFi SSID & password
- Device name

Settings survive device resets and power cycles.

## OTA (Over-The-Air) Updates

### Web Dashboard
1. Build new firmware: `pio run -e esp32c3`
2. Locate: `firmware/.pio/build/esp32c3/firmware.bin`
3. Open SmartClock dashboard → OTA section
4. Upload `.bin` file
5. Device reboots with new firmware

### Command Line
```bash
curl -X POST http://smartclock-c3.local/api/v1/firmware/ota \
  -F "file=@firmware.bin"
```

## Troubleshooting

### Connection Issues
- **"Device not detected"** → Check USB-C cable, try different port
- **"WiFi won't connect"** → Verify SSID/password in setup portal
- **"mDNS not working"** → Ensure device has valid IP, check network

### Display Issues
- **"OLED blank"** → Verify SDA (GPIO20) and SCL (GPIO21) connections
- **"I2C error"** → Check pull-up resistors, try I2C address 0x3C
- **"Display glitches"** → Verify stable power supply to display

### Firmware Issues
- **"Flash fails"** → Use factory reset before flashing (BUTTON_IO9 + RESET)
- **"Upload timeout"** → Reduce speed to 230400, check cable quality
- **"Boot loop"** → Serial monitor shows details, check logs

See [FLASHING.md](./FLASHING.md) for detailed troubleshooting.

## Serial Monitor Output

Monitor at **115200 baud** to see detailed logs:

```
=================================
  SmartClock ESP32-C3 Firmware
  Version: 2.0.0
=================================
Setting up WiFi...
Connecting to WiFi: MyNetwork
WiFi connected: 192.168.1.100
Web server started on port 80
mDNS: Access device at http://smartclock-c3.local
OLED display initialized successfully
Touch sensor initialized on GPIO1

=== Startup Complete ===
Device: SmartClock-C3
IP Address: 192.168.1.100
Brightness: 70%
Theme: auto
Time Format: 24h
```

## Technical Specifications

| Specification | Value |
|---------------|-------|
| Microcontroller | ESP32-C3 (RISC-V) |
| Clock Speed | 160 MHz (configurable to 80 MHz) |
| Flash Memory | 4 MB (QIO mode) |
| SRAM | 384 KB |
| Display | SSD1306 OLED 128x64 |
| Display Interface | I2C (400 kHz) |
| Touch Input | GPIO1 (capacitive) |
| Power Supply | USB 5V (internal regulator) |
| WiFi Standard | 802.11 b/g/n @ 2.4 GHz |
| OTA Max Firmware Size | ~1.5 MB |

## Support & Resources

- **Quick Start**: See [QUICK_START.md](./QUICK_START.md)
- **Building**: See [BUILDING.md](./BUILDING.md)
- **Flashing**: See [FLASHING.md](./FLASHING.md)
- **GitHub Issues**: Report bugs and request features
- **API Reference**: Visit `/docs` on device web interface

## License

MIT License - See LICENSE.md for details

## Next Steps

1. **Build**: Follow [BUILDING.md](./BUILDING.md) to compile firmware
2. **Flash**: Use [QUICK_START.md](./QUICK_START.md) to install
3. **Configure**: Set WiFi credentials via setup portal
4. **Monitor**: Check Serial Monitor for logs
5. **Enjoy**: Access dashboard at `http://smartclock-c3.local`
