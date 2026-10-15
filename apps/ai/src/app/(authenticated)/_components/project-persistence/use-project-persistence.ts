'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import type { GenerationMeta } from '@/features/generation/application/parse-meta';

import { createProjectHeading } from './project-heading';

type SaveResult = {
  projectId: number;
  versionId: number;
  title: string;
} | null;

type PersistenceActions<TContent> = {
  save: (
    input: TContent & {
      projectId: number | null;
      parentVersionId: number | null;
      meta: GenerationMeta;
      prompt: string;
    },
  ) => Promise<SaveResult>;
  fork: (sourceProjectId: number) => Promise<{ projectId: number } | null>;
};

export type ProjectPersistence<TContent> = {
  projectId: number | null;
  projectTitle: string | null;
  currentVersionId: number | null;
  save: (
    content: TContent & { meta: GenerationMeta; prompt: string },
  ) => Promise<void>;
  // URL に追従して読み込みを始める。返す関数は、読み込みを待つあいだに別の移動が無かったか
  // （読み込んだ結果を当てはめてよいか）を返す
  startLoading: (projectId: number) => () => boolean;
  // 既に読み込み済みのプロジェクトを現在の選択として確定する（再フェッチしない）。
  // 読み込めなかった（null）なら、今のプロジェクトにとどまる。
  markLoaded: (
    project: {
      id: number;
      versionId: number;
      title: string;
    } | null,
  ) => void;
  fork: (sourceProjectId: number) => Promise<void>;
  reset: () => void;
  // URL がこのプロジェクトを指したときに、もう向かっていて追従しなくてよいか
  isHeadingTo: (projectId: number | null) => boolean;
};

// 保存と fork は画面を離れたあとに返ることがあり、隠れたスタジオから URL を変えると
// 移った先の画面から連れ戻してしまうので、このスタジオの URL にいるときだけ変える。
const isOnStudio = (basePath: '/' | '/slides'): boolean =>
  window.location.pathname === basePath;

// UI/スライド両スタジオ共通のプロジェクト永続化。サーバー側の createProjectStore と
// 同じ構図で、アプリ差分（呼ぶ action と保存 content の型）はパラメータで注入する。
// actions はモジュールスコープの定数を渡すこと。
// projectId / version は ref で持ち、useChat の onFinish のような一度きりの
// クロージャから最新値を参照する（stale 回避）。
export const useProjectPersistence = <TContent>(
  actions: PersistenceActions<TContent>,
  basePath: '/' | '/slides',
): ProjectPersistence<TContent> => {
  const router = useRouter();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null);
  const projectIdRef = useRef<number | null>(null);
  const versionIdRef = useRef<number | null>(null);
  const headingRef = useRef(createProjectHeading());

  const setCurrent = useCallback(
    (id: number | null, versionId: number | null, title: string | null) => {
      projectIdRef.current = id;
      versionIdRef.current = versionId;
      setProjectId(id);
      setProjectTitle(title);
      setCurrentVersionId(versionId);
    },
    [],
  );

  const save = useCallback(
    async (content: TContent & { meta: GenerationMeta; prompt: string }) => {
      const savingTo = projectIdRef.current;
      const stayed = headingRef.current.stayAt(savingTo);
      const res = await actions.save({
        ...content,
        projectId: savingTo,
        parentVersionId: versionIdRef.current,
      });
      // 保存を待つあいだに別のプロジェクトへ移っていたら（読み込みの途中で保存を始めたときも）、
      // 移った先を上書きしないよう結果を捨てる
      if (res === null || !stayed()) {
        return;
      }
      setCurrent(res.projectId, res.versionId, res.title);
      if (savingTo === null) {
        // URL が新しい id を指しても、追従して読み込み直さないようにする
        headingRef.current.moveTo(res.projectId);
        if (isOnStudio(basePath)) {
          router.replace(`${basePath}?project=${res.projectId.toString()}`);
        }
      }
    },
    [actions, basePath, router, setCurrent],
  );

  const startLoading = useCallback(
    (loadingId: number): (() => boolean) =>
      headingRef.current.moveTo(loadingId),
    [],
  );

  const markLoaded = useCallback(
    (
      project: { id: number; versionId: number; title: string } | null,
    ): void => {
      if (project === null) {
        headingRef.current.moveTo(projectIdRef.current);
        return;
      }
      setCurrent(project.id, project.versionId, project.title);
    },
    [setCurrent],
  );

  const fork = useCallback(
    async (sourceProjectId: number): Promise<void> => {
      const stayed = headingRef.current.stayAt(sourceProjectId);
      const res = await actions.fork(sourceProjectId);
      // fork を待つあいだに別のプロジェクトへ移っていたら、移った先から連れ戻さない
      if (res === null || !stayed() || !isOnStudio(basePath)) {
        return;
      }
      router.push(`${basePath}?project=${res.projectId.toString()}`);
    },
    [actions, basePath, router],
  );

  const reset = useCallback(() => {
    headingRef.current.moveTo(null);
    setCurrent(null, null, null);
  }, [setCurrent]);

  const isHeadingTo = useCallback(
    (headingId: number | null): boolean =>
      headingRef.current.isHeadingTo(headingId),
    [],
  );

  return {
    projectId,
    projectTitle,
    currentVersionId,
    save,
    startLoading,
    markLoaded,
    fork,
    reset,
    isHeadingTo,
  };
};
