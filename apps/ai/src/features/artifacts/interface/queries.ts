import 'server-only';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { findShareOf } from '../application/artifact-shares';
import type { ArtifactShare } from '../application/artifact-shares';
import { listArtifacts, loadArtifact } from '../application/artifacts';
import type {
  ArtifactListItem,
  LoadedArtifact,
} from '../application/artifacts';

export type { ArtifactShare } from '../application/artifact-shares';
export type {
  ArtifactListItem,
  LoadedArtifact,
} from '../application/artifacts';
export { versionFromParam } from '../application/artifacts';

export type ArtifactForRoute = LoadedArtifact & {
  share: ArtifactShare | null;
};

// 一覧が読めなくても、生成物のページそのものは使えるようにする
export const listArtifactsForRoute = async (): Promise<ArtifactListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  try {
    return await listArtifacts({ userId: session.userId });
  } catch (error) {
    console.error('生成物の一覧の取得に失敗しました', error);
    return [];
  }
};

export const loadArtifactForRoute = async (
  artifactId: string,
  version: number | null,
): Promise<ArtifactForRoute | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  const [artifact, share] = await Promise.all([
    loadArtifact({ artifactId, version, userId: session.userId }),
    findShareOf({ artifactId, userId: session.userId }),
  ]);
  return artifact === null ? null : { ...artifact, share };
};
