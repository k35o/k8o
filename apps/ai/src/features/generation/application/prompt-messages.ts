import { buildUserPrompt } from '@json-render/core';
import type { Spec } from '@json-render/core';
import type { UIMessage } from 'ai';

// data-spec 等の data パーツはモデルに渡さない（会話文だけを文脈にする。spec の
// 文脈は最新 spec を buildUserPrompt で最後の user メッセージに埋めて渡す）。
export const stripDataParts = (messages: UIMessage[]): UIMessage[] =>
  messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => !part.type.startsWith('data-')),
  }));

// 編集ターンでは、最後の user メッセージを json-render 標準の編集プロンプト
// （現在の spec + パッチ編集の指示）で包む。表示用のメッセージはクライアント側の
// 元テキストのまま変わらない。
export const withEditContext = (
  messages: UIMessage[],
  currentSpec: Spec | null,
): UIMessage[] => {
  const last = messages.at(-1);
  if (currentSpec === null || last?.role !== 'user') {
    return messages;
  }
  const parts: UIMessage['parts'] = [];
  for (const part of last.parts) {
    parts.push(
      part.type === 'text'
        ? { ...part, text: buildUserPrompt({ prompt: part.text, currentSpec }) }
        : part,
    );
  }
  return [...messages.slice(0, -1), { ...last, parts }];
};
