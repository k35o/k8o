import { ipAddress } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const ip = ipAddress(request);
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') ?? [];
    console.log(allowedIPs);
    console.log(ip);
    if (!isDevelopment && (!ip || !allowedIPs.includes(ip))) {
      return NextResponse.json(
        { error: 'Not Found' },
        {
          status: 404
        }
      );
    }
  }
  return NextResponse.next();
}
