import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    ensureDataDir();

    // Return simulated device status
    const status = {
      chipId: '3035DA4',
      firmwareVersion: '1.2.3',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      wifiRssi: -45,
      uptime: 655200, // 7.58 days in seconds
      memoryUsage: 65,
      isConnected: true,
      lastUpdate: new Date().toISOString()
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch device status' },
      { status: 500 }
    );
  }
}
