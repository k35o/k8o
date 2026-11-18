'use client';

import { createContext, use, useEffect, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { GenerationModel } from '@/shared/claude/models';

export type OpeningThread = {
  id: string;
  title: string;
  model: GenerationModel | null;
};

type Opening = {
  thread: OpeningThread | null;
  open: (thread: OpeningThread) => void;
  forget: () => void;
};

const OpeningThreadContext = createContext<Opening | null>(null);

export const OpeningThreadProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [thread, setThread] = useState<OpeningThread | null>(null);

  // 選んだ会話を開けずに終わると印が残るので、戻る・進むで別の会話を読み込むあいだにそのタイトルを出さないよう外す
  useEffect(() => {
    const forgetOnHistory = (): void => {
      setThread(null);
    };
    window.addEventListener('popstate', forgetOnHistory);
    return () => {
      window.removeEventListener('popstate', forgetOnHistory);
    };
  }, []);

  const opening = useMemo(
    (): Opening => ({
      thread,
      open: setThread,
      forget: () => {
        setThread(null);
      },
    }),
    [thread],
  );
  return (
    <OpeningThreadContext value={opening}>{children}</OpeningThreadContext>
  );
};

export const useOpeningThread = (): Opening => {
  const opening = use(OpeningThreadContext);
  if (opening === null) {
    throw new Error(
      'useOpeningThread は OpeningThreadProvider の中で呼んでください',
    );
  }
  return opening;
};
