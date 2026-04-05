# Hardware Setup Guide - ESP32-C3 Super Mini

Complete wiring and connection guide for SmartClock with SSD1306 OLED and touch sensor.

## Component Overview

### ESP32-C3 Super Mini
- **Size**: 22.5mm × 17.5mm (ultra-compact)
- **Processor**: RISC-V single-core @ 160MHz
- **RAM**: 384 KB
- **Flash**: 4 MB (configurable)
- **Power**: 3.3V (USB via internal regulator)
- **GPIO Pins**: 12 usable digital I/O
- **USB**: USB-C for power and programming

### SSD1306 OLED Display
- **Resolution**: 128 × 64 pixels
- **Color**: White on black
- **Interface**: I2C (address 0x3C)
- **Voltage**: 3.3V
- **Current**: ~20 mA typical
- **Contrast**: Software configurable

### Touch Sensor Module
- **Type**: Capacitive touch
- **Pins**: VCC, GND, Signal (I/O)
- **Voltage**: 3.3V
- **Sensitivity**: Adjustable
- **Response Time**: <10 ms

## Pinout Diagram

```
ESP32-C3 Super Mini - Top View
┌─────────────────────────────────┐
│      USB-C (5V Input)           │
├─────────────────────────────────┤
│ GND  RX   TX   IO9  IO8        │ ← Left side
│ 5V   IO3  IO4  IO2  IO7        │
│ EN   IO5  IO6  IO1  IO0        │
│ GND  IO21(SCL) IO20(SDA)       │ ← I2C pins
└─────────────────────────────────┘

ESP32-C3 Super Mini - Full Pinout
                USB-C
                  ↓
        ┌──────────────────┐
   GND  │ ●                │  IO8
   5V   │                  │  IO7  → Reserved
   EN   │  ESP32-C3        │  IO0  → Boot pin
  GND   │  Super Mini      │  IO1  → Touch sensor
  IO5   │                  │  IO6
  IO4   │                  │  IO21 → SCL (OLED)
  IO3   │                  │  IO20 → SDA (OLED)
   TX   │                  │  TX
   RX   │                  │  RX
  GND   │                  │  GND
        └──────────────────┘
            USB-C port
```

## Wiring Connections

### OLED Display (SSD1306) - I2C Connection

```
┌─────────────────────────────────┐
│ OLED SSD1306 Display            │
│                                 │
│ [1] VCC  ────────→ ESP32-C3 3.3V│
│ [2] GND  ────────→ ESP32-C3 GND │
│ [3] SDA  ────────→ ESP32-C3 IO20│
│ [4] SCL  ────────→ ESP32-C3 IO21│
└─────────────────────────────────┘
```

**I2C Address**: 0x3C (default)

**Pin Details**:

| OLED Pin | Name | Function | ESP32-C3 Pin |
|----------|------|----------|--------------|
| 1 | VCC | Power (3.3V) | 3.3V Rail |
| 2 | GND | Ground | GND |
| 3 | SDA | I2C Data | GPIO20 (IO20) |
| 4 | SCL | I2C Clock | GPIO21 (IO21) |

**Wiring Instructions**:
1. Connect OLED VCC (red wire) → ESP32-C3 3.3V pad
2. Connect OLED GND (black wire) → ESP32-C3 GND pad
3. Connect OLED SDA (yellow wire) → ESP32-C3 GPIO20
4. Connect OLED SCL (green wire) → ESP32-C3 GPIO21

**Connection Methods**:
- **Soldering** (permanent): Solder directly to pads
- **Breadboard**: Use jumper wires on breadboard
- **Header Pins** (recommended): Solder header pins to ESP32-C3, use breadboard

### Touch Sensor - GPIO1 Connection

```
┌─────────────────────────────────┐
│ Touch Sensor Module             │
│                                 │
│ [1] VCC  ────────→ ESP32-C3 3.3V│
│ [2] GND  ────────→ ESP32-C3 GND │
│ [3] I/O  ────────→ ESP32-C3 IO1 │
└─────────────────────────────────┘
```

**Pin Details**:

