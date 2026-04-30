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
import { type FC, useMemo, useState } from 'react';
import type {
  BaselineFeature,
  BlogLink,
} from '@/features/baseline/interface/queries';

type StatusVisibility = {
  newly: boolean;
  widely: boolean;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getAvailableYears = (features: BaselineFeature[]): string[] => {
  const years = new Set<string>();
  for (const feature of features) {
    years.add(feature.date.slice(0, 4));
  }
  return [...years].toSorted((a, b) => b.localeCompare(a));
};

const FeatureList: FC<{
  features: BaselineFeature[];
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
    let result = features;
    result = result.filter(
      (f) =>
        (f.status === 'newly' && visibility.newly) ||
        (f.status === 'widely' && visibility.widely),
    );
    if (recentOnly) {
      result = result.filter(
        (f) => new Date(f.updatedAt).getTime() >= recentThresholdMs,
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

  return (
    <div className="flex flex-col gap-4">
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-fg-mute text-sm">
          該当する機能が見つかりません
        </p>
      ) : (
        <ul className="divide-y divide-border-base">
          {filtered.map((feature) => {
            const blog = blogMap[feature.featureId];
            return (
              <li
                className="flex items-center gap-4 px-1 py-2.5"
                key={feature.featureId}
              >
                <Badge
                  size="sm"
                  text={feature.status === 'newly' ? 'Newly' : 'Widely'}
                  tone={feature.status === 'newly' ? 'info' : 'success'}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm leading-relaxed">
                    {feature.name}
                  </span>
                  <span className="font-mono text-fg-mute text-xs">
                    {feature.featureId}
                  </span>
                </div>
                {blog && (
                  <Link
                    className="shrink-0 text-primary-fg text-xs transition-colors duration-150 ease-out hover:underline"
                    href={`/blog/${blog.slug}` as Route}
                  >
                    Blog
                  </Link>
                )}
                <span className="hidden shrink-0 text-fg-mute text-xs sm:block">
                  {formatDate(new Date(feature.date), 'yyyy/MM/dd')}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

type YearData = {
  features: BaselineFeature[];
};

export const BaselineFeatureList: FC<{
  features: BaselineFeature[];
  blogMap: Record<string, BlogLink>;
  currentYear: string;
}> = ({ features, blogMap, currentYear }) => {
  const [visibility, setVisibility] = useState<StatusVisibility>({
    newly: true,
    widely: true,
  });
  const [query, setQuery] = useState('');
  const [recentOnly, setRecentOnly] = useState(false);
  const [recentThresholdMs, setRecentThresholdMs] = useState(0);

  const toggleRecentOnly = () => {
    if (!recentOnly) {
      setRecentThresholdMs(Date.now() - SEVEN_DAYS_MS);
    }
    setRecentOnly((prev) => !prev);
  };

  const availableYears = useMemo(() => getAvailableYears(features), [features]);

  const dataByYear = useMemo(() => {
    const map = new Map<string, YearData>();
    for (const feature of features) {
      const year = feature.date.slice(0, 4);
      const entry = map.get(year);
      if (entry) {
        entry.features.push(feature);
      } else {
        map.set(year, { features: [feature] });
      }
    }
    return map;
  }, [features]);

  const filteredCountByYear = useMemo(() => {
    const counts = new Map<string, number>();
    const lowerQuery = query.toLowerCase();
    for (const feature of features) {
      const matchesVisibility =
        (feature.status === 'newly' && visibility.newly) ||
        (feature.status === 'widely' && visibility.widely);
      const matchesRecent =
        !recentOnly ||
        new Date(feature.updatedAt).getTime() >= recentThresholdMs;
      const matchesQuery =
        !query ||
        feature.name.toLowerCase().includes(lowerQuery) ||
        feature.featureId.toLowerCase().includes(lowerQuery);
      if (matchesVisibility && matchesRecent && matchesQuery) {
        const year = feature.date.slice(0, 4);
        counts.set(year, (counts.get(year) ?? 0) + 1);
      }
    }
    return counts;
  }, [features, visibility, query, recentOnly, recentThresholdMs]);

  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : availableYears[0];

  return (
    <section className="flex flex-col gap-6 rounded-xl bg-bg-raised p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="sm:max-w-64">
          <FormControl
            label="検索"
            renderInput={(props) => (
              <TextField
                {...props}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="機能名で検索..."
                value={query}
              />
            )}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
          <div className="flex gap-4">
            <Checkbox
              label="Newly Available"
              onChange={() =>
                setVisibility((prev) => ({
                  ...prev,
                  newly: !prev.newly,
                }))
              }
              value={visibility.newly}
            />
            <Checkbox
              label="Widely Available"
              onChange={() =>
                setVisibility((prev) => ({
                  ...prev,
                  widely: !prev.widely,
                }))
              }
              value={visibility.widely}
            />
          </div>
          <Checkbox
            label="直近1週間の更新のみ"
            onChange={toggleRecentOnly}
            value={recentOnly}
          />
        </div>
      </div>

      {defaultYear && (
        <Tabs.Root
          defaultSelectedId={defaultYear}
          ids={availableYears as [string, ...string[]]}
        >
          <Tabs.List label="年を選択">
            {availableYears.map((year) => {
              const count = filteredCountByYear.get(year) ?? 0;
              return (
                <Tabs.Tab id={year} key={year}>
                  {year}
                  <span className="ml-1 text-fg-mute text-xs">{count}</span>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          {availableYears.map((year) => {
            const data = dataByYear.get(year);
            return (
              <Tabs.Panel id={year} key={year}>
                <FeatureList
                  blogMap={blogMap}
                  features={data?.features ?? []}
                  query={query}
                  recentOnly={recentOnly}
                  recentThresholdMs={recentThresholdMs}
                  visibility={visibility}
                />
              </Tabs.Panel>
            );
          })}
        </Tabs.Root>
      )}
    </section>
  );
};
