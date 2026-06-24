import 'server-only';
import {
  getProject,
  getPublicProjectBySlug,
  isSlugPublic,
  setVisibility,
} from '@/features/projects/application/projects';

import { readSharedAsset } from '../infrastructure/local-build';
import { shareProvider } from './share-provider';

export type PublishedShare = {
  slug: string;
};

export type PublicShare = {
  title: string;
  slug: string;
  code: string;
};

export const publishProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<PublishedShare | null> => {
  const project = await getProject({
    userId: input.userId,
    projectId: input.projectId,
  });
  if (project === null) {
    return null;
  }
  await shareProvider.build(project.slug, project.code);
  const ok = await setVisibility({
    userId: input.userId,
    projectId: input.projectId,
    visibility: 'public',
    publishedVersionId: project.versionId,
  });
  if (!ok) {
    return null;
  }
  return {
    slug: project.slug,
  };
};

export const unpublishProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<boolean> => {
  const project = await getProject({
    userId: input.userId,
    projectId: input.projectId,
  });
  if (project === null) {
    return false;
  }
  const ok = await setVisibility({
    userId: input.userId,
    projectId: input.projectId,
    visibility: 'private',
    publishedVersionId: null,
  });
  if (!ok) {
    return false;
  }
  // DB を private にした時点で配信は止まる。バンドル削除は失敗しても孤児が残るだけなので
  // ベストエフォート。
  try {
    await shareProvider.remove(project.slug);
  } catch {
    // 孤児バンドルは GC 対象。
  }
  return true;
};

// アセット配信（認証なし）。ディスク存在ではなく DB の現在の可視性で権威付けする
// （孤児バンドルが残っても private なら配信しない: fail-closed）。
export const readPublicAsset = async (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> => {
  if (!(await isSlugPublic(slug))) {
    return null;
  }
  return readSharedAsset(slug, segments);
};

export const getPublicShare = async (
  slug: string,
): Promise<PublicShare | null> => {
  const project = await getPublicProjectBySlug(slug);
  if (project === null) {
    return null;
  }
  return {
    title: project.title,
    slug: project.slug,
    code: project.code,
  };
};

// 閲覧時に iframe へ出す配信 URL を解決する（Sandbox モードでは Sandbox を起こして配信）。
export const resolveShareEntry = async (
  slug: string,
): Promise<{ url: string } | null> => {
  const share = await getPublicShare(slug);
  if (share === null) {
    return null;
  }
  const url = await shareProvider.serve(slug, share.code);
  return { url };
};
