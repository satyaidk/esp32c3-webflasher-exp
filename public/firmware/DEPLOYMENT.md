# SmartClock Deployment Guide

Complete guide to deploying SmartClock firmware across devices.

## Quick Deployment Paths

### Path 1: Single Device (Developer)
```
Build → Flash via USB → Configure WiFi → Done
Time: 5-10 minutes
Requirements: USB-C cable only
```

### Path 2: Production (Web Flasher)
```
Build → Upload to web → Distribute binary → Users flash via browser
Time: <2 minutes per device (after setup)
Requirements: Chrome/Edge browser, USB-C cable
```

### Path 3: Batch Deployment (Multiple Devices)
```
Build → Create firmware package → Parallel flash via esptool
Time: 30 seconds per device
Requirements: Python + esptool, USB hubs
```

## Build & Release Process

### Step 1: Build Firmware

```bash
cd public/firmware/esp32-smart-clock

# Clean build
pio run -e esp32c3 -t clean

# Build
pio run -e esp32c3

# Verify success
ls -la .pio/build/esp32c3/firmware.bin
```

Output file:
```
.pio/build/esp32c3/firmware.bin  (~402 KB)
```

### Step 2: Test Firmware

Flash to test device:
```bash
pio run -e esp32c3 -t upload

# Monitor startup
pio device monitor -b 115200
```

Expected output:
```
SmartClock ESP32-C3 Firmware
Version: 2.0.0
OLED display initialized successfully
Setting up WiFi...
Starting WiFi setup mode...
```

### Step 3: Package for Distribution

Create release archive:
```bash
# Directory structure
firmware/
├── firmware.bin                  (402 KB)
├── QUICK_START.md               (Instructions)
├── HARDWARE_SETUP.md            (Wiring guide)
└── README.md                    (Overview)

# Create zip
zip -r smartclock-v2.0.0.zip firmware.bin *.md
```

### Step 4: Upload to Web Dashboard

1. Navigate to SmartClock dashboard
2. Go to **Releases** section
3. Upload `smartclock-v2.0.0.zip`
4. Mark as "Latest" release
5. Share firmware.bin link publicly

## User Deployment Options

### Option A: Web Flasher (Recommended for Users)

**Requirements**:
- Chrome, Edge, or Opera browser
- USB-C cable
- ESP32-C3 device

**Steps**:
1. Visit SmartClock dashboard
2. Click **Flasher** section
3. Download `firmware.bin` from releases
4. Connect ESP32-C3 via USB-C
5. Click **Connect Device**
6. Select downloaded `firmware.bin`
7. Click **Start Flashing**
8. Wait for success message

**Advantages**:
- No software installation required
- Browser-based, cross-platform
- Clear UI with progress tracking
- Works on Windows/Mac/Linux

**Browser Support**:
- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox (no WebSerial yet)
- ❌ Safari (no WebSerial)

### Option B: PlatformIO (For Developers)

**Requirements**:
- Visual Studio Code + PlatformIO
- Python 3.7+
- USB-C cable

**Steps**:
```bash
# 1. Get source
git clone <repo>
cd public/firmware/esp32-smart-clock

# 2. Build
pio run -e esp32c3

# 3. Flash
pio run -e esp32c3 -t upload

# 4. Monitor
pio device monitor -b 115200
```

**Advantages**:
- Full development environment
- Source code control
- Custom modifications possible
- Build optimization options

### Option C: Arduino IDE (Simplest)

**Requirements**:
- Arduino IDE 2.0+
- ESP32 board package
- USB-C cable

**Steps**:
1. Install board: Tools → Board Manager → ESP32
2. Install libraries: Adafruit SSD1306, AsyncTCP, ESP Async WebServer
3. Open `src/main.cpp`
4. Select board: ESP32C3 Dev Module
5. Click Upload (Ctrl+U)
6. View Serial Monitor for logs

**Advantages**:
- Familiar IDE
- Minimal setup
- Beginner-friendly

### Option D: Command Line (esptool)

**Requirements**:
- Python 3.6+
- esptool: `pip install esptool`
- USB-C cable

**Steps**:
```bash
# Find device
esptool.py chip_id

# Flash firmware
esptool.py --chip esp32c3 --port COM3 write_flash 0x0 firmware.bin

# Monitor (separate terminal)
python -m serial.tools.miniterm COM3 115200
```

