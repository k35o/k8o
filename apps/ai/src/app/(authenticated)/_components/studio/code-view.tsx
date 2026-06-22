import { CODE_SURFACE } from '@repo/code-highlight/theme';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { Fragment, type FC } from 'react';

type CodeViewProps = {
  code: string | null;
  highlighted: HighlightedCode | null;
};

// 単一フレーム内に置くコード表示。枠/見出しは親(Studio)が持つので、ここは中身だけ。
// shiki のトークンを React として描画する（色は token.color のインラインスタイル）。
export const CodeView: FC<CodeViewProps> = ({ code, highlighted }) => {
  if (code === null) {
    return (
      <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
        ここに生成された TSX が表示されます
      </div>
    );
  }

  // ストリーミング中やハイライト取得前はプレーン表示（暗色面は維持してチラつきを防ぐ）。
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
