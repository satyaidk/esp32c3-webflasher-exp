'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Download, ExternalLink, Copy, Loader, Upload, XCircle } from 'lucide-react';

interface FlasherComponentProps {
  onDeviceConnected?: (connected: boolean) => void;
  onDeviceInfo?: (info: any) => void;
}

declare global {
  interface Window {
    esptooljsModule: any;
  }
  interface Navigator {
    serial: any;
  }
}

export default function FlasherComponent({ onDeviceConnected, onDeviceInfo }: FlasherComponentProps) {
  const [activeTab, setActiveTab] = useState<'flasher' | 'pio' | 'arduino' | 'cli'>('flasher');
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
  const [chipInfo, setChipInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<any>(null);
  const transportRef = useRef<any>(null);

  // Manage esptool-js module
  const esptoolRef = useRef<any>(null);
  const [libReady, setLibReady] = useState(false);

  // Load esptool.js library
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        console.log('[v1] Starting library load...');
        
        // Load esp-web-tools
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/esp-web-tools@9.4.0/dist/web/install-button.js';
        script.async = true;
        document.head.appendChild(script);

        // Load Buffer polyfill (needed by esptool-js)
        const dynamicImport = new Function('url', 'return import(url)');
        
        try {
          const bufferMod = await dynamicImport('https://cdn.skypack.dev/buffer');
          window.Buffer = bufferMod.Buffer;
          console.log('[v1] Buffer polyfill ready');
        } catch (e) {
          console.error('[v1] Failed to load Buffer polyfill:', e);
        }

        // Load the actual esptool-js bundle as a module (Upgrade to 0.6.0)
        const esptool = await dynamicImport('https://unpkg.com/esptool-js@0.6.0/bundle.js');
        esptoolRef.current = esptool;
        
        console.log('[v1] esptool-js module ready (v0.6.0)');
        setLibReady(true);
        setMessage('Ready to connect your ESP32-C3');
      } catch (err) {
        console.error('[v1] Failed to load flashing libraries:', err);
        setError('Failed to load flashing library. Check your internet connection.');
      }
    };

    loadLibraries();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectDevice = async () => {
    setError('');
    setMessage('Connecting to device...');

    try {
      if (!libReady || !esptoolRef.current) {
        throw new Error('esptool.js library not ready. Please refresh the page.');
      }

      // Cleanup previous connection if any
      if (transportRef.current || loaderRef.current) {
        console.log('[v1] Cleaning up existing connection before reconnecting...');
        await disconnectDevice();
      }

      const { Transport, ESPLoader } = esptoolRef.current;

      // Get the serial port
      const port = await navigator.serial.requestPort({});
      if (!port) {
        throw new Error('No device selected');
      }

      console.log('[v1] Requesting port access...');
      
      // Create transport
      // esptool-js 0.6.0: constructor(device, tracing = false)
      const transport = new Transport(port);
      transportRef.current = transport;

      // Create loader
      const loader = new ESPLoader({
        transport,
        baudrate: 115200,
        terminal: {
          clean: () => {},
          writeLine: (data: string) => console.log('[v1/serial]', data),
          write: (data: string) => console.log('[v1/serial-raw]', data)
        }
      });
      loaderRef.current = loader;

      console.log('[v1] Connecting to chip...');

      // In v0.6.0, main() is still reliable as it handles synchronization, 
      // connecting, and stub loading in one go.
      const chipDesc = await loader.main();
      console.log('[v1] Device identified:', chipDesc);

      // Read chip info from the initialized chip object
      const macAddr = await loader.chip.readMac(loader);
      const info = {
        chipId: loader.chip.CHIP_NAME || 'ESP32-C3',
        macAddress: macAddr,
        chipType: chipDesc
      };

      setChipInfo(info);
      onDeviceInfo?.(info);
      onDeviceConnected?.(true);
      setIsConnected(true);
      setMessage(`Connected: ${info.macAddress}`);

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('[v1] Connection error:', err);

      // Detect the common ESP32-C3 USB CDC issue where DTR/RTS signals
      // are not supported, causing setSignals to fail during auto-bootloader entry.
      const isSignalError = err?.message?.includes('setSignals') || err?.message?.includes('control signals');
      if (isSignalError) {
        setError(
          'Could not auto-enter bootloader mode — your board\'s USB does not support DTR/RTS signals. ' +
          'Please manually enter bootloader mode: hold the BOOT button, press RESET, then release BOOT. ' +
          'Then click Connect again.'
        );
      } else {
        setError(err.message || 'Failed to connect to device');
      }

      setIsConnected(false);
      // Ensure we clean up on failed connection
      try {
        if (transportRef.current?.disconnect) await transportRef.current.disconnect();
      } catch (_) { /* ignore */ }
      transportRef.current = null;
      loaderRef.current = null;
    }
  };

  const disconnectDevice = async () => {
    try {
      setMessage('Disconnecting...');
      if (transportRef.current) {
        console.log('[v1] Disconnecting transport...');
        // In newer versions it might be disconnect() or close()
        if (transportRef.current.disconnect) {
          await transportRef.current.disconnect();
        } else if (transportRef.current.close) {
          await transportRef.current.close();
        }
      }
      
      loaderRef.current = null;
      transportRef.current = null;
      setIsConnected(false);
      setChipInfo(null);
      setMessage('Device disconnected');
      onDeviceConnected?.(false);
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('[v1] Disconnect error:', err);
      // Force cleanup state even on error
      loaderRef.current = null;
      transportRef.current = null;
      setIsConnected(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.bin')) {
        setFirmwareFile(file);
        setError('');
      } else {
        setError('Please select a valid firmware file (.bin)');
        setFirmwareFile(null);
      }
    }
  };

  const startFlashing = async () => {
    if (!firmwareFile) {
      setError('Please select a firmware file');
      return;
    }

    if (!loaderRef.current || !transportRef.current) {
      setError('Device not connected. Please connect your device first.');
      return;
    }

    setIsFlashing(true);
    setProgress(0);
    setError('');
    setMessage('Starting flash...');

    try {
      const loader = loaderRef.current;
      const fileBuffer = await firmwareFile.arrayBuffer();
      const fileArray = new Uint8Array(fileBuffer);

      console.log('[v1] Firmware size:', fileArray.length);
      console.log('[v1] Starting flash with compression...');

      // Erase & Write firmware (compressed)
      setMessage('Flashing firmware...');
      
      await loader.writeFlash({
        fileArray: [{
          data: fileArray,
          address: 0x0
        }],
        flashSize: 'keep',
        flashMode: 'keep',
        flashFreq: 'keep',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const overallProgress = Math.floor((written / total) * 100);
          setProgress(overallProgress);
          setMessage(`Writing: ${overallProgress}%`);
        }
      });

      // Reset — some ESP32-C3 boards (especially Super Mini) don't support
      // RTS/DTR control signals over their USB-Serial bridge, so setSignals()
      // will throw a NetworkError. The firmware is already fully written at
      // this point, so the reset failure is non-fatal.
      setMessage('Resetting device...');
      setProgress(98);
      try {
        await loader.after('hard_reset');
      } catch (resetErr: any) {
        console.warn('[v1] Hard reset failed (non-fatal, firmware is already written):', resetErr.message);
        console.warn('[v1] Please press the RESET button on your ESP32-C3 board manually.');
      }

      setProgress(100);
      setMessage('Firmware flashed successfully! If the device did not restart automatically, press the RESET button on the board.');
      setIsFlashing(false);

      // Disconnect cleanly after successful flash
      try {
        await disconnectDevice();
      } catch (_) { /* ignore cleanup errors */ }

      // Clean up UI state
      setTimeout(() => {
        setFirmwareFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage('');
        setProgress(0);
      }, 5000);
    } catch (err: any) {
      console.error('[v1] Flash error:', err);
      setError(err.message || 'Flashing failed. Please try again.');
      setIsFlashing(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Flash ESP32-C3 Firmware</h1>
        <p className="text-muted-foreground">Using Espressif esptool-js for direct web-based flashing</p>
      </div>

      {/* Important Alert */}
      <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Requirements</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Use Chrome, Edge, or Opera browser with WebSerial support. Firefox and Safari do not support WebSerial.
            </p>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { id: 'flasher', label: 'Web Flasher' },
          { id: 'pio', label: 'PlatformIO' },
          { id: 'arduino', label: 'Arduino IDE' },
          { id: 'cli', label: 'Command Line' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Web Flasher Tab */}
      {activeTab === 'flasher' && (
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Success Message */}
          {message && !error && message.includes('successfully') && (
            <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Success!</h3>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">{message}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Connection Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Step 1: Connect Device</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Plug your ESP32-C3 Super Mini via USB-C, then click Connect below to detect your device.
            </p>

            {isConnected && chipInfo && (
              <div className="bg-muted p-4 rounded-lg mb-4 text-sm space-y-2">
                <p className="font-semibold">Device Connected</p>
                <p>Chip ID: <code className="bg-background px-2 py-1 rounded">{chipInfo.chipId}</code></p>
                <p>MAC Address: <code className="bg-background px-2 py-1 rounded">{chipInfo.macAddress}</code></p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={connectDevice}
                disabled={isConnected || isFlashing}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isConnected
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Connect Device
                  </>
                )}
              </button>

              {isConnected && (
                <button
                  onClick={disconnectDevice}
                  className="px-4 py-2 rounded-lg font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </Card>

          {/* File Selection Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Select Firmware</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Build the firmware using{' '}
              <a href="/firmware/QUICK_START.md" className="text-primary hover:underline" target="_blank">
                these instructions
              </a>
              , then select the compiled <code className="bg-muted px-2 py-1 rounded">firmware.bin</code> file.
            </p>

            <div
              onClick={() => !isFlashing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isFlashing
                  ? 'border-muted bg-muted/50 cursor-not-allowed'
                  : 'border-border cursor-pointer hover:border-primary transition-colors'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold mb-1">Select firmware file</p>
              <p className="text-sm text-muted-foreground">
                {firmwareFile ? firmwareFile.name : 'Click to browse or drag and drop'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".bin"
                onChange={handleFileSelect}
                disabled={isFlashing}
                className="hidden"
              />
            </div>

            {firmwareFile && (
              <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{firmwareFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(firmwareFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFirmwareFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isFlashing}
                  className="text-xs px-2 py-1 hover:bg-background rounded"
                >
                  Remove
                </button>
              </div>
            )}
          </Card>

          {/* Progress Card */}
          {isFlashing && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader className="w-5 h-5 text-primary animate-spin" />
                <h2 className="text-lg font-semibold">Flashing...</h2>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">{message}</p>
                  <p className="text-sm font-semibold text-primary">{progress}%</p>
                </div>
              </div>
            </Card>
          )}

          {/* Flash Button */}
          <button
            onClick={startFlashing}
            disabled={!isConnected || !firmwareFile || isFlashing}
            className={`w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              isFlashing || !isConnected || !firmwareFile
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isFlashing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Flashing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Start Flashing
              </>
            )}
          </button>

          {/* Info */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Do not close this tab or disconnect the USB cable during flashing. The process takes about 30 seconds.
            </p>
          </Card>
        </div>
      )}

      {/* PlatformIO Tab */}
      {activeTab === 'pio' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Flash with PlatformIO</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Build and flash directly from the command line or VS Code:
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-2">Build only:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                  <code>pio run -e esp32c3</code>
                  <button
                    onClick={() => copyToClipboard('pio run -e esp32c3')}
                    className="flex-shrink-0 p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Build and upload:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                  <code>pio run -e esp32c3 -t upload</code>
                  <button
                    onClick={() => copyToClipboard('pio run -e esp32c3 -t upload')}
                    className="flex-shrink-0 p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">View serial monitor:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                  <code>pio device monitor -b 115200</code>
                  <button
                    onClick={() => copyToClipboard('pio device monitor -b 115200')}
                    className="flex-shrink-0 p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              {copied ? '✓ Copied to clipboard!' : 'Click the copy icon to copy commands'}
            </p>
          </Card>

          <a
            href="/firmware/BUILDING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View detailed PlatformIO guide
          </a>
        </div>
      )}

      {/* Arduino IDE Tab */}
      {activeTab === 'arduino' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Flash with Arduino IDE</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-6">1.</span>
                <span>
                  Install ESP32 board package. Go to <strong>Tools → Board Manager</strong>, search for ESP32 and install it
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-6">2.</span>
                <span>
                  Open <code className="bg-muted px-2 py-1 rounded">src/main.cpp</code> in Arduino IDE
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-6">3.</span>
                <span>
                  Select <strong>Tools</strong> menu:
                  <ul className="ml-6 mt-2 space-y-1 text-xs">
                    <li>Board: <code className="bg-muted px-1 py-0.5 rounded">ESP32C3 Dev Module</code></li>
                    <li>Port: Select your COM/USB port</li>
                    <li>Upload Speed: <code className="bg-muted px-1 py-0.5 rounded">460800</code></li>
                  </ul>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-6">4.</span>
                <span>
                  Click <strong>Sketch → Upload</strong> to flash the device
                </span>
              </li>
            </ol>
          </Card>

          <a
            href="/firmware/BUILDING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View detailed Arduino IDE guide
          </a>
        </div>
      )}

      {/* CLI Tab */}
      {activeTab === 'cli' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Flash with esptool.py</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Use the official esptool command-line tool for maximum control:
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-2">Install esptool:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                  <code>pip install esptool</code>
                  <button
                    onClick={() => copyToClipboard('pip install esptool')}
                    className="flex-shrink-0 p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Erase flash:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                  <code>esptool.py -p COM3 erase_flash</code>
                  <button
                    onClick={() => copyToClipboard('esptool.py -p COM3 erase_flash')}
                    className="flex-shrink-0 p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Write firmware:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                  <code>esptool.py -p COM3 write_flash 0x0 firmware.bin</code>
                  <button
                    onClick={() => copyToClipboard('esptool.py -p COM3 write_flash 0x0 firmware.bin')}
                    className="flex-shrink-0 p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Replace <code className="bg-muted px-1 py-0.5 rounded">COM3</code> with your port (COM1-COM9 on Windows, /dev/ttyUSB0 on Linux)
            </p>
          </Card>

          <a
            href="/firmware/FLASHING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View detailed CLI guide
          </a>
        </div>
      )}

      {/* Additional Resources */}
      <Card className="p-6 bg-muted/50">
        <h2 className="text-lg font-semibold mb-4">Additional Resources</h2>
        <div className="grid gap-3 text-sm">
          <a href="/firmware/QUICK_START.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Quick Start Guide
          </a>
          <a href="/firmware/HARDWARE_SETUP.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Hardware Setup & Wiring
          </a>
          <a href="/firmware/BUILDING.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Complete Building Guide
          </a>
          <a href="/firmware/FLASHING.md" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Troubleshooting & Advanced Flashing
          </a>
        </div>
      </Card>
    </div>
  );
}
