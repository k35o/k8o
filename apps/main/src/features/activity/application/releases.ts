import { formatDate } from '@repo/helpers/date/format';

import type { PublishedVersion } from '../infrastructure/npm-registry';
import { fetchPublishedVersions } from '../infrastructure/npm-registry';

export type ReleaseSource = {
  npmPackageName: string | null;
  githubUrl: string;
};

export type ReleaseGroup = {
  packageName: string;
  // 月の最後に出た版と、その公開の時刻
  version: string;
  publishedAt: string;
  href: string;
};

export type LatestRelease = {
  version: string;
  publishedAt: string;
};

const STABLE_VERSION = /^\d+\.\d+\.\d+$/u;

// 最後に公開された版。プレリリースは数えない
export const latestReleaseOf = (
  versions: PublishedVersion[],
): LatestRelease | null =>
  versions
    .filter(({ version }) => STABLE_VERSION.test(version))
    .toSorted((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))
    .at(-1) ?? null;

// 同じパッケージの同じ月（日本時間）の版は、最後の版だけを残す。プレリリースは数えない
export const groupReleasesByMonth = (
  source: { packageName: string; githubUrl: string },
  versions: PublishedVersion[],
): ReleaseGroup[] => {
  const months = Map.groupBy(
    versions
      .filter(({ version }) => STABLE_VERSION.test(version))
      .toSorted(
        (a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt),
      ),
    ({ publishedAt }) => formatDate(new Date(publishedAt), 'yyyy-MM'),
  );
  return [...months.values()].flatMap((month) => {
    const last = month.at(-1);
    if (last === undefined) {
      return [];
    }
    return [
      {
        packageName: source.packageName,
        version: last.version,
        publishedAt: last.publishedAt,
        href: `${source.githubUrl}/releases`,
      },
    ];
  });
};

// レジストリを読めなかったパッケージは、リリースを出さずに続ける。ビルドを npm の調子に預けない
export const loadReleases = async (
  sources: ReleaseSource[],
  fetchVersions: (
    packageName: string,
  ) => Promise<PublishedVersion[]> = fetchPublishedVersions,
): Promise<ReleaseGroup[]> => {
  const groups = await Promise.all(
    sources.map(async ({ npmPackageName, githubUrl }) => {
      if (npmPackageName === null) {
        return [];
      }
      try {
        return groupReleasesByMonth(
          { packageName: npmPackageName, githubUrl },
          await fetchVersions(npmPackageName),
        );
      } catch (error) {
        console.warn(
          `${npmPackageName} のリリースを npm から読めなかったため、Activity に出しません`,
          error,
        );
        return [];
      }
    }),
  );
  return groups.flat();
};

// パッケージの名前ごとの最後の版。レジストリを読めなかったパッケージと、版の無いパッケージは入らない
export const loadLatestReleases = async (
  packageNames: string[],
  fetchVersions: (
    packageName: string,
  ) => Promise<PublishedVersion[]> = fetchPublishedVersions,
): Promise<Record<string, LatestRelease>> => {
  const entries = await Promise.all(
    packageNames.map(async (packageName) => {
      try {
        const latest = latestReleaseOf(await fetchVersions(packageName));
        return latest === null ? [] : [[packageName, latest] as const];
      } catch (error) {
        console.warn(
          `${packageName} の版を npm から読めなかったため、Artifacts に出しません`,
          error,
        );
        return [];
      }
    }),
  );
  return Object.fromEntries(entries.flat());
};
