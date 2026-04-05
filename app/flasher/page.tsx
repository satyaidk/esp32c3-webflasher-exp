'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Download, Radio, Zap, CheckCircle, Loader } from 'lucide-react';
import FlasherComponent from '@/components/flasher/flasher-component';

export default function FlasherPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>SmartClock</span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/flasher" className="text-sm font-medium text-primary border-b-2 border-primary">
                Flasher
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
                Docs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Web Firmware Flasher</h1>
          <p className="text-muted-foreground">Flash firmware to your ESP32-powered SmartClock directly from your browser.</p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">USB Connection</h3>
                <p className="text-sm text-muted-foreground">Connect your device via USB to flash firmware.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Latest Firmware</h3>
                <p className="text-sm text-muted-foreground">Automatically loads the latest stable firmware version.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Flasher Component */}
        <FlasherComponent onDeviceConnected={setIsConnected} onDeviceInfo={setDeviceInfo} />

        {/* Requirements */}
        <Card className="mt-8 p-6 border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Requirements
          </h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Chrome, Edge, or Opera browser (WebUSB support required)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>USB cable for device connection</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>ESP32 board with USB-UART bridge (CH340, CP2102, etc.)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Proper board drivers installed on your system</span>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
