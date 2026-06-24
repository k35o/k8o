import 'server-only';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import type { GenerationModel } from '@/features/generation/application/models';

// Sakana Fugu は OpenAI 互換 API。鍵はサーバ側に閉じる（'server-only' でクライアントバンドルへの混入を防ぐ）。
const fugu = createOpenAICompatible({
  name: 'fugu',
  baseURL: process.env['SAKANA_BASE_URL'] ?? 'https://api.sakana.ai/v1',
  apiKey: process.env['SAKANA_API_KEY'] ?? '',
  // ストリーミング応答に usage を含めさせ、利用量ログ(ai_usages)で実トークン数を記録する。
  includeUsage: true,
});

export const getFuguModel = (
  id: GenerationModel = 'fugu',
): ReturnType<typeof fugu.chatModel> => fugu.chatModel(id);
