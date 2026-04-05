'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Sliders, Moon, Sun, Wifi, Power, RefreshCw, Clock } from 'lucide-react';
import DeviceStatus from '@/components/dashboard/device-status';
import BrightnessControl from '@/components/dashboard/brightness-control';
import ThemeSelector from '@/components/dashboard/theme-selector';
import TimeFormatControl from '@/components/dashboard/time-format-control';

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnected(true);
    setIsSyncing(false);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSyncing(false);
  };

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
              <Link href="/flasher" className="text-sm font-medium hover:text-primary transition-colors">
                Flasher
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-primary border-b-2 border-primary">
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
          <h1 className="text-4xl font-bold mb-2">Control Panel</h1>
          <p className="text-muted-foreground">Manage your SmartClock device settings and monitor status.</p>
        </div>

        {/* Device Status Section */}
        {!isConnected ? (
          <Card className="p-8 text-center mb-8 bg-muted/30">
            <Wifi className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Device Connected</h2>
            <p className="text-muted-foreground mb-6">
              Connect to your SmartClock device to control settings and monitor status.
            </p>
            <Button
              size="lg"
              onClick={handleConnect}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Device'
              )}
            </Button>
          </Card>
        ) : (
          <>
            {/* Device Status */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Device Status</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
              <DeviceStatus />
            </div>

            {/* Controls Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Brightness Control */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-primary" />
                  Brightness
                </h3>
                <BrightnessControl />
              </div>

              {/* Time Format Control */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Time Format
                </h3>
                <TimeFormatControl />
              </div>

              {/* Theme Selector */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  Display Theme
                </h3>
                <ThemeSelector />
              </div>
            </div>

            {/* Power Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Power className="w-5 h-5 text-primary" />
                Power Controls
              </h3>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  Sleep Mode
                </Button>
                <Button variant="outline" className="flex-1">
                  Restart Device
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
