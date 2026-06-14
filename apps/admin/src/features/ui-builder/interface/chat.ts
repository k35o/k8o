import { auth } from '@repo/database/auth';
import type { ModelMessage } from 'ai';
import { headers } from 'next/headers';

import { isAuthEnabled } from '@/shared/auth/auth-enabled';

import { streamUiBuilder } from '../infrastructure/generate';

// 32KB。会話履歴を含むが、UI 生成の指示は短文が中心なので十分。
const MAX_BODY_SIZE = 32 * 1024;
const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8000;

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

// `useChatUI` が送る `{ messages: Array<{ role, content }> }` を検証する。
// admin は他に JSON ボディの API を持たず zod を使っていないため、軽量な手書き検証にする。
const parseMessages = (json: unknown): IncomingMessage[] | null => {
  if (typeof json !== 'object' || json === null || !('messages' in json)) {
    return null;
  }
  const { messages } = json as { messages: unknown };
  if (!Array.isArray(messages)) {
    return null;
  }
  const result: IncomingMessage[] = [];
  for (const message of messages) {
    if (typeof message !== 'object' || message === null) {
      return null;
    }
    const { role, content } = message as { role?: unknown; content?: unknown };
    if (
      (role !== 'user' && role !== 'assistant') ||
      typeof content !== 'string'
    ) {
      return null;
    }
    result.push({ role, content });
  }
  return result;
};

const errorResponse = (status: number, message: string): Response =>
  Response.json({ message }, { status });

/**
 * `useChatUI`（@json-render/react）からの POST を受け、UI 生成のテキストストリームを返す。
 *
 * admin の middleware（proxy.ts）は matcher で `/api` を除外しているため、API は
 * middleware で保護されない。ここで自前にセッションを確認し、未認証なら 401 を返す
 * （AI 呼び出しを伴うエンドポイントの濫用・課金を防ぐ）。リクエストボディは
 * `{ messages: Array<{ role, content }> }`、エラー時は `{ message }` の JSON。
 */
export const handleUiBuilderChat = async (req: Request): Promise<Response> => {
  if (isAuthEnabled) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return errorResponse(401, '認証が必要です');
    }
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength !== null && Number(contentLength) > MAX_BODY_SIZE) {
    return errorResponse(413, 'リクエストが大きすぎます');
  }

  const text = await req.text();
  if (text.length > MAX_BODY_SIZE) {
    return errorResponse(413, 'リクエストが大きすぎます');
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return errorResponse(400, '不正なリクエストです');
  }

  const messages = parseMessages(json);
  if (messages === null) {
    return errorResponse(400, '不正なリクエストです');
  }
  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    return errorResponse(400, 'メッセージ数が不正です');
  }
  if (messages.some((message) => message.content.length > MAX_CONTENT_CHARS)) {
    return errorResponse(400, 'メッセージが長すぎます');
  }

  const modelMessages: ModelMessage[] = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  return streamUiBuilder(modelMessages);
};
