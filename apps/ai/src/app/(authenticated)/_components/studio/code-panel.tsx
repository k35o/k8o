'use client';

import type { FC } from 'react';

import { CodeView } from './code-view';
import { useHighlightedCode } from './use-highlighted-code';

// コードパネル関連の部品をまとめて再エクスポート（Studio 側の import 元を 1 モジュールに集約）。
export { CopyCodeButton } from './copy-code-button';

type CodePanelProps = {
  code: string | null;
  isStreaming: boolean;
};

// コード表示の結線役。ハイライト取得（サーバアクション）を hook で持ち、表示は presentational な
// CodeView に委ねる。CodeView を純粋に保つことで Storybook 単体テストを可能にする。
export const CodePanel: FC<CodePanelProps> = ({ code, isStreaming }) => {
  const highlighted = useHighlightedCode(code, isStreaming);
  return <CodeView code={code} highlighted={highlighted} />;
};
