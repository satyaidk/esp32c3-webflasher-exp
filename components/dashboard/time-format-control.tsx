'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TimeFormatControl() {
  const [format, setFormat] = useState<'12h' | '24h'>('24h');

  const formats = [
    { id: '12h', label: '12-Hour (AM/PM)', example: '10:30 PM' },
    { id: '24h', label: '24-Hour', example: '22:30' }
  ];

  return (
    <Card className="p-6 bg-card">
      <div className="space-y-4">
        {formats.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => setFormat(fmt.id as '12h' | '24h')}
            className={`w-full p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              format === fmt.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-left">
              <p className="font-semibold">{fmt.label}</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">{fmt.example}</p>
            </div>
          </button>
        ))}

        <Button className="w-full mt-4">Save Settings</Button>
      </div>
    </Card>
  );
}
