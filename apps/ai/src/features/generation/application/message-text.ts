import type { UIMessage } from 'ai';

// メッセージの text パーツだけを連結する（data パーツ等は含めない）。
export const messageText = (message: UIMessage): string => {
  let text = '';
  for (const part of message.parts) {
    if (part.type === 'text') {
      text += part.text;
    }
  }
  return text;
};
