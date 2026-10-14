import 'server-only';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { getProjectsForUser } from '../application/projects';
import type { ProjectListItem } from '../application/projects';
import { getSlidesProjectsForUser } from '../application/slides-projects';

// スタジオのサイドバーの一覧。ページの Server Component から読む。
// ページ側の verifySession が未許可を締め出すため、ここでは空を返すだけでよい。
// 取得失敗もスタジオ全体を error boundary に落とさず、サイドバー空のまま
// チャット等を使える状態に留める。
export const listProjectsForRoute = async (): Promise<ProjectListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  try {
    return await getProjectsForUser(session.userId);
  } catch (error) {
    console.error('プロジェクト一覧の取得に失敗しました', error);
    return [];
  }
};

export const listSlidesProjectsForRoute = async (): Promise<
  ProjectListItem[]
> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  try {
    return await getSlidesProjectsForUser(session.userId);
  } catch (error) {
    console.error('プロジェクト一覧の取得に失敗しました', error);
    return [];
  }
};
