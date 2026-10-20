import { CODE_SURFACE } from '@repo/code-highlight/theme';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { Fragment } from 'react';
import type { FC } from 'react';

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
  if (highlighted === null) {
    return (
      <pre
        className={styles.code}
        style={{ backgroundColor: CODE_SURFACE.bg, color: CODE_SURFACE.fg }}
        // 枠を超える長いコードをキーボードでもスクロールできるよう、フォーカスできるようにする
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <pre
      className={styles.code}
      style={{ backgroundColor: highlighted.bg, color: highlighted.fg }}
      // 枠を超える長いコードをキーボードでもスクロールできるよう、フォーカスできるようにする
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <code>
        {highlighted.tokens.map((line, lineIndex) => (
          <Fragment key={`line-${lineIndex.toString()}`}>
            {line.map((token, tokenIndex) => (
              <span
                key={`${lineIndex.toString()}-${tokenIndex.toString()}`}
                style={{ color: token.color ?? highlighted.fg }}
              >
                {token.content}
              </span>
            ))}
            {lineIndex < highlighted.tokens.length - 1 ? '\n' : null}
          </Fragment>
        ))}
      </code>
    </pre>
  );
};
