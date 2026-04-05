# SmartClock Firmware Documentation Index

Complete guide to all available documentation and resources.

## Quick Navigation

### 🚀 Getting Started (Start Here!)
- **[QUICK_START.md](./QUICK_START.md)** - Installation in 3 steps
  - Hardware overview
  - Three flashing methods
  - First boot setup
  - Configuration guide
  - Troubleshooting basics

### 🔌 Hardware Setup
- **[HARDWARE_SETUP.md](./HARDWARE_SETUP.md)** - Complete wiring guide
  - Component overview
  - Pinout diagrams
  - Wiring connections
  - Step-by-step assembly
  - Connection troubleshooting
  - Safety guidelines

### 🛠️ Building Firmware
- **[BUILDING.md](./BUILDING.md)** - Compilation guide
  - Three build methods:
    - PlatformIO CLI (recommended)
    - Visual Studio Code
    - Arduino IDE
  - Build troubleshooting
  - Performance optimization
  - Custom configuration

### 📦 Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
  - Batch deployment (multiple devices)
  - OTA updates
  - Monitoring & logging
  - Security considerations
  - Deployment checklist

### 📄 Overview Documents
- **[README.md](./README.md)** - Project overview
  - Hardware specifications
  - Feature summary
  - API endpoints
  - Technical specs

## By User Type

### I'm a Beginner
1. Read [QUICK_START.md](./QUICK_START.md) - Overview
2. See [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) - Connect hardware
3. Use Web Flasher method from [QUICK_START.md](./QUICK_START.md)
4. Follow setup wizard on device

**Time needed**: 15-20 minutes

### I'm a Developer
1. Clone repository
2. Review [BUILDING.md](./BUILDING.md) - Pick your IDE
3. Follow build instructions for your platform
4. Use [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) for wiring
5. Modify [src/main.cpp](./esp32-smart-clock/src/main.cpp) as needed
6. Build and flash with your IDE

**Time needed**: 30 minutes (including learning curve)

### I'm Deploying Multiple Devices
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) - Batch deployment
2. Build firmware with [BUILDING.md](./BUILDING.md)
3. Create firmware package
4. Upload to dashboard
5. Distribute binary.bin to users
6. Users flash via Web Flasher

**Time needed**: 1-2 hours (first time setup)

### I'm Troubleshooting
1. Check [QUICK_START.md](./QUICK_START.md) - Common issues
2. See [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) - Connection problems
3. Review [BUILDING.md](./BUILDING.md) - Build errors
4. Check Serial Monitor output at 115200 baud
5. Open GitHub issue if still stuck

## Documentation Quick Reference

### Hardware & Connections
```
OLED I2C Setup:
  VCC → 3.3V
  GND → GND
  SDA → GPIO20
  SCL → GPIO21

Touch Sensor:
  VCC → 3.3V
  GND → GND
  I/O → GPIO1

See: HARDWARE_SETUP.md
```

### Installation Methods
```
Web Flasher:    No software needed (Chrome/Edge/Opera)
PlatformIO:     IDE + CLI for developers
Arduino IDE:    Simple graphical interface
esptool:        Command-line flashing
CLI batch:      Python scripts for production

See: BUILDING.md for detailed steps
```

### Common Commands

**Build firmware**:
```bash
cd esp32-smart-clock
pio run -e esp32c3
```

**Flash to device**:
```bash
pio run -e esp32c3 -t upload
```

**Monitor serial output**:
```bash
pio device monitor -b 115200
```

**Deploy to network**:
```bash
curl -X POST http://smartclock-c3.local/api/v1/firmware/ota \
  -F "file=@firmware.bin"
```

See: [DEPLOYMENT.md](./DEPLOYMENT.md) for batch operations

### API Reference

All endpoints accessible via `http://smartclock-c3.local/api/v1/`

```
GET  /device/status           - Device info
GET  /device/settings         - Current settings
POST /device/settings         - Update settings
GET  /firmware/latest         - Latest version info
POST /firmware/ota            - Trigger OTA update
POST /device/reboot           - Restart device
```

**Full documentation**: Visit `/docs` on device after setup

See: [README.md](./README.md) for complete API details

## File Structure

```
firmware/
├── README.md                      ← Project overview
├── INDEX.md                       ← This file
├── QUICK_START.md                 ← Installation guide
├── HARDWARE_SETUP.md              ← Wiring guide
├── BUILDING.md                    ← Build instructions
├── DEPLOYMENT.md                  ← Production guide
├── FLASHING.md                    ← Flashing methods
├── esp32-smart-clock/             ← Firmware source
│   ├── src/
│   │   └── main.cpp              ← Complete firmware code
│   ├── include/
│   │   └── wifi-manager.h        ← WiFi config header
│   └── platformio.ini            ← Build configuration
```

## Common Tasks

