'use client';

import type { FC } from 'react';

import { CodeView } from '../../../_components/studio/code-view';
import { useHighlightedCode } from '../../../_components/studio/use-highlighted-code';

type SourcePanelProps = {
  source: string | null;
  isStreaming: boolean;
};

export const SourcePanel: FC<SourcePanelProps> = ({ source, isStreaming }) => {
  const highlighted = useHighlightedCode(source, isStreaming, 'markdown');
  return (
    <CodeView
      code={source}
      emptyText="ここに生成されたスライドの Markdown が表示されます"
      highlighted={highlighted}
    />
  );
};
