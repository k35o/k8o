'use client';

import { CopyIcon, useClipboard, useToast } from '@k8o/arte-odyssey';
import { useRef } from 'react';
import type { ComponentProps, FC } from 'react';

type Props = ComponentProps<'pre'> & { 'data-lang'?: string };

export const CodeBlock: FC<Props> = ({
  children,
  'data-lang': lang,
  ...rest
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = async () => {
    const code = preRef.current?.querySelector('code');
    if (!code) return;
    // 注釈のコールアウト行はコピー対象から除外する
    const lines = code.querySelectorAll(
      '.line:not(.code-annotate-callout-line)',
    );
    const text =
      lines.length > 0
        ? Array.from(lines, (line) => line.textContent).join('\n')
        : code.textContent;
    try {
      await writeClipboard(text);
      onOpen('success', 'コードをコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <>
      <div className="code-annotate-toolbar">
        {lang !== undefined && (
          <span className="code-annotate-lang">{lang}</span>
        )}
        <button
          aria-label="コードをコピー"
          className="code-annotate-copy"
          onClick={() => {
            void handleCopy();
          }}
          type="button"
        >
          <CopyIcon size="sm" />
        </button>
      </div>
      <pre
        {...rest}
        className="writing-h vertical:box-border vertical:mx-4 vertical:h-max vertical:max-h-full vertical:max-w-container-lg vertical:overflow-auto my-0 overflow-x-auto rounded-t-none rounded-b-lg px-4 py-1 sm:py-4"
        ref={preRef}
      >
        {children}
      </pre>
    </>
  );
};
