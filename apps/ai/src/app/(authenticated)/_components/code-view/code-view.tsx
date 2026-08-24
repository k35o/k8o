import { CODE_SURFACE } from '@repo/code-highlight/theme';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { Fragment } from 'react';
import type { FC } from 'react';

type CodeViewProps = {
  code: string | null;
  highlighted: HighlightedCode | null;
  emptyText?: string | undefined;
};

export const CodeView: FC<CodeViewProps> = ({
  code,
  highlighted,
  emptyText = 'ここに生成された TSX が表示されます',
}) => {
  if (code === null) {
    return (
      <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
        {emptyText}
      </div>
    );
  }

  // ハイライト取得前は暗色面を維持してプレーン表示（チラつき防止）。
  if (highlighted === null) {
    return (
      <pre
        className="h-full overflow-auto p-5 text-xs leading-relaxed"
        style={{ backgroundColor: CODE_SURFACE.bg, color: CODE_SURFACE.fg }}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <pre
      className="h-full overflow-auto p-5 text-xs leading-relaxed"
      style={{ backgroundColor: highlighted.bg, color: highlighted.fg }}
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
