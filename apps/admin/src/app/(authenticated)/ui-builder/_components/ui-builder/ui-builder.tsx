'use client';

import { useChatUI } from '@json-render/react';
import type { FC } from 'react';

import { ChatView } from '../chat-view';

/**
 * AI UIビルダーのコンテナ。
 *
 * `useChatUI`（@json-render/react）が `/api/ui-builder` とやり取りし、各メッセージを
 * 「地の文（text）」と「json-render Spec」に分解して返す。状態を ChatView に渡すだけ。
 */
export const UiBuilder: FC = () => {
  const { messages, isStreaming, error, send, clear } = useChatUI({
    api: '/api/ui-builder',
  });

  return (
    <ChatView
      error={error}
      isStreaming={isStreaming}
      messages={messages}
      onClear={clear}
      onSend={(text) => {
        void send(text);
      }}
    />
  );
};
