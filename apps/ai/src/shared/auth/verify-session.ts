import 'server-only';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { getAllowedSession } from './allowed-session';

export const verifySession = async (): Promise<void> => {
  // セッション入りの App Shell を作る runtime prerender では headers() が解決するが、
  // 未キャッシュの I/O は完了を待たれず打ち切られる。セッション照会もゲート後ろの
  // ページの DB 読みもそこで失敗するため、実際のリクエストまで進めない。
  await connection();

  if ((await getAllowedSession()) === null) {
    redirect('/sign-in');
  }
};
