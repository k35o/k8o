'use client';

import { CopyButton } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useRef } from 'react';
import type { ComponentProps, FC } from 'react';

type Props = ComponentProps<'pre'> & {
  'data-lang'?: string;
  'data-filename'?: string;
};

export const CodeBlock: FC<Props> = ({
  children,
  className,
  'data-lang': lang,
  'data-filename': filename,
  ...rest
}) => {
  const preRef = useRef<HTMLPreElement>(null);

  const readCode = (): string => {
    const code = preRef.current?.querySelector('code');
    if (!code) return '';
    // 注釈のコールアウト行はコピー対象から除外する
    const lines = code.querySelectorAll(
      '.line:not(.code-annotate-callout-line)',
    );
    return lines.length > 0
      ? Array.from(lines, (line) => line.textContent).join('\n')
      : code.textContent;
  };

  const label = filename ?? lang;

  return (
    <>
      {label !== undefined && (
        <span className="code-annotate-tab">{label}</span>
      )}
      <span className="code-annotate-copy">
        <CopyButton
          iconOnly
          label="コードをコピー"
          size="sm"
          value={readCode}
        />
      </span>
      <pre
        {...rest}
        className={cn(
          'writing-h vertical:box-border vertical:mx-4 vertical:h-max vertical:max-h-full vertical:max-w-container-lg vertical:overflow-auto my-0 overflow-x-auto text-sm leading-7',
          className,
        )}
        ref={preRef}
      >
        {children}
      </pre>
    </>
  );
};
