'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Zap, Code2, BookOpen } from 'lucide-react';
import APIEndpoint from '@/components/docs/api-endpoint';

export default function DocsPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/device/status',
      description: 'Get current device status and information',
      params: [],
      response: {
        chipId: 'string',
        firmwareVersion: 'string',
        macAddress: 'string',
        wifiRssi: 'number',
        uptime: 'number',
        memoryUsage: 'number'
      }
    },
    {
      method: 'POST',
      path: '/api/device/settings',
      description: 'Update device settings',
      params: [
        { name: 'brightness', type: 'number', required: true, desc: '0-100' },
        { name: 'theme', type: 'string', required: true, desc: 'light|dark|auto' },
        { name: 'timeFormat', type: 'string', required: true, desc: '12h|24h' }
      ],
      response: { success: 'boolean', message: 'string' }
    },
    {
      method: 'GET',
      path: '/api/device/settings',
      description: 'Get current device settings',
      params: [],
      response: {
        brightness: 'number',
        theme: 'string',
        timeFormat: 'string'
      }
    },
    {
      method: 'GET',
      path: '/api/firmware/latest',
      description: 'Get latest firmware version info',
      params: [],
      response: {
        version: 'string',
        releaseDate: 'string',
        downloadUrl: 'string',
        changelog: 'string'
      }
    },
    {
      method: 'POST',
      path: '/api/firmware/ota',
      description: 'Trigger OTA firmware update',
      params: [
        { name: 'version', type: 'string', required: true, desc: 'Firmware version to update to' }
      ],
      response: { success: 'boolean', message: 'string', updateStarted: 'boolean' }
    },
    {
      method: 'POST',
      path: '/api/device/reboot',
      description: 'Reboot the device',
      params: [],
      response: { success: 'boolean', message: 'string' }
    }
  ];

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
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-sm font-medium text-primary border-b-2 border-primary">
                Docs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
          <p className="text-muted-foreground text-lg">
            Complete REST API reference for SmartClock device management and control.
          </p>
        </div>

        {/* Base URL Info */}
        <Card className="p-6 mb-12 bg-primary/5 border-primary/20">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Base URL
          </h2>
          <p className="font-mono text-sm bg-background/50 p-3 rounded border border-border">
            https://smartclock.local/api/v1
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            All endpoints are relative to the device IP address or mDNS hostname.
          </p>
        </Card>

        {/* Authentication */}
        <Card className="p-6 mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Authentication
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm">
            <p>
              Currently, the API runs on a local network without authentication. For production deployments,
              implement proper authentication using API tokens or certificates.
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-xs">
              {`# Example request with optional API key\ncurl -H "Authorization: Bearer YOUR_API_KEY" http://smartclock.local/api/v1/device/status`}
            </div>
          </div>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Endpoints</h2>
          {endpoints.map((endpoint, idx) => (
            <APIEndpoint key={idx} {...endpoint} />
          ))}
        </div>

        {/* Examples Section */}
        <Card className="p-6 mt-12">
          <h2 className="text-lg font-semibold mb-4">Example Usage</h2>
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-sm mb-2">Get Device Status</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`fetch('http://smartclock.local/api/v1/device/status')
  .then(res => res.json())
  .then(data => console.log(data))`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Update Device Settings</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`fetch('http://smartclock.local/api/v1/device/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brightness: 80,
    theme: 'dark',
    timeFormat: '24h'
  })
})
.then(res => res.json())
.then(data => console.log(data))`}
              </pre>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
