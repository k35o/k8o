import 'server-only';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// Sakana Fugu は OpenAI 互換 API。apiKey は Authorization: Bearer に自動展開される。
// 鍵はサーバ側に閉じる（'server-only' でクライアントバンドルへの混入を防ぐ）。
const fugu = createOpenAICompatible({
  name: 'fugu',
  baseURL: process.env['SAKANA_BASE_URL'] ?? 'https://api.sakana.ai/v1',
  apiKey: process.env['SAKANA_API_KEY'] ?? '',
});

export type FuguModelId = 'fugu' | 'fugu-ultra';

export const getFuguModel = (
  id: FuguModelId = 'fugu',
): ReturnType<typeof fugu.chatModel> => fugu.chatModel(id);
