import { NextResponse, NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const SETTINGS_FILE = path.join(DATA_DIR, 'device-settings.json');

const DEFAULT_SETTINGS = {
  brightness: 70,
  theme: 'auto',
  timeFormat: '24h'
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSettings() {
  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: any) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  try {
    const settings = loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brightness, theme, timeFormat } = body;

    // Validate inputs
    if (brightness !== undefined && (brightness < 0 || brightness > 100)) {
      return NextResponse.json(
        { error: 'Brightness must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (theme && !['light', 'dark', 'auto'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    if (timeFormat && !['12h', '24h'].includes(timeFormat)) {
      return NextResponse.json(
        { error: 'Invalid time format' },
        { status: 400 }
      );
    }

    // Load current settings and update
    const settings = loadSettings();
    const updated = {
      ...settings,
      ...(brightness !== undefined && { brightness }),
      ...(theme && { theme }),
      ...(timeFormat && { timeFormat }),
      lastUpdate: new Date().toISOString()
    };

    saveSettings(updated);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updated
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
