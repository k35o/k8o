'use client';

import type { ChatMessage } from '@json-render/react';
import {
  Alert,
  Button,
  SendIcon,
  SparklesIcon,
  Spinner,
  Textarea,
} from '@k8o/arte-odyssey';
import {
  type FC,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { UiPreview } from '../ui-preview';

type Props = {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: Error | null;
  onSend: (text: string) => void;
  onClear: () => void;
};

// 空の状態で提示する作成例。クリックでそのまま送信する。
const EXAMPLE_PROMPTS = [
  'ログインフォームを作って',
  'プロフィールカードを3枚横に並べて',
  '料金プランの比較テーブル',
  'お問い合わせフォーム',
] as const;

const Message: FC<{ message: ChatMessage; loading: boolean }> = ({
  message,
  loading,
}) => {
  if (message.role === 'user') {
    return (
      <div className="bg-primary-bg text-primary-fg max-w-[80%] self-end rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap">
        {message.text}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 self-start">
      {message.text !== '' && (
        <p className="text-fg-base text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
      )}
      {message.spec !== null && (
        <div className="border-border-mute bg-bg-base rounded-lg border p-4">
          <p className="text-fg-mute mb-3 text-xs font-bold">プレビュー</p>
          <UiPreview loading={loading} spec={message.spec} />
        </div>
      )}
      {loading && message.text === '' && message.spec === null && (
        <Spinner label="生成中" size="sm" />
      )}
    </div>
  );
};

/**
 * チャット UI の見た目だけを担う表示専用コンポーネント。
 * 会話状態は持たず、props で受け取る（ロジックは ui-builder 側の useChatUI）。
 */
export const ChatView: FC<Props> = ({
  messages,
  isStreaming,
  error,
  onSend,
  onClear,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージやストリーミング更新のたびに最下部へスクロールする。
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isStreaming]);

  const trimmed = input.trim();
  const canSend = trimmed !== '' && !isStreaming;

  const submit = (): void => {
    if (!canSend) {
      return;
    }
    onSend(trimmed);
    setInput('');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    submit();
  };

  // Cmd/Ctrl + Enter で送信する。
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="border-border-subtle bg-bg-mute/30 flex max-h-[60vh] min-h-[40vh] flex-col gap-4 overflow-y-auto rounded-lg border p-4"
        ref={scrollRef}
      >
        {isEmpty ? (
          <div className="text-fg-mute m-auto flex max-w-md flex-col items-center gap-4 text-center">
            <SparklesIcon size="lg" />
            <p className="text-sm leading-relaxed">
              作りたい画面を言葉で伝えると、ArteOdysseyのコンポーネントでUIを組み立てます。
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <Button
                  color="gray"
                  disabled={isStreaming}
                  key={example}
                  onClick={() => {
                    onSend(example);
                  }}
                  size="sm"
                  variant="outline"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message
              key={message.id}
              loading={isStreaming && index === messages.length - 1}
              message={message}
            />
          ))
        )}
      </div>

      {error !== null && <Alert message={error.message} tone="error" />}

      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <Textarea
          autoResize
          disabled={isStreaming}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="作りたいUIを説明してください（Cmd/Ctrl + Enter で送信）"
          value={input}
        />
        <div className="flex items-center justify-between">
          <Button
            color="gray"
            disabled={isStreaming || isEmpty}
            onClick={onClear}
            size="sm"
            type="button"
            variant="skeleton"
          >
            会話をクリア
          </Button>
          <Button
            color="primary"
            disabled={!canSend}
            endIcon={<SendIcon />}
            size="md"
            type="submit"
            variant="solid"
          >
            生成
          </Button>
        </div>
      </form>
    </div>
  );
};
