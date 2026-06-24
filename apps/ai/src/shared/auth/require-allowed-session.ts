import 'server-only';
import { auth, isAllowedEmail } from '@repo/database/auth';

import { isAuthEnabled } from './auth-enabled';

// 課金が発生する API route / server action の先頭で呼ぶゲート。
// verify-session.ts と異なり redirect せず、許可されない場合は null を返す
// （呼び出し側で 401 を返すこと）。middleware は /api を守らないため、
// Fugu / Vercel Sandbox を叩く境界では必ずこのゲートを通す。
export const requireAllowedSession = async (
  requestHeaders: Headers,
): Promise<{ userId: string } | null> => {
  if (!isAuthEnabled) {
    return { userId: 'local' };
  }

  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session || !isAllowedEmail(session.user.email)) {
    return null;
  }

  return { userId: session.user.id };
};
