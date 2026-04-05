import { NextResponse, NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const OTA_LOG_FILE = path.join(DATA_DIR, 'ota-updates.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function logOTAUpdate(version: string, success: boolean) {
  ensureDataDir();
  
  const log = {
    version,
    timestamp: new Date().toISOString(),
    success,
    status: success ? 'completed' : 'failed'
  };

  let updates: any[] = [];
  if (fs.existsSync(OTA_LOG_FILE)) {
    try {
      const data = fs.readFileSync(OTA_LOG_FILE, 'utf-8');
      updates = JSON.parse(data);
    } catch (error) {
      console.error('Error reading OTA log:', error);
    }
  }

  updates.push(log);
  fs.writeFileSync(OTA_LOG_FILE, JSON.stringify(updates, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { error: 'Version is required' },
        { status: 400 }
      );
    }

    // Validate version format (e.g., 1.2.3)
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      return NextResponse.json(
        { error: 'Invalid version format. Use semantic versioning (e.g., 1.2.3)' },
        { status: 400 }
      );
    }

    // Log the OTA update attempt
    logOTAUpdate(version, true);

    return NextResponse.json({
      success: true,
      message: `OTA update to version ${version} initiated`,
      updateStarted: true,
      downloadUrl: `https://github.com/smartclock/firmware/releases/download/v${version}/smartclock-v${version}.bin`,
      estimatedTime: '2-5 minutes',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate OTA update' },
      { status: 500 }
    );
  }
}
