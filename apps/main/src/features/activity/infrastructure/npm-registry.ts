import * as z from 'zod/mini';

import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

const packumentSchema = z.object({
  time: z.record(z.string(), z.string()),
});

export type PublishedVersion = {
  version: string;
  publishedAt: string;
};

const TIMEOUT_MS = 10_000;

// npm のレジストリが持つ、パッケージの版ごとの公開の時刻。ホームの Activity と Artifacts が同じパッケージを読む
export const fetchPublishedVersions = memoizeInBuild(
  async (packageName: string): Promise<PublishedVersion[]> => {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (!response.ok) {
      throw new Error(
        `npm のレジストリが ${packageName} に ${response.status} を返しました`,
      );
    }
    const { time } = z.parse(packumentSchema, await response.json());
    return Object.entries(time).flatMap(([version, publishedAt]) =>
      // time は版のほかに、パッケージの作成と更新の時刻も同じ表に持つ
      version === 'created' || version === 'modified'
        ? []
        : [{ version, publishedAt }],
    );
  },
);