### Task: Install Firmware for First Time
**See**: [QUICK_START.md](./QUICK_START.md)
- **Easiest method**: Web Flasher
- **Developer method**: PlatformIO
- **Simplest method**: Arduino IDE

### Task: Connect Hardware
**See**: [HARDWARE_SETUP.md](./HARDWARE_SETUP.md)
- Wiring diagrams
- Step-by-step assembly
- Troubleshooting connections

### Task: Build from Source
**See**: [BUILDING.md](./BUILDING.md)
- PlatformIO CLI steps
- VS Code setup
- Arduino IDE guide

### Task: Modify Firmware
**Edit**: `esp32-smart-clock/src/main.cpp`
- Change device name (line ~17)
- Modify pin assignments (lines ~35-40)
- Customize default settings
- Add new features

### Task: Deploy to Multiple Devices
**See**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Batch flashing script
- Web distribution
- OTA update push

### Task: Configure WiFi
1. Device creates `SmartClock-Setup` AP on first boot
2. Connect to this WiFi (password: `setup123`)
3. Open browser to `http://192.168.4.1`
4. Select your WiFi network
5. Enter password
6. Submit and reboot

### Task: Access Web Dashboard
After WiFi setup:
- **Via mDNS**: `http://smartclock-c3.local`
- **Via IP**: Check OLED display for IP address
- **Username/Password**: None (public by default)

### Task: Update Firmware (OTA)
**On Device**:
1. Build new firmware locally
2. Open SmartClock dashboard
3. Go to OTA section
4. Upload firmware.bin file
5. Wait for completion and reboot

**Or via API**:
```bash
curl -X POST http://smartclock-c3.local/api/v1/firmware/ota \
  -F "file=@path/to/firmware.bin"
```

## Troubleshooting Guide

### Installation Issues
→ See [QUICK_START.md](./QUICK_START.md) - "Troubleshooting" section

### Hardware Connection Problems
→ See [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) - "Troubleshooting Connections"

### Build/Compilation Errors
→ See [BUILDING.md](./BUILDING.md) - "Troubleshooting Builds"

### WiFi Configuration Issues
→ See [QUICK_START.md](./QUICK_START.md) - "Configuration"

### Display Not Working
→ See [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) - "OLED Not Appearing"

### Touch Sensor Not Responding
→ See [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) - "Touch Sensor Not Working"

### OTA Updates Failing
→ See [DEPLOYMENT.md](./DEPLOYMENT.md) - "Troubleshooting Deployments"

### Serial Monitor Issues
→ Check baud rate is 115200
→ Verify device is running SmartClock firmware

## Resources

### Official Documentation
- **Espressif ESP32-C3**: https://docs.espressif.com/projects/esp-idf/
- **Arduino Framework**: https://github.com/espressif/arduino-esp32
- **PlatformIO Docs**: https://docs.platformio.org/

### Libraries Used
- **Adafruit GFX**: Graphics library for displays
- **Adafruit SSD1306**: OLED controller driver
- **AsyncTCP**: Asynchronous TCP networking
- **ESP Async WebServer**: Non-blocking web server
- **ArduinoOTA**: Over-the-air firmware updates
- **mDNS**: Device discovery on local network

### Community
- **GitHub Issues**: Report bugs and feature requests
- **Espressif Forums**: https://esp32.com/
- **Arduino Forums**: https://forum.arduino.cc/

## Version Information

**Current Version**: 2.0.0
- Real-time clock display
- WiFi connectivity with auto-AP
- OLED SSD1306 support
- Touch sensor on GPIO1
- REST API for control
- OTA firmware updates
- Web-based dashboard
- mDNS device discovery

**Hardware Target**: ESP32-C3 Super Mini
- Microcontroller: ESP32-C3 (RISC-V)
- Display: SSD1306 OLED 128x64
- Touch: GPIO1 capacitive sensor
- Power: USB-C 5V via regulator

## License

MIT License - See LICENSE file for details

## Support & Feedback

### Getting Help
1. Check relevant documentation file above
2. Review Serial Monitor logs
3. Check GitHub Issues for similar problems
4. Open new GitHub issue with:
   - Device type
   - Firmware version
   - Build method used
   - Serial Monitor output
   - Steps to reproduce

### Contributing
- Fork repository
- Make changes on feature branch
- Test thoroughly
- Submit pull request
- Provide clear description of changes

## Next Steps

**New to SmartClock?**
→ Start with [QUICK_START.md](./QUICK_START.md)

**Setting up hardware?**
→ Read [HARDWARE_SETUP.md](./HARDWARE_SETUP.md)

**Building from source?**
→ Follow [BUILDING.md](./BUILDING.md)

**Deploying at scale?**
→ See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Need specific help?**
→ Check "Troubleshooting Guide" section above

---

**Last Updated**: 2025-01-15
**Documentation Version**: 2.0.0
**Firmware Version**: 2.0.0

For the latest version, check GitHub releases.
