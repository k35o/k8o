import { CODE_SURFACE } from '@repo/code-highlight/theme';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import type { FC } from 'react';

import { HighlightedTokens } from '@/app/_components/highlighted-code';

import styles from './code-view.module.css';

type CodeViewProps = {
  code: string | null;
  highlighted: HighlightedCode | null;
  emptyText: string;
};

export const CodeView: FC<CodeViewProps> = ({
  code,
  highlighted,
  emptyText,
}) => {
  if (code === null) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  // ハイライト取得前は暗色面を維持してプレーン表示（チラつき防止）。
  const surface = highlighted ?? CODE_SURFACE;
  return (
    <pre
      className={styles.code}
      style={{ backgroundColor: surface.bg, color: surface.fg }}
      // 枠を超える長いコードをキーボードでもスクロールできるよう、フォーカスできるようにする
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      {highlighted === null ? (
        <code>{code}</code>
      ) : (
        <HighlightedTokens highlighted={highlighted} />
      )}
    </pre>
  );
};
