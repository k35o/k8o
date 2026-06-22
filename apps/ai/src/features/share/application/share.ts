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
  entryUrl: string;
};

export type PublicShare = {
  title: string;
  slug: string;
  code: string;
  entryUrl: string;
};

// 公開する: 最新版を本物ビルドし、可視性を public にして公開版IDを記録する。
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
    entryUrl: shareProvider.entryUrl(project.slug),
  };
};

// 非公開に戻す: 可視性を private にし、公開バンドルを削除する。
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
  // DB を private にした時点で配信は止まる（アセットルートが可視性で権威付け）。バンドル削除は
  // ベストエフォート（失敗しても孤児が残るだけで配信はされない）。
  try {
    await shareProvider.remove(project.slug);
  } catch {
    // 孤児バンドルは GC 対象。配信は private で止まっているので無視する。
  }
  return true;
};

// アセット配信（認証なし）。ディスク存在ではなく DB の現在の可視性で権威付けする。
// 非公開化の部分失敗等で孤児バンドルが残っても、private なら配信しない（fail-closed）。
export const readPublicAsset = async (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> => {
  if (!(await isSlugPublic(slug))) {
    return null;
  }
  return readSharedAsset(slug, segments);
};

// 公開ページ用（認証なし）。slug から公開プロジェクトと配信ベースURLを返す。
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
    entryUrl: shareProvider.entryUrl(project.slug),
  };
};
