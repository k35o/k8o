import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');
    const url = request.nextUrl;

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue ?? '').split(':');

      if (
        user === process.env.BASIC_AUTH_USER_NAME &&
        pwd === process.env.BASIC_AUTH_PASSWORD
      ) {
        return NextResponse.next();
      }
    }
    url.pathname = '/api/auth';

    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
