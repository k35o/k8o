'use server';

import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  publishProject,
  type PublishedShare,
  resolveShareEntry,
  unpublishProject,
} from '../application/share';

// 公開ページ（/s/[slug]）の iframe 配信 URL を解決する。公開コンテンツなので認証なし。
export const resolveShareEntryAction = async (
  slug: string,
): Promise<{ url: string } | null> => {
  const entry = await resolveShareEntry(slug);
  return entry;
};

export const publishProjectAction = async (
  projectId: number,
): Promise<PublishedShare | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return publishProject({ userId: session.userId, projectId });
};

export const unpublishProjectAction = async (
  projectId: number,
): Promise<boolean> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return false;
  }
  return unpublishProject({ userId: session.userId, projectId });
};
