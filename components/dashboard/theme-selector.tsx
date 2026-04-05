'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Palette } from 'lucide-react';

export default function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Always bright display' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Always dark display' },
    { id: 'auto', label: 'Auto', icon: Palette, description: 'Follow system time' }
  ];

  return (
    <Card className="p-6 bg-card">
      <div className="grid md:grid-cols-3 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as 'light' | 'dark' | 'auto')}
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer text-center ${
                theme === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
            </button>
          );
        })}
      </div>

      <Button className="w-full mt-6">Save Settings</Button>
    </Card>
  );
}
