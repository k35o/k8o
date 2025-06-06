import {
  getSessionFromRequest,
  refreshSession,
} from '@/utils/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          isAdmin: false,
          user: null,
        },
        { status: 200 },
      );
    }

    // セッション期限チェック
    if (Date.now() > session.expiresAt) {
      return NextResponse.json(
        {
          authenticated: false,
          isAdmin: false,
          user: null,
          error: 'Session expired',
        },
        { status: 401 },
      );
    }

    // セッション自動更新チェック
    const newSessionToken = await refreshSession(session);

    const response = NextResponse.json(
      {
        authenticated: true,
        isAdmin: session.isAdmin,
        user: {
          userId: session.userId,
          isAdmin: session.isAdmin,
        },
        sessionExpiresAt: session.expiresAt,
      },
      { status: 200 },
    );

    // 新しいセッショントークンがある場合はクッキーを更新
    if (newSessionToken) {
      const isSecure = process.env.NODE_ENV === 'production';
      response.cookies.set('k8o-session', newSessionToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24時間
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
