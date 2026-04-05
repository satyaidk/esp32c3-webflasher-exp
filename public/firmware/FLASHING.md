# Flashing SmartClock Firmware

Complete guide to flashing SmartClock firmware to your ESP32 device.

## Methods

There are several ways to flash firmware to your ESP32:

1. **Web Flasher** (Easiest - Recommended)
2. **esptool.py** (CLI, cross-platform)
3. **Arduino IDE** (GUI)
4. **PlatformIO** (IDE/CLI)

## Method 1: Web Flasher (Recommended)

The easiest way to flash firmware directly from your browser.

### Requirements
- Chrome, Edge, or Opera browser (WebUSB support required)
- USB cable connected to your ESP32
- SmartClock website: https://smartclock.local/flasher

### Steps

1. **Connect Device**
   - Plug your ESP32 into your computer via USB
   - Ensure the USB-UART bridge drivers are installed

2. **Navigate to Flasher**
   - Open https://smartclock.local/flasher in your browser
   - Click **Connect Device**
   - Browser will prompt you to select the device
   - Select your ESP32 device from the list

3. **Select Firmware**
   - Click **Select Firmware File**
   - Choose the `.bin` file you want to flash
   - File size will display

4. **Start Flashing**
   - Click **Start Flashing**
   - Progress bar shows flashing status
   - Device will reboot automatically when complete

5. **Verify**
   - Check browser console for success message
   - Device should boot with new firmware

## Method 2: esptool.py (Most Compatible)

Terminal-based flashing tool that works on Windows, Mac, and Linux.

### Installation

```bash
pip install esptool
```

### Basic Usage

```bash
# Flash firmware to default address (0x1000)
esptool.py -p /dev/ttyUSB0 write_flash 0x1000 firmware.bin

# On Windows, use COM port instead
esptool.py -p COM3 write_flash 0x1000 firmware.bin
```

### Common Addresses

Depending on your flash layout, you may need different addresses:

```bash
# Standard flash layout
esptool.py -p /dev/ttyUSB0 write_flash \
    0x1000 bootloader.bin \
    0x8000 partition-table.bin \
    0x10000 firmware.bin

# Full chip erase first (recommended)
esptool.py -p /dev/ttyUSB0 erase_flash
esptool.py -p /dev/ttyUSB0 write_flash 0x0 full_image.bin
```

### Helpful Commands

```bash
# List available ports
esptool.py chip_id

# Get chip information
esptool.py -p /dev/ttyUSB0 chip_id

# Read flash content
esptool.py -p /dev/ttyUSB0 read_flash 0x0 0x100000 dump.bin

# Verify flash
esptool.py -p /dev/ttyUSB0 verify_flash 0x1000 firmware.bin

# Set speed for faster flashing
esptool.py -p /dev/ttyUSB0 -b 921600 write_flash 0x1000 firmware.bin
```

## Method 3: Arduino IDE

Using the Arduino IDE graphical interface.

### Prerequisites
- Arduino IDE 1.8.19+ with ESP32 board package installed
- See [Building Instructions](BUILDING.md) for setup

### Steps

1. **Open Project**
   - Open Arduino IDE
   - File → Open → `smartclock/esp32-smart-clock/src/main.cpp`

2. **Select Board & Port**
   - Tools → Board → ESP32 Dev Module (or your variant)
   - Tools → Port → Select your device COM port

3. **Compile**
   - Sketch → Verify (compiles without flashing)
   - Wait for completion

4. **Upload**
   - Sketch → Upload
   - Arduino will compile and flash automatically
   - Serial monitor opens after upload

5. **Monitor**
   - Tools → Serial Monitor (115200 baud)
   - Check for boot messages

## Method 4: PlatformIO

IDE or CLI-based approach with advanced features.

### CLI Commands

```bash
# Build and upload
platformio run -e esp32 --target upload

# Upload and monitor
platformio run -e esp32 --target upload -t monitor

# OTA upload (if device is on network)
platformio run -e esp32 --target upload --upload-port smartclock.local

# Specific serial port
platformio run -e esp32 --target upload --upload-port /dev/ttyUSB0
```

## Flashing Troubleshooting

### "Failed to connect to ESP32"

**Cause**: Device not detected or bad connection

**Solutions**:
1. Check USB cable (data cable, not power-only)
2. Try different USB port on your computer
3. Install/reinstall USB-UART drivers:
   - CH340: http://www.wch.cn/downloads/CH341SER_EXE.html
   - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
4. Hold BOOT button while flashing starts
5. Reduce upload speed: `--baud 115200`

### "Timeout waiting for packet header"

**Cause**: Data corruption or speed mismatch

**Solutions**:
1. Lower upload speed to 115200 baud
2. Use shorter USB cable
3. Try different USB port
4. Erase flash first:
   ```bash
   esptool.py -p /dev/ttyUSB0 erase_flash
   ```

### "Invalid header in packet" or "Wrong magic number"

**Cause**: Corrupted or incompatible firmware file

**Solutions**:
1. Re-download firmware file
2. Verify file size matches expected size
3. Check MD5 checksum if provided
4. Try rebuilding firmware from source

### Device not booting after flash

**Cause**: Bootloader issue or corrupted firmware

**Solutions**:
1. Full erase and reflash:
   ```bash
   esptool.py -p /dev/ttyUSB0 erase_flash
   esptool.py -p /dev/ttyUSB0 write_flash 0x1000 firmware.bin
   ```
2. Flash bootloader explicitly
3. Check serial output at 115200 baud for errors

### "Port already in use" error

**Cause**: Another application using the serial port

**Solutions**:
```bash
# Find what's using the port
lsof /dev/ttyUSB0  # On Linux/Mac
Get-Process | Where-Object {$_.Name -like "*COM*"}  # On Windows

# Kill the process or close the application
# Try different port number
```

## Verification After Flashing

### Check Serial Output

```bash
# Monitor at 115200 baud
screen /dev/ttyUSB0 115200  # Mac/Linux
putty -serial COM3 -sercfg 115200  # Windows
```

Expected output:
```
=================================
  SmartClock ESP32 Firmware
  Version: 1.2.3
=================================

Setting up WiFi...
Starting WiFi setup mode...
Setup WiFi: SmartClock-Setup | setup123
Visit: http://192.168.4.1
```

### Test Web Server

```bash
# Once connected to WiFi:
curl http://smartclock.local/api/v1/device/status

# Should return JSON with device info
```

## Over-the-Air (OTA) Updates

Once initial firmware is flashed, use OTA for future updates:

```bash
# OTA update via network
platformio run -e esp32 --target upload --upload-port smartclock.local

# Or use web dashboard
# 1. Navigate to http://smartclock.local/dashboard
# 2. Click "Check for Updates"
# 3. Click "Install Update"
```

## Advanced Options

### Custom Partition Table

Create custom partition layout in `partitions.csv`:
```
name,   type, subtype, offset,  size
nvs,    data, nvs,    0x9000,  0x6000
phy_init, data, phy, 0xf000,  0x1000
factory, app,  factory, 0x10000, 0x3f0000
```

Flash with custom partitions:
```bash
esptool.py write_flash 0x8000 partitions.bin
```

### Backup Flash Contents

```bash
# Read entire flash
esptool.py -p /dev/ttyUSB0 read_flash 0 0x400000 backup.bin

# Later restore from backup
esptool.py -p /dev/ttyUSB0 write_flash 0 backup.bin
```

## Support

- Check [Building Instructions](BUILDING.md)
- Review main [README](README.md)
- Open issue on GitHub
- Check serial monitor output for detailed error messages
