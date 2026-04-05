'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function BrightnessControl() {
  const [brightness, setBrightness] = useState(70);

  const presets = [
    { label: 'Min', value: 10 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: 'Max', value: 100 }
  ];

  return (
    <Card className="p-6 bg-card">
      <div className="space-y-6">
        {/* Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Current Level</label>
            <span className="text-2xl font-bold text-primary">{brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Bright</span>
              <Sun className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Presets</p>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={brightness === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBrightness(preset.value)}
                className="text-xs h-auto py-2"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full">Save Settings</Button>
      </div>
    </Card>
  );
}
