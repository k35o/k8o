import 'server-only';
import { auth, isAllowedEmail } from '@repo/database/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { isAuthEnabled } from './auth-enabled';

export const verifySession = async (): Promise<void> => {
  if (!isAuthEnabled) {
    return;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  // 許可リストはサインアップ時のみ評価され、既存セッションは ALLOWED_EMAILS から
  // 外しても生き続ける（失効ギャップ）。検証のたびに再評価して締め出す。
  if (!isAllowedEmail(session.user.email)) {
    redirect('/sign-in');
  }
};
