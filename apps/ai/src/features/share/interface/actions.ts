'use server';

import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  publishProject,
  type PublishedShare,
  unpublishProject,
} from '../application/share';

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
