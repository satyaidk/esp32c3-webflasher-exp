import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const firmwareInfo = {
      version: '1.2.3',
      releaseDate: '2024-01-15',
      downloadUrl: 'https://github.com/smartclock/firmware/releases/download/v1.2.3/smartclock-v1.2.3.bin',
      changelog: `
## Version 1.2.3 - January 15, 2024

### Features
- Improved WiFi connectivity stability
- Added support for custom time zones
- Enhanced OTA update process

### Bug Fixes
- Fixed display glitches during theme transitions
- Corrected brightness level persistence
- Resolved memory leak in WiFi driver

### Performance
- Reduced boot time by 30%
- Optimized memory usage
      `,
      isLatest: true,
      fileSize: 524288,
      checksum: 'sha256:abc123def456'
    };

    return NextResponse.json(firmwareInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch firmware info' },
      { status: 500 }
    );
  }
}
