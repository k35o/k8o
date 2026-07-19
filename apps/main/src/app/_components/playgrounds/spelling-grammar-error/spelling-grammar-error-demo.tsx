import type { FC } from 'react';

export const SpellingGrammarErrorDemo: FC = () => (
  <div>
    <p
      aria-label="スペル・文法エラーを試す編集可能なテキスト"
      className="spelling-grammar-error-demo"
      contentEditable="plaintext-only"
      lang="en"
      spellCheck="true"
      suppressContentEditableWarning
    >
      Check a speling error and an grammar error.
    </p>
    {/* セレクタをデモの要素に限定し、ページ内の他の入力要素へスタイルが波及しないようにする */}
    <style>{`
        .spelling-grammar-error-demo::spelling-error {
          background-color: var(--color-bg-error);
          color: var(--color-fg-error);
          text-decoration-line: underline;
          text-decoration-style: wavy;
          text-decoration-color: var(--color-fg-error);
        }
        .spelling-grammar-error-demo::grammar-error {
          color: var(--color-fg-error);
          text-decoration-line: underline;
          text-decoration-style: dotted;
          text-decoration-color: var(--color-fg-error);
        }
      `}</style>
  </div>
);
