import 'server-only';
import { randomUUID } from 'node:crypto';

import type { AiApp } from '@repo/database/schema';

import type { GenerationMeta } from '@/features/generation/application/parse-meta';

import {
  insertProjectWithVersion,
  insertVersion,
  type ProjectListItem,
  projectOwnedBy,
  selectProjects,
  selectProjectVersions,
  selectProjectWithLatestVersion,
} from '../infrastructure/project-repository';

// 版の content に共通で入る形。アプリごとの本体（code / source など）はこれに足す。
export type ProjectContent = {
  meta: GenerationMeta;
  // 初版/フォークでは prompt が無いことがある。
  prompt?: string;
};

export type ConversationTurn = {
  prompt: string | null;
  meta: GenerationMeta;
};

export type LoadedProjectRecord<TContent extends ProjectContent> = {
  id: number;
  title: string;
  slug: string;
  versionId: number;
  content: TContent;
  // 古い順の全ターン（チャット復元用）。
  conversation: ConversationTurn[];
};

// 公開リンク用の一意 slug（/s/[slug]）。衝突確率は無視できる程度に小さい。
const generateSlug = (): string =>
  randomUUID().replaceAll('-', '').slice(0, 12);

// app 判別子で同じテーブルに相乗りする各 AI アプリの保存/読込を共通化する。
// content の形はアプリごとに違うため、parse をアプリ側から注入する。
export const createProjectStore = <TContent extends ProjectContent>(config: {
  app: AiApp;
  fallbackTitle: string;
  parseContent: (value: unknown) => TContent | null;
}) => {
  const deriveTitle = (title: string): string => {
    const trimmed = title.trim();
    return trimmed === '' ? config.fallbackTitle : trimmed;
  };

  // projectId が null なら新規プロジェクト＋初版、そうでなければ版を追記。
  const saveGeneration = async (input: {
    userId: string;
    projectId: number | null;
    parentVersionId: number | null;
    content: TContent;
  }): Promise<{
    projectId: number;
    versionId: number;
    title: string;
  } | null> => {
    if (input.projectId === null) {
      const title = deriveTitle(input.content.meta.title);
      const { projectId, versionId } = await insertProjectWithVersion({
        userId: input.userId,
        app: config.app,
        title,
        slug: generateSlug(),
        content: input.content,
      });
      return { projectId, versionId, title };
    }

    // 非所有/不存在は他の action と同様に null を返す（呼び出し側でハンドル済み）。
    const owned = await projectOwnedBy({
      projectId: input.projectId,
      userId: input.userId,
    });
    if (!owned) {
      return null;
    }
    const { versionId } = await insertVersion({
      projectId: input.projectId,
      parentId: input.parentVersionId,
      content: input.content,
    });
    return {
      projectId: input.projectId,
      versionId,
      title: deriveTitle(input.content.meta.title),
    };
  };

  const getProjectsForUser = (userId: string): Promise<ProjectListItem[]> =>
    selectProjects({ userId, app: config.app });

  const getProject = async (input: {
    userId: string;
    projectId: number;
  }): Promise<LoadedProjectRecord<TContent> | null> => {
    const row = await selectProjectWithLatestVersion({
      projectId: input.projectId,
      userId: input.userId,
    });
    if (row === null) {
      return null;
    }
    const content = config.parseContent(row.content);
    if (content === null) {
      return null;
    }
    // 所有者は selectProjectWithLatestVersion で確認済み。
    const versionRows = await selectProjectVersions({
      projectId: input.projectId,
    });
    const conversation = versionRows.flatMap((version): ConversationTurn[] => {
      const parsed = config.parseContent(version.content);
      return parsed === null
        ? []
        : [{ prompt: parsed.prompt ?? null, meta: parsed.meta }];
    });
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      versionId: row.versionId,
      content,
      conversation,
    };
  };

  // 最新版を複製して新プロジェクト（forkOf 付き・private）を作る。非所有なら null。
  // 必要なのは最新版のコンテンツだけなので、getProject と違い全版（会話履歴）は読まない。
  const forkProject = async (input: {
    userId: string;
    sourceProjectId: number;
  }): Promise<{ projectId: number } | null> => {
    const row = await selectProjectWithLatestVersion({
      projectId: input.sourceProjectId,
      userId: input.userId,
    });
    if (row === null) {
      return null;
    }
    const content = config.parseContent(row.content);
    if (content === null) {
      return null;
    }
    // フォークは指示（prompt）から生まれた版ではないので prompt は引き継がない。
    const { prompt: _prompt, ...forkContent } = content;
    const { projectId } = await insertProjectWithVersion({
      userId: input.userId,
      app: config.app,
      title: `${row.title}（フォーク）`,
      slug: generateSlug(),
      content: forkContent,
      forkOf: input.sourceProjectId,
    });
    return { projectId };
  };

  return { saveGeneration, getProjectsForUser, getProject, forkProject };
};
