import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development',
);

const SESSION_COOKIE_NAME = 'k8o-session';
const CSRF_COOKIE_NAME = 'k8o-csrf-token';

export type SessionData = {
  userId: string;
  isAdmin: boolean;
  issuedAt: number;
  expiresAt: number;
}

export type CSRFTokenData = {
  token: string;
  issuedAt: number;
  expiresAt: number;
}

// セッション有効期限（24時間）
const SESSION_DURATION = 24 * 60 * 60 * 1000;
// CSRF トークン有効期限（1時間）
const CSRF_DURATION = 60 * 60 * 1000;

/**
 * セッションJWTを作成
 */
export async function createSession(
  userId: string,
  isAdmin = false,
): Promise<string> {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION;

  const sessionData: SessionData = {
    userId,
    isAdmin,
    issuedAt: now,
    expiresAt,
  };

  return await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(JWT_SECRET);
}

/**
 * セッションJWTを検証
 */
export async function verifySession(
  token: string,
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * CSRFトークンを生成
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * CSRFトークンJWTを作成
 */
export async function createCSRFToken(): Promise<string> {
  const now = Date.now();
  const expiresAt = now + CSRF_DURATION;
  const token = generateCSRFToken();

  const csrfData: CSRFTokenData = {
    token,
    issuedAt: now,
    expiresAt,
  };

  return await new SignJWT(csrfData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(JWT_SECRET);
}

/**
 * CSRFトークンJWTを検証
 */
export async function verifyCSRFToken(
  token: string,
): Promise<CSRFTokenData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as CSRFTokenData;
  } catch (error) {
    console.error('CSRF token verification failed:', error);
    return null;
  }
}

/**
 * リクエストからセッションを取得
 */
export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionData | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }

  return await verifySession(sessionCookie.value);
}

/**
 * サーバーコンポーネント用のセッション取得
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  return await verifySession(sessionCookie.value);
}

/**
 * 管理者権限チェック
 */
export async function requireAdminSession(): Promise<SessionData> {
  const session = await getSession();

  if (!session?.isAdmin) {
    throw new Error('Admin access required');
  }

  // セッション期限チェック
  if (Date.now() > session.expiresAt) {
    throw new Error('Session expired');
  }

  return session;
}

/**
 * セッションクッキーのオプション
 */
export const getSessionCookieOptions = (secure = true) => ({
  httpOnly: true,
  secure,
  sameSite: 'strict' as const,
  maxAge: SESSION_DURATION / 1000,
  path: '/',
});

/**
 * CSRFトークンクッキーのオプション
 */
export const getCSRFCookieOptions = (secure = true) => ({
  httpOnly: false, // JavaScript からアクセス可能にする
  secure,
  sameSite: 'strict' as const,
  maxAge: CSRF_DURATION / 1000,
  path: '/',
});

/**
 * セッションを削除（ログアウト）
 */
export function clearSessionCookies() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/**
 * セッション更新（自動延長）
 */
export async function refreshSession(
  currentSession: SessionData,
): Promise<string | null> {
  // セッションが残り時間6時間以下の場合に更新
  const remainingTime = currentSession.expiresAt - Date.now();
  const shouldRefresh = remainingTime < 6 * 60 * 60 * 1000; // 6時間

  if (shouldRefresh) {
    return await createSession(
      currentSession.userId,
      currentSession.isAdmin,
    );
  }

  return null;
}
