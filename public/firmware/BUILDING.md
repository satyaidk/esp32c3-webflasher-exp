# Building SmartClock Firmware for ESP32-C3 Super Mini

Complete guide to building and compiling SmartClock firmware specifically for the ESP32-C3 Super Mini microcontroller with SSD1306 OLED display.

## Prerequisites

### Hardware Required
- **ESP32-C3 Super Mini** microcontroller
- **SSD1306 OLED Display** (128x64, I2C)
- **Touch Sensor Module** (GPIO1 input)
- **USB-C Cable** (for power and programming)

### Software Options

#### Option 1: PlatformIO CLI (Recommended for Power Users)
- Python 3.7 or higher
- Visual Studio Code (optional but recommended)
- `pip install platformio`

#### Option 2: Visual Studio Code + PlatformIO Extension (Easiest)
- Visual Studio Code
- PlatformIO extension (search "platformio" in extensions)
- Automatic Python and toolchain installation

#### Option 3: Arduino IDE (Simplest Setup)
- Arduino IDE 2.0 or higher
- ESP32 Board Package
- Adafruit GFX and SSD1306 libraries

## Building with PlatformIO CLI

### Step 1: Install PlatformIO

```bash
# Install via pip
pip install platformio

# Verify installation
pio --version
```

### Step 2: Navigate to Project

```bash
# From this repository root
cd public/firmware/esp32-smart-clock

# Check structure
ls -la
# Should see: src/, include/, platformio.ini
```

### Step 3: Build Firmware

```bash
# Build for ESP32-C3
pio run -e esp32c3

# Build with verbose output (useful for debugging)
pio run -e esp32c3 -v

# Clean build (remove old artifacts)
pio run -e esp32c3 -t clean
pio run -e esp32c3
```

Build output:
```
Building .pioenvs/esp32c3/firmware.bin
[========================================] 100%
Environment Status
────────────────── ─────────
esp32c3            SUCCEEDED
RAM:   [==        ] 35.2% (used 116432 bytes from 330752 bytes)
Flash: [====      ] 38.7% (used 402848 bytes from 1040384 bytes)
```

### Step 4: Connect ESP32-C3

1. Plug USB-C cable into ESP32-C3 Super Mini
2. Check connection: `pio device list`
3. Note the port (Windows: COM3, Linux: /dev/ttyUSB0, macOS: /dev/cu.usbserial-*)

### Step 5: Upload Firmware

```bash
# Build and upload to ESP32-C3
pio run -e esp32c3 -t upload

# If port not detected, specify manually
pio run -e esp32c3 -t upload --upload-port COM3

# Watch progress
# Should see "Leaving... Hard resetting..." when complete
```

### Step 6: Monitor Serial Output

```bash
# View device logs in real-time
pio device monitor -b 115200

# Monitor with filtering
pio device monitor -b 115200 | grep "WiFi"

# Exit monitor: Ctrl+C
```

Expected output:
```
=================================
  SmartClock ESP32-C3 Firmware
  Version: 2.0.0
=================================
OLED display initialized successfully
Setting up WiFi...
WiFi Setup Mode
SmartClock-Setup / setup123
192.168.4.1
```

## Building with Visual Studio Code + PlatformIO

### Step 1: Install VS Code & PlatformIO

