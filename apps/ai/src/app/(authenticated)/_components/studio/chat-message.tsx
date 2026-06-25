'use client';

import type { UIMessage } from 'ai';
import { memo } from 'react';

import {
  messageText,
  parseGeneration,
} from '@/features/generation/application/parse-generation';

type ChatMessageProps = {
  message: UIMessage;
};

// 確定済み（生成中以外）のメッセージ1件を描画する。過去メッセージは内容が不変なので
// memo で囲み、ストリーミング中に履歴全体を毎トークン再パース／再レンダーしないようにする。
const ChatMessageComponent = ({ message }: ChatMessageProps) => {
  const text = messageText(message);
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="bg-primary-bg-subtle text-fg-base max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed">
          {text}
        </p>
      </div>
    );
  }
  const description = parseGeneration(text).meta?.description;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-fg-mute text-xs font-bold">AI</span>
      <p className="text-fg-base text-sm leading-relaxed">
        {description ?? 'コードを更新しました'}
      </p>
    </div>
  );
};

// id と本文が同じなら再レンダーしない（過去メッセージは parseGeneration を一度きりにする）。
export const ChatMessage = memo(
  ChatMessageComponent,
  (prev, next) =>
    prev.message.id === next.message.id &&
    messageText(prev.message) === messageText(next.message),
);
