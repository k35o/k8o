import 'server-only';
import { anthropic } from '@ai-sdk/anthropic';

import type { GenerationModel } from '@/features/generation/application/models';

// 鍵（ANTHROPIC_API_KEY）はサーバ側に閉じる（'server-only' でクライアントバンドルへの混入を防ぐ）
export const getGenerationModel = (
  id: GenerationModel,
): ReturnType<typeof anthropic> => anthropic(id);
