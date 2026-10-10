import 'server-only';
import { auth, isAllowedEmail } from '@repo/database/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { isAuthEnabled } from './auth-enabled';

export const verifySession = async (): Promise<void> => {
  // セッション入りの App Shell を作る runtime prerender では headers() が解決するが、
  // 未キャッシュの I/O は完了を待たれず打ち切られる。セッション照会もゲート後ろの
  // ページの DB 読みもそこで失敗するため、実際のリクエストまで進めない。
  await connection();

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