| Sensor Pin | Name | Function | ESP32-C3 Pin |
|-----------|------|----------|--------------|
| 1 | VCC | Power (3.3V) | 3.3V Rail |
| 2 | GND | Ground | GND |
| 3 | I/O | Signal Input | GPIO1 (IO1) |

**Wiring Instructions**:
1. Connect Sensor VCC (red) → ESP32-C3 3.3V pad
2. Connect Sensor GND (black) → ESP32-C3 GND pad
3. Connect Sensor I/O (yellow) → ESP32-C3 GPIO1

**Configuration**:
- Firmware monitors GPIO1 continuously
- Touch detected = display briefly inverts
- No debouncing needed (handled in firmware)

## Complete Wiring Schematic

```
                    ┌─────────────────────┐
                    │  3.3V Rail          │
                    └──────────┬──────────┘
                               │
                   ┌───────────┼───────────┐
                   │           │           │
              OLED VCC    Sensor VCC   Other circuits
              
                ┌─────────────────────┐
                │  GND Rail           │
                └──────────┬──────────┘
                           │
              ┌────────────┼────────────┬─────────┐
              │            │            │         │
          OLED GND    Sensor GND   ESP32 GND  Caps
          
        ┌─────────────────────────────┐
        │   ESP32-C3 Super Mini       │
        │                             │
        │  I2C (SDA=20, SCL=21)       │
        │  Touch (GPIO1)              │
        │  USB-C (Power + Program)    │
        └────────┬──────────┬─────────┘
                 │          │
            OLED │      Sensor │
             SDA │       I/O
             SCL │
```

## Step-by-Step Assembly

### Materials Needed
- ESP32-C3 Super Mini
- SSD1306 OLED Display (128x64)
- Capacitive Touch Sensor
- USB-C Cable
- Jumper wires (4-6) or breadboard + header pins
- Soldering iron (optional, for permanent connections)

### Method 1: Breadboard + Jumper Wires (Easiest)

1. **Prepare breadboard**
   - Place ESP32-C3 on breadboard with pins facing outward
   - Ensure at least 3 rows of free space on each side

2. **Connect power rails**
   - Connect 3.3V pad to breadboard + rail
   - Connect GND pad to breadboard - rail
   - Connect another GND to - rail for stability

3. **Connect OLED (I2C)**
   - OLED VCC → Breadboard + rail
   - OLED GND → Breadboard - rail
   - OLED SDA (pin 3) → Breadboard row with ESP32-C3 GPIO20
   - OLED SCL (pin 4) → Breadboard row with ESP32-C3 GPIO21

4. **Connect Touch Sensor**
   - Sensor VCC → Breadboard + rail
   - Sensor GND → Breadboard - rail
   - Sensor I/O → Breadboard row with ESP32-C3 GPIO1

5. **Test power**
   - Connect USB-C cable
   - OLED should show startup message
   - No magic smoke = success!

### Method 2: Soldering (Permanent, Recommended)

1. **Prepare ESP32-C3**
   - Use flux pen on all pads
   - Heat pad with iron (2 seconds)
   - Apply solder, remove iron

2. **Solder I2C connections** (SDA/SCL)
   - Very thin wires recommended
   - Heat pad and wire simultaneously
   - Use minimal solder (small joint)

3. **Solder Power connections**
   - Use thicker wire for 3.3V and GND
   - Multiple GND connections for stability
   - Test continuity with multimeter

4. **Solder Touch sensor**
   - Single wire to GPIO1
   - Power and GND as above

5. **Verify connections**
   - Visual inspection for cold solder joints
   - Multimeter continuity test
   - Power on and check display

## Troubleshooting Connections

### OLED Not Appearing
**Symptom**: Display stays black, no error on serial monitor

**Check**:
1. Is USB cable connected? (check for power LED)
2. Are SDA (GPIO20) and SCL (GPIO21) connected correctly?
3. I2C address correct? (0x3C for most SSD1306)
4. Voltage present on VCC? (use multimeter)
5. Any cold solder joints? (inspect visually)

**Test**:
```
Serial monitor should show:
"OLED display initialized successfully"
```

If not visible, check Serial Monitor for:
- "SSD1306 allocation failed" = I2C not working
- No message = Firmware not running