**Advantages**:
- No IDE overhead
- Fast flashing
- Batch processing capable
- CI/CD integration

## Post-Deployment Configuration

### First Boot Setup

**Device will**:
1. Initialize OLED display
2. Start WiFi setup mode
3. Create AP: `SmartClock-Setup` (password: `setup123`)

### WiFi Configuration Portal

1. **Connect to AP**
   - SSID: `SmartClock-Setup`
   - Password: `setup123`

2. **Access Portal**
   - Open browser
   - Navigate to: `http://192.168.4.1`

3. **Configure WiFi**
   - Select your WiFi network
   - Enter WiFi password
   - Click Submit

4. **Auto Connect**
   - Device reboots
   - Connects to configured WiFi
   - Shows IP on OLED display

### Access Web Dashboard

After WiFi connection:

**Via mDNS** (Recommended):
```
http://smartclock-c3.local
```

**Via Direct IP** (Alternative):
```
http://192.168.1.100  (example, check OLED display)
```

**Dashboard Features**:
- Device status and metrics
- Real-time settings control
- Brightness adjustment
- Theme selection
- WiFi management
- OTA update interface
- API documentation

## Batch Deployment (Multiple Devices)

### Prepare Devices

```bash
# 1. Create deploy directory
mkdir smartclock-deploy
cd smartclock-deploy

# 2. Copy firmware
cp ../public/firmware/esp32-smart-clock/.pio/build/esp32c3/firmware.bin .

# 3. Create flash script (flash-all.sh)
```

### Flash Script (Linux/Mac)

```bash
#!/bin/bash
# flash-all.sh

PORT=$1
if [ -z "$PORT" ]; then
  echo "Usage: $0 /dev/ttyUSB0"
  exit 1
fi

echo "Flashing SmartClock to $PORT..."
esptool.py --chip esp32c3 --port $PORT \
  --baud 460800 write_flash 0x0 firmware.bin

echo "Done! Waiting for reboot..."
sleep 5

echo "Monitoring output..."
python -m serial.tools.miniterm $PORT 115200
```

### Flash Script (Windows PowerShell)

```powershell
# flash-all.ps1

param([string]$Port = "COM3")

Write-Host "Flashing SmartClock to $Port..."
esptool.py --chip esp32c3 --port $Port `
  --baud 460800 write_flash 0x0 firmware.bin

Write-Host "Done!"
Write-Host "Configure WiFi at 192.168.4.1"
```

### Multi-Device Flashing

**Setup**:
1. Connect devices via USB hub (one at a time)
2. Each gets its own COM port
3. Run flash script for each port

**Process**:
```bash
# Device 1
./flash-all.sh /dev/ttyUSB0

# Device 2 (after first device boots)
./flash-all.sh /dev/ttyUSB1

# Continue for all devices...
```

## OTA Updates (After Initial Deployment)

### Via Dashboard

1. **Build new firmware**
   ```bash
   pio run -e esp32c3
   ```

2. **Upload to devices**
   - Open dashboard
   - Go to OTA section
   - Select new `firmware.bin`
   - Click **Update**
   - Wait for reboot

3. **Verify update**
   - Device reboots
   - New version shown on OLED
   - Dashboard shows updated version

### Via REST API

```bash
# Single device update
curl -X POST http://smartclock-c3.local/api/v1/firmware/ota \
  -F "file=@firmware.bin"

# Response:
# {"success": true, "message": "Update successful, rebooting..."}
```

### Batch OTA Updates

```bash
# Update all devices on network
for device in smartclock-c3 smartclock-c3-2 smartclock-c3-3; do
  echo "Updating $device..."
  curl -X POST http://$device.local/api/v1/firmware/ota \
    -F "file=@firmware.bin" \
    --max-time 30
done
```

## Monitoring & Logging

### Serial Monitor

Monitor each device during deployment:

```bash
# View real-time logs
pio device monitor -b 115200

