'use client';

import type { FC } from 'react';

import { useHighlightedCode } from '@/app/_components/highlighted-code';
import { highlightGenerated } from '@/features/highlight/interface/actions';

import { CodeView } from '../../../_components/studio/code-view';

type SourcePanelProps = {
  source: string | null;
  isStreaming: boolean;
};

export const SourcePanel: FC<SourcePanelProps> = ({ source, isStreaming }) => {
  const highlighted = useHighlightedCode(
    source,
    isStreaming,
    'markdown',
    highlightGenerated,
  );
  return (
    <CodeView
      code={source}
      emptyText="ここに生成されたスライドの Markdown が表示されます"
      highlighted={highlighted}
    />
  );
};
