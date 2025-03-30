import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    { message: 'Auth Required.' },
    {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    },
  );
}
