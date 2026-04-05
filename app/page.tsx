'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Sliders, Upload, GitBranch } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>SmartClock</span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/flasher" className="text-sm font-medium hover:text-primary transition-colors">
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IoT Smart Clock
            </span>
            <br />
            Platform
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Flash firmware, control brightness & theme, and manage over-the-air updates for your ESP32-powered smart clock with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/flasher">
              <Button size="lg" className="gap-2">
                <Upload className="w-5 h-5" />
                Flash Firmware
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <Sliders className="w-5 h-5" />
                Control Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: Web Flasher */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Web Flasher</h3>
            <p className="text-muted-foreground">
              Flash ESP32 firmware directly from your browser using our web-based flasher interface.
            </p>
          </div>

          {/* Feature 2: Control Panel */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Sliders className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Control Panel</h3>
            <p className="text-muted-foreground">
              Adjust brightness, switch themes, change time format, and manage device settings in real-time.
            </p>
          </div>

          {/* Feature 3: OTA Updates */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">OTA Updates</h3>
            <p className="text-muted-foreground">
              Deploy firmware updates over-the-air without physical access to your device.
            </p>
          </div>
        </div>
      </section>

      {/* API Documentation Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
          <p className="text-muted-foreground mb-6">
            Complete REST API for device management, settings control, and firmware updates. Build custom integrations with our documented endpoints.
          </p>
          <Link href="/docs">
            <Button variant="outline">View API Documentation</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 SmartClock. ESP32-powered IoT platform.</p>
        </div>
      </footer>
    </div>
  );
}
