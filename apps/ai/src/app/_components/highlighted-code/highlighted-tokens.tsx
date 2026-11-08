import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { Fragment } from 'react';
import type { FC } from 'react';

export const HighlightedTokens: FC<{ highlighted: HighlightedCode }> = ({
  highlighted,
}) => (
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
);
