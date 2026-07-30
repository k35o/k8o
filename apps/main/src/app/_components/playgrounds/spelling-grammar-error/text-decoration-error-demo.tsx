import type { FC } from 'react';

const APPLIED_CSS = `.spelling {
  text-decoration-line: spelling-error;
}

.grammar {
  text-decoration-line: grammar-error;
}`;

export const TextDecorationErrorDemo: FC = () => (
  <div className="flex flex-col gap-3">
    <p className="text-decoration-error-demo" lang="ja">
      この文章では
      <span className="spelling">誤字っぽく見せたい部分</span>と
      <span className="grammar">文法が怪しく見せたい部分</span>
      を、ブラウザ標準のエラー表示と同じ装飾で描いています。
    </p>
    <pre className="bg-bg-mute text-fg-mute sm:text-md overflow-x-auto rounded-lg px-2 py-1 text-xs sm:p-4">
      <code>{APPLIED_CSS}</code>
    </pre>
    {/* セレクタをデモの要素に限定し、ページ内の他要素へスタイルが波及しないようにする */}
    <style>{`
        .text-decoration-error-demo .spelling {
          text-decoration-line: spelling-error;
        }
        .text-decoration-error-demo .grammar {
          text-decoration-line: grammar-error;
        }
      `}</style>
  </div>
);
