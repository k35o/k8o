// web-features の正典配布元(GitHub Releases)からのバージョン発見と、data.json の取得。
// npm パッケージには依存しない。取得はバージョン固定 URL の immutable な配布物を使う。

// 恒常的な契約破壊(リダイレクト構造の変化など)。呼び出し側はこの型のときだけ警報を出す。
// 一時障害(429/5xx/ネットワーク例外)は通常の Error として fetch_failed に落ち、次回リトライ。
export class UpstreamDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamDiscoveryError';
  }
}

class UpstreamFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamFetchError';
  }
}

const RELEASE_LATEST_URL =
  'https://github.com/web-platform-dx/web-features/releases/latest/download/data.json';

// releases/latest/download → releases/download/<tag>/ の302は GitHub の実装詳細。
// 厳密な semver(プレリリース拒否)で照合し、構造が変わったら「差分なし」ではなく
// 発見失敗として扱う(静かに止まらない)。
const TAG_PATTERN = /\/releases\/download\/v(\d+)\.(\d+)\.(\d+)\/data\.json$/u;

// ネットワーク予算は cron route の maxDuration=60秒に収める:
// 発見 10秒 + 取得 12秒 × 3チャネル = 46秒。残りが変換・検証・DB置換の予算。
// 実測の取得時間は 1秒未満(4.7MB)なので 12秒は十分な余裕がある。
const DISCOVERY_TIMEOUT_MS = 10_000;
const FETCH_TIMEOUT_MS = 12_000;
// data.json は実測 4.7MB。異常な巨大化(上流事故・改竄)はダウンロード中に打ち切る。
const MAX_BYTES = 20_000_000;

export type DiscoveredVersion = { version: string; major: number };

export const discoverLatestVersion = async (): Promise<DiscoveredVersion> => {
  const res = await fetch(RELEASE_LATEST_URL, {
    method: 'HEAD',
    redirect: 'manual',
    signal: AbortSignal.timeout(DISCOVERY_TIMEOUT_MS),
  });
  // 429/5xx は GitHub 側の一時障害。契約破壊(警報対象)にせず次回リトライに回す。
  if (res.status === 429 || res.status >= 500) {
    throw new Error(`GitHub の一時障害: HTTP ${String(res.status)}`);
  }
  if (res.status !== 302) {
    throw new UpstreamDiscoveryError(
      `releases/latest が 302 を返さない: ${String(res.status)}`,
    );
  }
  const location = res.headers.get('location') ?? '';
  const matched = TAG_PATTERN.exec(location);
  if (matched === null) {
    throw new UpstreamDiscoveryError(
      `Location からバージョンタグを解決できない: ${location}`,
    );
  }
  const [, majorStr, minor, patch] = matched;
  return {
    version: `${majorStr}.${minor}.${patch}`,
    major: Number(majorStr),
  };
};

// primary は npm 再配布の CDN(immutable: バージョン固定 URL の内容は不変)。
// GitHub Release アセットは同一タグのまま差し替え可能なため fallback に置く。
const channelUrls = (version: string): string[] => [
  `https://cdn.jsdelivr.net/npm/web-features@${version}/data.json`,
  `https://unpkg.com/web-features@${version}/data.json`,
  `https://github.com/web-platform-dx/web-features/releases/download/v${version}/data.json`,
];

// 全量をバッファする前に上限で打ち切る。content-length はヘッダ欠落(chunked)でも
// 機能するよう、実際の受信バイト数で判定する。
const readBodyWithLimit = async (res: Response): Promise<string> => {
  if (res.body === null) {
    throw new Error('response body が空');
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  /* oxlint-disable eslint/no-await-in-loop -- ストリームの逐次読み取り */
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }
    received += chunk.value.byteLength;
    if (received > MAX_BYTES) {
      await reader.cancel();
      throw new Error(`body が上限超過: ${String(received)} bytes`);
    }
    chunks.push(chunk.value);
  }
  /* oxlint-enable eslint/no-await-in-loop */
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
};

export const fetchUpstreamData = async (version: string): Promise<unknown> => {
  const failures: string[] = [];
  // fallback チェーンなので並列化しない: primary が成功したら他チャネルは叩かない。
  /* oxlint-disable eslint/no-await-in-loop -- 逐次フォールバックが目的 */
  for (const url of channelUrls(version)) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        failures.push(`${url}: HTTP ${String(res.status)}`);
        continue;
      }
      const contentLength = Number(res.headers.get('content-length') ?? '0');
      if (contentLength > MAX_BYTES) {
        failures.push(`${url}: content-length ${String(contentLength)}`);
        continue;
      }
      const text = await readBodyWithLimit(res);
      return JSON.parse(text) as unknown;
    } catch (error) {
      failures.push(`${url}: ${String(error)}`);
    }
  }
  /* oxlint-enable eslint/no-await-in-loop */
  throw new UpstreamFetchError(failures.join(' / '));
};
