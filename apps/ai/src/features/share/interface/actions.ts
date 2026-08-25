'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { publishProject, unpublishProject } from '../application/share';
import type { PublishedShare } from '../application/share';
import { shareCacheTag } from './queries';

export const publishProjectAction = async (
  projectId: number,
): Promise<PublishedShare | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  const res = await publishProject({ userId: session.userId, projectId });
  if (res !== null) {
    updateTag(shareCacheTag(res.slug));
  }
  return res;
};

export const unpublishProjectAction = async (
  projectId: number,
): Promise<boolean> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return false;
  }
  const res = await unpublishProject({ userId: session.userId, projectId });
  if (res === null) {
    return false;
  }
  updateTag(shareCacheTag(res.slug));
  return true;
};