# Expected successful boot sequence:
# SmartClock ESP32-C3 Firmware v2.0.0
# OLED display initialized successfully
# Setting up WiFi...
# WiFi Setup Mode
# SmartClock-Setup / setup123
# 192.168.4.1
```

### Dashboard Monitoring

Access web interface to check:
- Device status (online/offline)
- Uptime and memory usage
- WiFi signal strength
- Firmware version
- Last update timestamp

### Remote Logging

Devices can log to cloud:
- **Serial over HTTP**: View logs via dashboard
- **Syslog**: Send logs to external server
- **CloudWatch**: AWS integration (enterprise)

## Troubleshooting Deployments

### Flashing Failures

**"Device not found"**
- Check USB cable (data + power required)
- Try different port
- Restart device (RESET button)
- Update browser/drivers

**"Timeout during upload"**
- Lower baud rate in platformio.ini
- Check cable quality
- Try shorter cable
- Disconnect other USB devices

### WiFi Configuration Issues

**Cannot connect to setup AP**
- Device is in station mode, needs reboot
- Hold RESET button 5 seconds
- Try connecting again

**Cannot reach 192.168.4.1**
- Device's IP may be different, check OLED
- Try connecting via actual IP address
- Check WiFi password (case-sensitive)

### Dashboard Access Issues

**"Cannot reach smartclock-c3.local"**
- Device may not be on network
- Check router's device list
- Try direct IP instead (shown on OLED)
- Restart device and wait 30 seconds

**"Connection refused"**
- Web server may not have started
- Check Serial Monitor for startup errors
- Power cycle device
- Reflash firmware if issue persists

## Security Considerations

### Initial Setup
- Change AP password if distributing code
- Document setup process for end users
- Test with multiple networks before deployment

### OTA Updates
- Verify firmware signatures (optional)
- Keep device on same network during update
- Don't disconnect power during OTA process
- Have rollback plan for failed updates

### API Security
- All APIs currently public (no authentication)
- Deploy behind firewall if needed
- Use HTTPS reverse proxy in production
- Implement API key validation if required

## Performance Metrics

### Flash Time
- **Web Flasher**: 30-60 seconds (browser dependent)
- **esptool**: 10-20 seconds
- **PlatformIO**: 15-25 seconds
- **Arduino IDE**: 20-35 seconds

### Boot Time
- **First boot**: ~5 seconds (WiFi setup mode)
- **Configured boot**: ~3 seconds
- **OTA update**: ~30-45 seconds total
- **Resume after OTA**: ~2 seconds

### Memory Usage
- **Flash used**: 402 KB / 1040 KB
- **Free OTA space**: 638 KB (for updates)
- **SRAM used**: 116 KB / 330 KB
- **Heap available**: ~200 KB at runtime

## Deployment Checklist

- [ ] Source code tested locally
- [ ] Firmware builds successfully
- [ ] Test device flashes without errors
- [ ] OLED display shows content
- [ ] Touch sensor responds
- [ ] WiFi setup portal works
- [ ] WiFi connects successfully
- [ ] Dashboard accessible via mDNS
- [ ] All APIs respond correctly
- [ ] Serial monitor shows no errors
- [ ] Device survives restart/power cycle
- [ ] OTA update works
- [ ] Documentation is current
- [ ] Release tagged in git
- [ ] Binary packaged for distribution
- [ ] Web flasher has new firmware
- [ ] Users can download and flash

## Support Resources

- **Build Issues**: See [BUILDING.md](./BUILDING.md)
- **Hardware Setup**: See [HARDWARE_SETUP.md](./HARDWARE_SETUP.md)
- **Quick Start**: See [QUICK_START.md](./QUICK_START.md)
- **Serial Debugging**: Check Serial Monitor at 115200 baud
- **API Reference**: Visit device `/docs` endpoint
- **GitHub Issues**: Report deployment problems

## Rollback Procedure

If deployed firmware has critical issues:

1. **Identify issue** via Serial Monitor
2. **Fix source code** (src/main.cpp)
3. **Rebuild firmware** (pio run -e esp32c3)
4. **Re-flash devices** via Web Flasher or esptool
5. **Monitor Serial Monitor** during boot
6. **Document issue** for future prevention

---

**Deployment Verification**:
✅ Firmware builds successfully
✅ Test flash succeeds
✅ Device boots without errors
✅ Display shows content
✅ WiFi configures easily
✅ Dashboard accessible
✅ Ready for production!
