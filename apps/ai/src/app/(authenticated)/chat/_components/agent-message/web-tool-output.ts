import type { AgentUIMessage } from '@/features/agent/application/agent-message';

type OutputOf<Type extends string> = Extract<
  AgentUIMessage['parts'][number],
  { type: Type; state: 'output-available' }
>['output'];

type WebSearchOutput = OutputOf<'tool-web_search'>;

type WebFetchOutput = OutputOf<'tool-web_fetch'>;

// 検索の結果の本文は Claude にしか読めない暗号文なので、題と URL だけを出す
export const webSearchOutputText = (results: WebSearchOutput): string =>
  results.length === 0
    ? '当たりはありませんでした'
    : results.map(({ title, url }) => `- ${title ?? url}\n  ${url}`).join('\n');

// atob で数えると描くたびに PDF をまるごと復号するので、base64 の長さから数える
const base64Bytes = (data: string): number => {
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
  return Math.floor((data.length * 3) / 4) - padding;
};

export const webFetchOutputText = ({
  url,
  retrievedAt,
  content,
}: WebFetchOutput): string =>
  [
    retrievedAt === null ? url : `${url}（${retrievedAt} に取得）`,
    ...(content.title === null ? [] : [content.title]),
    '',
    content.source.type === 'base64'
      ? `PDF（${base64Bytes(content.source.data).toLocaleString('ja-JP')} バイト）`
      : content.source.data,
  ].join('\n');
