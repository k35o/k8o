import 'server-only';
import { createAnthropic } from '@ai-sdk/anthropic';

import type { GenerationModel } from './models';

const WEB_FETCH_URL_SOURCES = {
  user_input: { type: 'all' },
  client_tool_results: { type: 'none' },
  server_tool_results: {
    type: 'only',
    tools: [{ type: 'tool_reference', name: 'web_search' }],
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isWebFetch = (tool: unknown): tool is Record<string, unknown> =>
  isRecord(tool) && tool['name'] === 'web_fetch';

const withUrlSources = (body: string): string | null => {
  const request: unknown = JSON.parse(body);
  if (!isRecord(request)) {
    return null;
  }
  const { tools } = request;
  if (!Array.isArray(tools) || !tools.some(isWebFetch)) {
    return null;
  }
  for (const tool of tools) {
    if (isWebFetch(tool)) {
      tool['url_sources'] = WEB_FETCH_URL_SOURCES;
    }
  }
  return JSON.stringify(request);
};

// @ai-sdk/anthropic は web_fetch の url_sources を API に渡せないので、要求の本文に足す。
// client の tool の結果にはモデルが書いた文が写るので、そこに出た URL を取りに行く先にしない
const fetchWithWebFetchUrlSources: typeof fetch = (input, init) => {
  const body =
    typeof init?.body === 'string' ? withUrlSources(init.body) : null;
  return fetch(input, body === null ? init : { ...init, body });
};

// 鍵（ANTHROPIC_API_KEY）はサーバ側に閉じる（'server-only' でクライアントバンドルへの混入を防ぐ）
const anthropic = createAnthropic({ fetch: fetchWithWebFetchUrlSources });

export const getGenerationModel = (
  id: GenerationModel,
): ReturnType<typeof anthropic> => anthropic(id);
