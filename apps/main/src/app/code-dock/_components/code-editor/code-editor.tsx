'use client';

import { FormControl } from '@k8o/arte-odyssey';
import type {
  HighlightedCode,
  HighlightTheme,
} from '@repo/code-highlight/tokenize';
import { Fragment, useState } from 'react';
import type { FC, ReactNode, Ref } from 'react';

import type { LintLanguage } from '@/features/code-dock/interface/types';

import { useHighlightedCode } from './use-highlighted-code';

type Props = {
  value: string;
  language: LintLanguage;
  theme: HighlightTheme;
  onChange: (value: string) => void;
  /** 整形結果の反映などで textarea を直接操作するための ref */
  textareaRef?: Ref<HTMLTextAreaElement>;
};

// pre (表示) と textarea (入力) の文字メトリクスを完全に一致させるための共通クラス
const TEXT_CLASS =
  'p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words [tab-size:2]';

// textarea は preflight の `textarea { font-family: inherit }` によりサイト既定の
// sans-serif になり font-mono クラスが効かない。プロポーショナルだと透明文字
// (=キャレット) が monospace の pre とズレるため、両者にインラインで monospace を
// 強制して文字幅を一致させる
const MONO_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// shiki の plastic (dark) / one-light (light) の面色を CSS のテーマクラスで与える。
// JS のインラインで描くと SSR ではテーマ不明でフォールバック色になり、リロード時に
// 一瞬見えてしまう。next-themes がハイドレーション前に付ける .dark クラスに追従する
// CSS なら初回描画から正しい色になり、フラッシュもハイドレーション不一致も起きない。
const SURFACE_BG = 'bg-[#fafafa] dark:bg-[#21252b]';
const SURFACE_TEXT = 'text-[#383a42] dark:text-[#a9b2c3]';
const SURFACE_CARET = 'caret-[#383a42] dark:caret-[#a9b2c3]';

const renderTokens = (highlighted: HighlightedCode): ReactNode =>
  highlighted.tokens.map((line, lineIndex) => (
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
  ));

export const CodeEditor: FC<Props> = ({
  value,
  language,
  theme,
  onChange,
  textareaRef,
}) => {
  const { tokens, ready } = useHighlightedCode(value, language, theme);
  // IME 変換中は透明文字だと未確定文字列が見えないため、textarea 側を可視化する
  const [isComposing, setIsComposing] = useState(false);
  // 初回ハイライト前はプレーンなコードを見せない (色が付いてから表示する)。
  // 高さは visibility:hidden で保持されるためレイアウトのガタつきは起きない。
  const hideText = isComposing || !ready;

  return (
    <FormControl
      helpText="入力するとハイライトと検査が自動で反映されます"
      label="コード"
      renderInput={({
        'aria-describedby': ariaDescribedby,
        'aria-labelledby': _,
        disabled,
        id,
        invalid,
        required,
      }) => (
        <div
          className={`${SURFACE_BG} focus-within:ring-primary-border max-h-[60svh] min-h-48 overflow-auto rounded-xl focus-within:ring-2`}
        >
          <div className="relative min-h-full">
            <pre
              aria-hidden
              className={`${TEXT_CLASS} ${SURFACE_TEXT}`}
              style={{
                fontFamily: MONO_FONT_FAMILY,
                visibility: hideText ? 'hidden' : undefined,
              }}
            >
              <code>{tokens === null ? value : renderTokens(tokens)}</code>
              {/* 末尾が改行のとき textarea だけ 1 行高くなるのを防ぐ */}
              {value.endsWith('\n') ? ' ' : null}
            </pre>
            <textarea
              aria-describedby={ariaDescribedby}
              aria-invalid={invalid || undefined}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className={`absolute inset-0 size-full resize-none overflow-hidden bg-transparent outline-none ${TEXT_CLASS} ${SURFACE_CARET} ${isComposing ? SURFACE_TEXT : 'text-transparent'}`}
              disabled={disabled}
              id={id}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              onCompositionEnd={() => {
                setIsComposing(false);
              }}
              onCompositionStart={() => {
                setIsComposing(true);
              }}
              ref={textareaRef}
              required={required}
              spellCheck={false}
              style={{ fontFamily: MONO_FONT_FAMILY }}
              // 非制御にする。React が value を再セットしないため、遅延/トランジ
              // ションの再レンダーでもキャレットが末尾へ飛ばない。表示用の値は
              // onChange 経由で親の state に同期し、整形時のみ ref で DOM を書く
              defaultValue={value}
            />
          </div>
        </div>
      )}
    />
  );
};
