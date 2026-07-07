import 'server-only';
import {
  getProject,
  getPublicProjectBySlug,
  setVisibility,
} from '@/features/projects/application/projects';

import {
  countRecentServes,
  recordServe,
} from '../infrastructure/serve-usage-repository';
import { resolveServeWithCooldown } from './serve-cooldown';
import { gatedServe, shareServeLimit } from './serve-limit';
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

// 閲覧時に iframe へ出す配信 URL を解決する（Sandbox を起こして配信）。
// 未認証の公開経路なので二層で抑制する: (1) プロセス内 single-flight + 短期クールダウンで warm 中の
// 重複を吸収し、(2) 通過したものは DB のグローバル上限（クロスインスタンス）で cold start/起動の
// 絶対数を縛る。gatedServe を resolveServeWithCooldown に渡すことで、DB 評価・記録は「実際に
// serve する」呼び出しでのみ走る（warm な cache/in-flight ヒットはカウントしない）。
export const resolveShareEntry = async (
  slug: string,
): Promise<{ url: string } | null> => {
  const share = await getPublicShare(slug);
  if (share === null) {
    return null;
  }
  const url = await resolveServeWithCooldown(slug, () =>
    gatedServe({
      slug,
      now: Date.now(),
      limit: shareServeLimit(),
      countRecentServes,
      serve: () => shareProvider.serve(slug, share.code),
      recordServe,
    }),
  );
  if (url === null) {
    return null;
  }
  return { url };
};
