import { verifyPassword } from '@/utils/auth/password';
import {
  createSession,
  createCSRFToken,
  getSessionCookieOptions,
  getCSRFCookieOptions,
} from '@/utils/auth/session';
import { checkRateLimit, RateLimitType } from '@/utils/ratelimit';
import { ipAddress } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ログインスキーマ
const loginSchema = z.object({
  username: z.string().min(1, 'ユーザー名は必須です'),
  password: z.string().min(1, 'パスワードは必須です'),
});

// 環境変数から管理者認証情報を取得
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = ipAddress(request) || 'unknown';
    const { success } = await checkRateLimit(ip, RateLimitType.AUTH);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    }

    // 管理者パスワードハッシュが設定されていない場合
    if (!ADMIN_PASSWORD_HASH) {
      console.error(
        'ADMIN_PASSWORD_HASH environment variable is not set',
      );
      return NextResponse.json(
        { error: 'Authentication is not properly configured' },
        { status: 500 },
      );
    }

    // リクエストボディのパース
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: result.error.errors,
        },
        { status: 400 },
      );
    }

    const { username, password } = result.data;

    // ユーザー名チェック
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // パスワード検証
    const isValidPassword = await verifyPassword(
      password,
      ADMIN_PASSWORD_HASH,
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // セッション作成
    const sessionToken = await createSession('admin', true);
    const csrfToken = await createCSRFToken();

    // クッキー設定
    const isSecure = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 },
    );

    response.cookies.set(
      'k8o-session',
      sessionToken,
      getSessionCookieOptions(isSecure),
    );
    response.cookies.set(
      'k8o-csrf-token',
      csrfToken,
      getCSRFCookieOptions(isSecure),
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
