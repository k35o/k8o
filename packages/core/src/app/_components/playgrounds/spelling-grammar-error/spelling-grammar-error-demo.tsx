import type { FC } from 'react';

export const SpellingGrammarErrorDemo: FC = () => {
  return (
    <div>
      <p
        contentEditable="plaintext-only"
        lang="en"
        spellCheck="true"
        suppressContentEditableWarning
      >
        Check a speling error and an grammar error.
      </p>
      <style>{`
        ::spelling-error {
          background-color: var(--color-bg-error);
          color: var(--color-fg-error);
          text-decoration-line: underline;
          text-decoration-style: wavy;
          text-decoration-color: var(--color-fg-error);
        }
        ::grammar-error {
          color: var(--color-fg-error);
          text-decoration-line: underline;
          text-decoration-style: dotted;
          text-decoration-color: var(--color-fg-error);
        }
      `}</style>
    </div>
  );
};
