import 'server-only';
import type { Spec } from '@json-render/core';

import {
  getProjectLatest,
  getPublicProjectBySlug,
  setVisibility,
} from '@/features/projects/application/projects';

export type PublishedShare = {
  slug: string;
};

export type PublicShare = {
  title: string;
  slug: string;
  spec: Spec;
};

// 公開は「公開フラグ + 公開版 ID」を立てるだけ。spec は DB にあり、
// /s/[slug] が読み出してその場で描画する（ビルドや配信基盤は無い）。
export const publishProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<PublishedShare | null> => {
  // 必要なのは最新版 ID と slug だけなので、会話履歴まで読む getProject は使わない。
  const latest = await getProjectLatest({
    userId: input.userId,
    projectId: input.projectId,
  });
  if (latest === null) {
    return null;
  }
  const ok = await setVisibility({
    userId: input.userId,
    projectId: input.projectId,
    visibility: 'public',
    publishedVersionId: latest.versionId,
  });
  if (!ok) {
    return null;
  }
  return {
    slug: latest.slug,
  };
};

// private にした時点で /s/[slug] は 404 になる。非所有/不存在は setVisibility が
// 所有チェックで false を返す。slug は公開キャッシュのタグ無効化に使うため返す。
export const unpublishProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<PublishedShare | null> => {
  const latest = await getProjectLatest({
    userId: input.userId,
    projectId: input.projectId,
  });
  if (latest === null) {
    return null;
  }
  const ok = await setVisibility({
    userId: input.userId,
    projectId: input.projectId,
    visibility: 'private',
    publishedVersionId: null,
  });
  return ok ? { slug: latest.slug } : null;
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
    spec: project.spec,
  };
};