1. Download [Visual Studio Code](https://code.visualstudio.com)
2. Open VS Code
3. Click Extensions (left sidebar)
4. Search "PlatformIO"
5. Install "PlatformIO IDE for VSCode"
6. Wait for automatic setup (may take 2-3 minutes)

### Step 2: Open Project

1. File → Open Folder
2. Navigate to `public/firmware/esp32-smart-clock`
3. Click "Select Folder"

### Step 3: Select Environment

1. Click the PlatformIO icon (alien head) in left sidebar
2. Find "esp32c3" environment in the project tree
3. Hover and click the checkmark to activate

### Step 4: Build & Upload

1. **Build**: Click the checkmark icon (Build) at bottom status bar
   - Watch "TERMINAL" tab for progress
   - Should complete with "Succeeded"

2. **Upload**: 
   - Connect USB-C cable
   - Click → icon (Upload) at bottom
   - Watch progress bar

3. **Monitor**: 
   - Click the plug icon (Serial Monitor) at bottom
   - Select baudrate: 115200
   - Watch real-time output

## Building with Arduino IDE

### Step 1: Install ESP32 Support

1. Open Arduino IDE
2. File → Preferences
3. Under "Additional Boards Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager
5. Search "ESP32"
6. Install "esp32 by Espressif Systems" (latest version)
7. Wait for installation to complete

### Step 2: Install Required Libraries

1. Tools → Manage Libraries
2. Install each (search and click Install):
   - **Adafruit GFX Library** - Graphics support
   - **Adafruit SSD1306** - OLED display driver
   - **AsyncTCP** - Async networking
   - **ESP Async WebServer** - Web server framework

### Step 3: Configure Board

1. Connect ESP32-C3 via USB-C
2. Tools menu configuration:
   ```
   Board:              "ESP32C3 Dev Module"
   Flash Frequency:    "80 MHz"
   CPU Frequency:      "160 MHz"
   Flash Size:         "4MB (32Mb)"
   Flash Mode:         "DIO"
   Partition Scheme:   "Default 4MB with spiffs"
   Upload Speed:       "460800"
   Port:               "COM3" (or your port)
   ```

### Step 4: Load & Flash Firmware

1. File → Open
2. Navigate to: `public/firmware/esp32-smart-clock/src/main.cpp`
3. Click Sketch → Verify (to compile)
4. Click Sketch → Upload (to flash)
5. Wait for "Leaving... Hard resetting via RTS pin"

### Step 5: View Logs

1. Tools → Serial Monitor
2. Set speed to **115200** (bottom-right dropdown)
3. Watch real-time output

## Build Output Explained

### Successful Compilation
```
Building .pioenvs/esp32c3/firmware.bin
[========================================] 100%
Environment Status
────────────────── ─────────
esp32c3            SUCCEEDED
RAM:   [==        ] 35.2% (used 116432 bytes from 330752 bytes)
Flash: [====      ] 38.7% (used 402848 bytes from 1040384 bytes)
```

**Interpreting Results:**
- `SUCCEEDED` = Build completed, ready to flash
- RAM usage ~35% = Good, plenty of memory available
- Flash usage ~38% = Good, room for OTA updates
- If Flash > 50%, consider removing optional features

### Build Artifacts

After successful build, files appear in `.pio/build/esp32c3/`:

| File | Purpose | Use Case |
|------|---------|----------|
| `firmware.bin` | Main firmware binary | Use for flashing |
| `firmware.elf` | Executable file | For debugging/analysis |
| `firmware.map` | Memory layout | Optimize size |
| `bootloader.bin` | Bootloader | Factory reset only |

## Troubleshooting Builds

### Compilation Errors

**Error: "undefined reference to 'Wire.begin'"**
```
Solution: Ensure Wire.h is included and I2C libraries are in platformio.ini
```

**Error: "Adafruit_SSD1306.h: No such file"**
```
Solution: Run: pio lib install "Adafruit SSD1306"
```

**Error: "Too many sections"**
```
Solution: Firmware too large. In platformio.ini, add:
build_flags = -O3 -flto
```

### Upload Problems

**"Failed to connect to serial port COM3"**
1. Disconnect USB cable
2. Wait 2 seconds
3. Reconnect USB cable
4. Check Device Manager (Windows) or `ls /dev/ttyUSB*` (Linux)

**"Device not found" (WebSerial/esptool.js)**
1. Try different USB port
2. Install USB-C drivers for ESP32-C3
3. Update browser (Chrome/Edge/Opera required)

**"Timeout waiting for packet"**
1. Lower upload speed: Edit platformio.ini
   ```ini
   upload_speed = 230400
   ```
2. Try different USB cable (power + data)
3. Disconnect other USB devices

**"Invalid head of packet"**
1. Disconnect/reconnect USB cable
2. Press RESET button on ESP32-C3
3. Try again immediately

## Customizing Firmware

Edit `src/main.cpp` to modify:

### Device Name
```cpp
#define DEVICE_NAME "SmartClock-C3"      // Line ~17
```

### Display Pins
```cpp
#define SDA_PIN 20      // I2C Data (GPIO20)
#define SCL_PIN 21      // I2C Clock (GPIO21)
```

### Touch Sensor Pin
```cpp
#define TOUCH_PIN 1     // Touch input (GPIO1)
```

### Default Settings
```cpp
struct DeviceSettings {
  int brightness = 70;       // 0-100%
  String theme = "auto";     // "light", "dark", "auto"
  String timeFormat = "24h";  // "12h" or "24h"
} settings;
```

### WiFi Setup AP
```cpp
// In setupWiFi() function, change:
WiFi.softAP("SmartClock-Setup", "setup123");  // SSID and password
```

## Optimization Tips

### Reduce Build Size
```bash
# Enable compiler optimizations
pio run -e esp32c3 -O3

# Check size breakdown
pio run -e esp32c3 --target size
```

### Faster Builds
```bash
# Skip dependency checks
pio run -e esp32c3 --no-deps

# Use parallel jobs
pio run -e esp32c3 -j 4
```

### Debug Builds
```bash
# Enable verbose output
pio run -e esp32c3 -vvv

# Generate disassembly
pio run -e esp32c3 --target disasm
```

## After Build: Next Steps

### 1. Test Locally
```bash
# Monitor serial output to verify
pio device monitor -b 115200
```

Expected messages:
```
SmartClock ESP32-C3 Firmware v2.0.0
OLED display initialized successfully
Setting up WiFi...
```

### 2. Flash New Devices
```bash
# Firmware location for flashing
.pio/build/esp32c3/firmware.bin

# Use this file in Web Flasher or manual flash tools
```

### 3. Setup Device
1. Connect to `SmartClock-Setup` WiFi (password: `setup123`)
2. Visit `http://192.168.4.1`
3. Select your WiFi network
4. Device auto-connects on reboot

### 4. Configure Dashboard
- Access: `http://smartclock-c3.local`
- Set brightness, theme, time format
- Enable OTA updates

## Performance Notes

### Typical Build Time
- **First Build**: 30-45 seconds (downloads toolchain)
- **Incremental Build**: 3-5 seconds (only changed files)
- **Clean Build**: 8-12 seconds

### Memory Usage
- **SRAM Used**: ~35% (116 KB / 330 KB available)
- **Flash Used**: ~38% (402 KB / 1040 KB partition)
- **OTA Capable**: Yes, ~600 KB available for updates

### Runtime Performance
- **WiFi Connect**: ~3-5 seconds
- **Display Update**: 50 ms (every 500ms in loop)
- **API Response**: <50 ms typical
- **OTA Flash Speed**: ~20 KB/s

## Support & Resources

- **Quick Start**: See [QUICK_START.md](./QUICK_START.md)
- **Flashing Help**: See [FLASHING.md](./FLASHING.md)
- **GitHub Issues**: Report build problems
- **Serial Monitor**: Check logs for detailed errors
- **Community**: Forum at espressif.com
