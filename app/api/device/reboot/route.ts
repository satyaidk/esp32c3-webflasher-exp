import { NextResponse, NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const REBOOT_LOG_FILE = path.join(DATA_DIR, 'reboot-log.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function logReboot() {
  ensureDataDir();

  const rebootLog = {
    timestamp: new Date().toISOString(),
    success: true
  };

  let logs: any[] = [];
  if (fs.existsSync(REBOOT_LOG_FILE)) {
    try {
      const data = fs.readFileSync(REBOOT_LOG_FILE, 'utf-8');
      logs = JSON.parse(data);
    } catch (error) {
      console.error('Error reading reboot log:', error);
    }
  }

  logs.push(rebootLog);
  // Keep only last 100 reboots
  if (logs.length > 100) {
    logs = logs.slice(-100);
  }
  fs.writeFileSync(REBOOT_LOG_FILE, JSON.stringify(logs, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { delay = 5 } = body; // Delay in seconds before reboot

    if (delay < 0 || delay > 300) {
      return NextResponse.json(
        { error: 'Delay must be between 0 and 300 seconds' },
        { status: 400 }
      );
    }

    // Log the reboot
    logReboot();

    return NextResponse.json({
      success: true,
      message: `Device will reboot in ${delay} seconds`,
      delay,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reboot device' },
      { status: 500 }
    );
  }
}
