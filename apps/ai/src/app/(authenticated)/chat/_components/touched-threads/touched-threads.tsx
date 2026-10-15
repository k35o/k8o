'use client';

import { createContext, use, useMemo, useReducer } from 'react';
import type { FC, ReactNode } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';
import { withTouchedThreads } from '@/features/agent/application/touched-threads';

type TouchedThreads = {
  threads: ThreadListItem[];
  touch: (thread: ThreadListItem) => void;
};

const TouchedThreadsContext = createContext<TouchedThreads | null>(null);

const touchReducer = (
  current: ThreadListItem[],
  thread: ThreadListItem,
): ThreadListItem[] => withTouchedThreads(current, [thread]);

// チャットの一覧は移動で取り直されない layout に置いているので、このタブで送ったスレッドと
// 終わったスレッドをここに持って一覧に重ねる。画面が隠れても一覧に残すため、外す処理は作らない
export const TouchedThreadsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [threads, touch] = useReducer(touchReducer, []);
  const touched = useMemo(() => ({ threads, touch }), [threads]);
  return (
    <TouchedThreadsContext value={touched}>{children}</TouchedThreadsContext>
  );
};

export const useTouchedThreads = (): TouchedThreads => {
  const touched = use(TouchedThreadsContext);
  if (touched === null) {
    throw new Error(
      'useTouchedThreads は TouchedThreadsProvider の中で呼んでください',
    );
  }
  return touched;
};
