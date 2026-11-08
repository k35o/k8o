import 'server-only';
import { auth, isAllowedEmail } from '@repo/ai-database/auth';
import { headers } from 'next/headers';
import { cache } from 'react';

import { isAuthEnabled } from './auth-enabled';

// 許可リストはサインアップのときにしか評価されず、ALLOWED_EMAILS から外しても既存の
// セッションは生き続ける。そのため呼ぶたびに isAllowedEmail で評価し直す
export const getAllowedSession = cache(
  async (): Promise<{ userId: string } | null> => {
    if (!isAuthEnabled) {
      return { userId: 'local' };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !isAllowedEmail(session.user.email)) {
      return null;
    }

    return { userId: session.user.id };
  },
);
