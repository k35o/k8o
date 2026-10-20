'use server';

import { refresh } from 'next/cache';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  changeSharedVersion,
  publishVersion,
  unpublish,
} from '../application/artifact-shares';
import type { SharedVersionChange } from '../application/artifact-shares';

// どの action も、書けなかったときも refresh() で描き直す。公開の状態は描いたときの props だけなので、
// 別のタブで変えたあとの古い画面は、描き直さないと実際の状態と食い違ったまま操作を続けさせてしまう

export const publishArtifactVersionAction = async (
  artifactId: string,
  version: number,
): Promise<{ slug: string } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  const published = await publishVersion({
    userId: session.userId,
    artifactId,
    version,
  });
  refresh();
  return published;
};

export const changeSharedVersionAction = async (
  artifactId: string,
  version: number,
): Promise<SharedVersionChange> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return 'failed';
  }
  const changed = await changeSharedVersion({
    userId: session.userId,
    artifactId,
    version,
  });
  refresh();
  return changed;
};

export const unpublishArtifactAction = async (
  artifactId: string,
): Promise<boolean> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return false;
  }
  const unpublished = await unpublish({ userId: session.userId, artifactId });
  refresh();
  return unpublished;
};
