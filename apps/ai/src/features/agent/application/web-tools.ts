import { anthropic } from '@ai-sdk/anthropic';
import type { InferToolOutput } from 'ai';

const webSearch = anthropic.tools.webSearch_20250305({ maxUses: 5 });

type WebSearchOutput = InferToolOutput<typeof webSearch>;

// @ai-sdk/anthropic は title が null の結果から鍵ごと省くが、同じ実行の次のステップへ送り返すときの
// 検証は鍵を要るので、null で補う
const webSearchModelOutput = ({
  output,
}: {
  output: WebSearchOutput;
}): { type: 'json'; value: WebSearchOutput } => ({
  type: 'json',
  value: output.map(({ type, url, title, pageAge, encryptedContent }) => ({
    type,
    url,
    title: title ?? null,
    pageAge,
    encryptedContent,
  })),
});

// url_sources は @ai-sdk/anthropic が渡せないので、provider の fetch で足す（shared/claude/claude-provider.ts）
export const webTools = {
  web_search: { ...webSearch, toModelOutput: webSearchModelOutput },
  web_fetch: anthropic.tools.webFetch_20250910({
    maxUses: 3,
    maxContentTokens: 30_000,
  }),
};
