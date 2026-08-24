import 'server-only';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { getProjectsForUser } from '../application/projects';
import type { ProjectListItem } from '../application/projects';
import { getSlidesProjectsForUser } from '../application/slides-projects';

// スタジオ初期表示のサイドバー一覧。ページの Server Component から読み、
// マウント後の Server Action（POST）往復を待たずに一覧を出す。
// ページ側の verifySession が未許可を締め出すため、ここでは空を返すだけでよい。
export const listProjectsForRoute = async (): Promise<ProjectListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  return getProjectsForUser(session.userId);
};

export const listSlidesProjectsForRoute = async (): Promise<
  ProjectListItem[]
> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  return getSlidesProjectsForUser(session.userId);
};
