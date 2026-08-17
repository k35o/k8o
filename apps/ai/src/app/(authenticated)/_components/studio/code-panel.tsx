'use client';

import type { FC } from 'react';

import { useHighlightedCode } from '@/app/_components/highlighted-code';
import { highlightGenerated } from '@/features/highlight/interface/actions';

import { CodeView } from './code-view';

type CodePanelProps = {
  code: string | null;
  lang: 'json' | 'tsx';
  isStreaming: boolean;
};

export const CodePanel: FC<CodePanelProps> = ({ code, lang, isStreaming }) => {
  const highlighted = useHighlightedCode(
    code,
    isStreaming,
    lang,
    highlightGenerated,
  );
  return <CodeView code={code} highlighted={highlighted} />;
};
