'use client';

import {
  Alert,
  Button,
  CopyIcon,
  FormControl,
  Select,
  useClipboard,
  useDebouncedTransition,
  useToast,
} from '@k8o/arte-odyssey';
import type { HighlightTheme } from '@repo/code-highlight/tokenize';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import {
  DEFAULT_SAMPLE_CODE,
  DEFAULT_SAMPLE_LANGUAGE,
} from '@/features/code-dock/interface/default-sample';
import { isLintLanguage } from '@/features/code-dock/interface/types';
import type {
  FormatCodeResult,
  LintCodeResult,
  LintDiagnostic,
  LintLanguage,
} from '@/features/code-dock/interface/types';

import { CodeEditor } from '../code-editor';
import { DiagnosticList } from '../diagnostic-list';

// server action は直接 import せず props で受け取る (Storybook をバイナリに依存させない)
export type LintAction = (
  code: string,
  language: string,
) => Promise<LintCodeResult>;
export type FormatAction = (
  code: string,
  language: string,
) => Promise<FormatCodeResult>;

type Props = {
  lintAction: LintAction;
  formatAction: FormatAction;
  // page.tsx がサーバー側でキャッシュした初期サンプルの診断結果。渡された場合は
  // マウント時の再検査を省略する（未指定＝Storybook 等では従来どおり検査する）
  initialDiagnostics?: LintDiagnostic[] | null;
};

const LANGUAGE_OPTIONS = [
  { label: 'TSX', value: 'tsx' },
  { label: 'TS', value: 'ts' },
  { label: 'JSX', value: 'jsx' },
  { label: 'JS', value: 'js' },
] as const;

const LINT_DEBOUNCE_MS = 600;

export const CodeDock: FC<Props> = ({
  lintAction,
  formatAction,
  initialDiagnostics,
}) => {
  const [code, setCode] = useState(DEFAULT_SAMPLE_CODE);
  const [language, setLanguage] = useState<LintLanguage>(
    DEFAULT_SAMPLE_LANGUAGE,
  );
  const [diagnostics, setDiagnostics] = useState<LintDiagnostic[] | null>(
    initialDiagnostics ?? null,
  );
  const [lintError, setLintError] = useState<string | null>(null);
  const [isLinting, dispatchLint] = useDebouncedTransition(LINT_DEBOUNCE_MS);
  // 初期サンプルの診断結果を props で受け取っている場合、マウント直後の再検査は
  // 不要なので最初の effect を 1 度だけスキップする
  const shouldSkipInitialLint = useRef(Array.isArray(initialDiagnostics));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { resolvedTheme } = useTheme();
  // コードのハイライトはアプリのテーマに合わせる (light は one-light、それ以外は
  // plastic)。テーマ解決前 (SSR 直後) は dark 想定の plastic にフォールバック
  const highlightTheme: HighlightTheme =
    resolvedTheme === 'light' ? 'one-light' : 'plastic';
  const { error: formatError, isPending: isFormatting, run } = useAsyncAction();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = async (): Promise<void> => {
    try {
      await writeClipboard(code);
      onOpen('success', 'コードをコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  // 入力・言語変更・整形の反映のたびに、デバウンスして自動で検査する
  useEffect(() => {
    if (shouldSkipInitialLint.current) {
      shouldSkipInitialLint.current = false;
      return;
    }
    dispatchLint(async (signal) => {
      if (code === '') {
        setDiagnostics(null);
        setLintError(null);
        return;
      }
      const result = await lintAction(code, language);
      if (signal.aborted) {
        return;
      }
      if (result.error !== undefined) {
        setLintError(result.error);
        return;
      }
      setDiagnostics(result.diagnostics);
      setLintError(null);
    });
  }, [code, language, dispatchLint, lintAction]);

  // textarea は非制御なので、整形結果は必ず DOM に反映する (input 発火で
  // state も同期される)。undo 履歴を残せる insertText を優先し、非対応環境では
  // value を直接書き換えて input を発火させる
  const applyFormatted = (formatted: string): void => {
    const textarea = textareaRef.current;
    if (textarea === null) {
      setCode(formatted);
      return;
    }
    if (formatted === textarea.value) {
      return;
    }
    textarea.focus();
    textarea.select();
    // oxlint-disable-next-line typescript/no-deprecated -- undo履歴を保った全置換ができる代替APIが無い
    const inserted = document.execCommand('insertText', false, formatted);
    if (!inserted) {
      // execCommand 非対応環境: 非制御なので DOM を直接書き換え、state も同期する
      textarea.value = formatted;
      setCode(formatted);
    }
  };

  const handleFormat = (): void => {
    run(() => formatAction(code, language), {
      onSuccess: (result) => {
        if (result.code !== undefined) {
          applyFormatted(result.code);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-36">
          <FormControl
            label="言語"
            renderInput={({ 'aria-labelledby': _, ...props }) => (
              <Select
                {...props}
                onChange={(e) => {
                  if (isLintLanguage(e.target.value)) {
                    setLanguage(e.target.value);
                  }
                }}
                options={LANGUAGE_OPTIONS}
                value={language}
              />
            )}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            disabled={code === ''}
            onClick={() => {
              void handleCopy();
            }}
            startIcon={<CopyIcon size="sm" />}
            type="button"
            variant="outline"
          >
            コピー
          </Button>
          <Button
            disabled={code === '' || isFormatting}
            onClick={handleFormat}
            type="button"
          >
            コードを整形
          </Button>
        </div>
      </div>
      <CodeEditor
        language={language}
        onChange={setCode}
        textareaRef={textareaRef}
        theme={highlightTheme}
        value={code}
      />
      {formatError === undefined ? null : (
        <Alert message={formatError} tone="error" />
      )}
      <DiagnosticList
        diagnostics={diagnostics}
        errorMessage={lintError}
        isLinting={isLinting}
      />
    </div>
  );
};
