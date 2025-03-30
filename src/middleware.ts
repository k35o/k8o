import { ipAddress } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const ip = ipAddress(request);
    const allowedIPs =
      process.env.ADMIN_ALLOWED_IPS?.split(',') ?? [];
    if (!isDevelopment && (!ip || !allowedIPs.includes(ip))) {
      // notFoundページに飛ばすために存在しないページにリライトする
      return NextResponse.rewrite(
        new URL('/404', request.url),
        {
          status: 404,
          statusText: 'Not Found',
        }
      )
    }
  }
  return NextResponse.next();
}
