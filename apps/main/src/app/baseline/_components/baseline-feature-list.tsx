'use client';

import {
  Badge,
  Checkbox,
  FormControl,
  Tabs,
  TextField,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { FC } from 'react';

import { toBrowserFamilies } from '@/app/_components/baseline-status/browser-families';
import type {
  PlatformFeature,
  PlatformStatus,
} from '@/features/baseline/interface/queries';
import type { BlogLink } from '@/features/blog/interface/queries';

import { baselineListParsers } from '../_utils/search-params';

type StatusVisibility = Record<PlatformStatus, boolean>;

const STATUS_META: Record<
  PlatformStatus,
  { label: string; tone: 'success' | 'info' | 'warning' }
> = {
  widely: { label: 'Widely', tone: 'success' },
  newly: { label: 'Newly', tone: 'info' },
  limited: { label: 'Limited', tone: 'warning' },
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getAvailableYears = (features: PlatformFeature[]): string[] => {
  const years = new Set<string>();
  for (const feature of features) {
    years.add(feature.resolvedDate.slice(0, 4));
  }
  return [...years].toSorted((a, b) => b.localeCompare(a));
};

const BrowserSupport: FC<{ feature: PlatformFeature }> = ({ feature }) => (
  <ul className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
    {toBrowserFamilies(feature.support).map((family) => (
      <li className="flex items-center gap-1 text-xs" key={family.label}>
        <span className="text-fg-mute">{family.label}</span>
        <span
          className={
            family.supported
              ? 'text-fg-success font-mono'
              : 'text-fg-mute font-mono'
          }
        >
          {family.supported ? (family.version ?? '対応') : '—'}
        </span>
      </li>
    ))}
  </ul>
);

const FeatureList: FC<{
  features: PlatformFeature[];
  blogMap: Record<string, BlogLink>;
  visibility: StatusVisibility;
  query: string;
  recentOnly: boolean;
  recentThresholdMs: number;
}> = ({
  features,
  blogMap,
  visibility,
  query,
  recentOnly,
  recentThresholdMs,
}) => {
  const filtered = useMemo(() => {
    let result = features.filter((f) => visibility[f.status]);
    if (recentOnly) {
      result = result.filter(
        (f) => new Date(f.resolvedDate).getTime() >= recentThresholdMs,
      );
    }
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(lowerQuery) ||
          f.featureId.toLowerCase().includes(lowerQuery),
      );
    }
    return result;
  }, [features, visibility, query, recentOnly, recentThresholdMs]);

  if (filtered.length === 0) {
    return (
      <p className="text-fg-mute py-12 text-center text-sm">
        該当する機能が見つかりません
      </p>
    );
  }

  return (
    <ul className="divide-border-base divide-y">
      {filtered.map((feature) => {
        const blog = blogMap[feature.featureId];
        const meta = STATUS_META[feature.status];
        return (
          <li
            className="flex items-start gap-3 px-1 py-3 sm:gap-4"
            key={feature.featureId}
          >
            <Badge size="sm" text={meta.label} tone={meta.tone} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm leading-relaxed">{feature.name}</span>
              <span className="text-fg-mute font-mono text-xs">
                {feature.featureId}
              </span>
              <BrowserSupport feature={feature} />
            </div>
            {blog && (
              <Link
                className="text-primary-fg shrink-0 text-xs transition-colors duration-150 ease-out hover:underline"
                href={`/blog/${blog.slug}` as Route}
              >
                Blog
              </Link>
            )}
            <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
              {formatDate(new Date(feature.resolvedDate), 'yyyy/MM/dd')}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export const BaselineFeatureList: FC<{
  features: PlatformFeature[];
  blogMap: Record<string, BlogLink>;
  currentYear: string;
  nowMs: number;
}> = ({ features, blogMap, currentYear, nowMs }) => {
  const [params, setParams] = useQueryStates(baselineListParsers);
  const { q: query, newly, widely, limited, recent: recentOnly } = params;
  const visibility = useMemo<StatusVisibility>(
    () => ({ newly, widely, limited }),
    [newly, widely, limited],
  );
  const recentThresholdMs = nowMs - SEVEN_DAYS_MS;

  const availableYears = useMemo(() => getAvailableYears(features), [features]);

  const dataByYear = useMemo(() => {
    const map = new Map<string, PlatformFeature[]>();
    for (const feature of features) {
      const year = feature.resolvedDate.slice(0, 4);
      const entry = map.get(year);
      if (entry) {
        entry.push(feature);
      } else {
        map.set(year, [feature]);
      }
    }
    return map;
  }, [features]);

  const filteredCountByYear = useMemo(() => {
    const counts = new Map<string, number>();
    const lowerQuery = query.toLowerCase();
    for (const feature of features) {
      const matchesVisibility = visibility[feature.status];
      const matchesRecent =
        !recentOnly ||
        new Date(feature.resolvedDate).getTime() >= recentThresholdMs;
      const matchesQuery =
        !query ||
        feature.name.toLowerCase().includes(lowerQuery) ||
        feature.featureId.toLowerCase().includes(lowerQuery);
      if (matchesVisibility && matchesRecent && matchesQuery) {
        const year = feature.resolvedDate.slice(0, 4);
        counts.set(year, (counts.get(year) ?? 0) + 1);
      }
    }
    return counts;
  }, [features, visibility, query, recentOnly, recentThresholdMs]);

  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : availableYears[0];

  return (
    <section className="bg-bg-raised flex flex-col gap-6 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="sm:max-w-64">
          <FormControl
            label="検索"
            renderInput={(props) => (
              <TextField
                {...props}
                onChange={(e) => {
                  void setParams({ q: e.target.value || null });
                }}
                placeholder="機能名で検索..."
                value={query}
              />
            )}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Widely"
              onChange={() => {
                void setParams({ widely: !widely });
              }}
              value={widely}
            />
            <Checkbox
              label="Newly"
              onChange={() => {
                void setParams({ newly: !newly });
              }}
              value={newly}
            />
            <Checkbox
              label="Limited（先取り）"
              onChange={() => {
                void setParams({ limited: !limited });
              }}
              value={limited}
            />
          </div>
          <Checkbox
            label="直近1週間の更新のみ"
            onChange={() => {
              void setParams({ recent: !recentOnly });
            }}
            value={recentOnly}
          />
        </div>
      </div>

      {defaultYear !== undefined && (
        <Tabs.Root
          ids={availableYears as [string, ...string[]]}
          onChange={(id) => {
            void setParams({ year: id === defaultYear ? null : id });
          }}
          selectedId={
            params.year !== null && availableYears.includes(params.year)
              ? params.year
              : defaultYear
          }
        >
          <Tabs.List label="年を選択">
            {availableYears.map((year) => {
              const count = filteredCountByYear.get(year) ?? 0;
              return (
                <Tabs.Tab id={year} key={year}>
                  {year}
                  <span className="text-fg-mute ml-1 text-xs">{count}</span>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          {availableYears.map((year) => (
            <Tabs.Panel id={year} key={year}>
              <FeatureList
                blogMap={blogMap}
                features={dataByYear.get(year) ?? []}
                query={query}
                recentOnly={recentOnly}
                recentThresholdMs={recentThresholdMs}
                visibility={visibility}
              />
            </Tabs.Panel>
          ))}
        </Tabs.Root>
      )}
    </section>
  );
};
