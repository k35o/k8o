'use client';

import type { FC } from 'react';

import { CodeView } from './code-view';
import { useHighlightedCode } from './use-highlighted-code';

export { CopyCodeButton } from './copy-code-button';

type CodePanelProps = {
  code: string | null;
  isStreaming: boolean;
};

export const CodePanel: FC<CodePanelProps> = ({ code, isStreaming }) => {
  const highlighted = useHighlightedCode(code, isStreaming);
  return <CodeView code={code} highlighted={highlighted} />;
};
