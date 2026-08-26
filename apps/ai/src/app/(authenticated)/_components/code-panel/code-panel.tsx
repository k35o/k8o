'use client';

import type { FC } from 'react';

import { useHighlightedCode } from '@/app/_components/highlighted-code';
import { highlightGenerated } from '@/features/highlight/interface/actions';

import { CodeView } from '../code-view';

type CodePanelProps = {
  code: string | null;
  lang: 'json' | 'tsx' | 'markdown';
  isStreaming: boolean;
  emptyText?: string | undefined;
};

export const CodePanel: FC<CodePanelProps> = ({
  code,
  lang,
  isStreaming,
  emptyText,
}) => {
  const highlighted = useHighlightedCode(
    code,
    isStreaming,
    lang,
    highlightGenerated,
  );
  return (
    <CodeView code={code} emptyText={emptyText} highlighted={highlighted} />
  );
};
