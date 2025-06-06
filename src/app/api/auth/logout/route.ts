import { getSessionFromRequest } from '@/utils/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // セッション確認（ログイン状態チェック）
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 },
      );
    }

    // ログアウト処理（クッキー削除）
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 },
    );

    // セッションクッキーとCSRFトークンクッキーを削除
    response.cookies.set('k8o-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('k8o-csrf-token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