### Touch Sensor Not Working
**Symptom**: No response to touches, serial shows no detection

**Check**:
1. Is GPIO1 connected to sensor I/O pin?
2. Is power connected? (3.3V)
3. Is there GND connection?

**Test**:
Serial monitor should show on touch:
```
Touch detected on GPIO1
```

If not, check:
- GPIO1 voltage with multimeter (should toggle on touch)
- Sensor module itself (test with another input)

### I2C Communication Issues
**Error in Serial Monitor**: "I2C error" or "Cannot find device at 0x3C"

**Possible Causes**:
1. Pull-up resistors missing (add 4.7K Ohm on SDA/SCL)
2. Incorrect pins (verify GPIO20/21)
3. Damaged I2C module
4. Wire capacitance too high (shorten wires)

**Solution**:
```
Add 4.7K Ohm resistors:
SDA ──[4.7K]── 3.3V
SCL ──[4.7K]── 3.3V
```

## Voltage Levels & Safety

### Power Budget
```
Component        | Typical | Max    | Notes
ESP32-C3         | 80 mA   | 250 mA | WiFi peaks
OLED Display     | 20 mA   | 40 mA  | Full brightness
Touch Sensor     | 5 mA    | 10 mA  | Minimal
─────────────────┼─────────┼────────┼──────────
Total           | 105 mA  | 300 mA | USB 500 mA available
```

**USB Power**: Most USB ports provide 500 mA @ 5V
- Internal regulator → 3.3V
- Sufficient for all components
- No external power supply needed

### GPIO Voltage
- **Input voltage**: 3.3V maximum
- **Output voltage**: 3.3V logic
- **Not compatible**: 5V devices (will damage pins)
- **Protection**: Never exceed 3.3V on any GPIO

### Safe Limits
- **Temperature**: 0°C to 40°C operating
- **Humidity**: <80% (no condensation)
- **Vibration**: Avoid shock stress on solder joints

## Cable & Connector Standards

### USB-C Cable Requirements
- **Data lines required** (not power-only)
- **Quality cable** reduces upload issues
- **Length**: 2 meters typical, longer may have problems

### I2C Wires
- **Length**: Up to 1 meter typical
- **Gauge**: 22 AWG (0.6mm) recommended
- **Shielding**: Not required for short runs

### Sensor Wires
- **Length**: Up to 30 cm recommended
- **Gauge**: 22 AWG minimum
- **No shielding** needed

## Alternative Connections

### Using Different GPIO Pins
Edit `src/main.cpp`:
```cpp
#define SDA_PIN 8   // Change from 20
#define SCL_PIN 9   // Change from 21
#define TOUCH_PIN 2 // Change from 1
```

**Note**: Some pins are reserved (RX=3, TX=4, BOOT=0)

### Using Different I2C Address
Most displays default to 0x3C, some use 0x3D
```cpp
// In setupDisplay():
if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Try 0x3D
```

## Testing Connections

### Visual Inspection
- Check for reversed polarity
- Look for loose/cold solder joints
- Verify wire insulation not stripped
- Ensure no crossed wires

### Power Test
```bash
# Check voltage with multimeter
VCC pin: Should read 3.3V
GND pin: Should read 0V
GPIO20/21: Should float around 1.6V (pulled up by I2C resistors)
GPIO1: Should vary (depends on touch)
```

### Communication Test
```bash
# Serial monitor shows:
Setting up I2C on pins 20,21
OLED display initialized successfully
```

### Functional Test
- Display shows time/date
- Touch sensor responds
- WiFi connects
- API responds to requests

## Next Steps

After successful hardware connection:

1. **Build Firmware**: See [BUILDING.md](./BUILDING.md)
2. **Flash Device**: See [QUICK_START.md](./QUICK_START.md)
3. **Configure WiFi**: Connect to `SmartClock-Setup`
4. **Monitor Logs**: Watch Serial Monitor at 115200 baud
5. **Access Dashboard**: Visit `http://smartclock-c3.local`

## Support

- Check serial monitor for detailed error messages
- Review [QUICK_START.md](./QUICK_START.md) for common issues
- Verify hardware with multimeter if electronics experience
- Test each component separately before connecting all together
