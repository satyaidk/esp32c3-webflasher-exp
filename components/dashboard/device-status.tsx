'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function DeviceStatus() {
  const statusData = [
    {
      label: 'Chip ID',
      value: '3035DA4',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      label: 'Firmware Version',
      value: '1.2.3',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      label: 'MAC Address',
      value: 'AA:BB:CC:DD:EE:FF',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      label: 'WiFi RSSI',
      value: '-45 dBm',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      label: 'Uptime',
      value: '7 days 12h',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      label: 'Memory Usage',
      value: '65% (1.3 MB / 2 MB)',
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {statusData.map((item, idx) => (
        <Card key={idx} className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <p className="font-semibold font-mono text-lg">{item.value}</p>
            </div>
            {item.icon}
          </div>
        </Card>
      ))}
    </div>
  );
}
