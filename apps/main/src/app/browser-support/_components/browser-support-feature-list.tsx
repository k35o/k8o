'use client';

import { Badge, Checkbox, FormControl, Tabs, TextField } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { FC } from 'react';

import { toBrowserFamilies } from '@/app/_components/browser-support-status/browser-families';
import type { BlogLink } from '@/features/blog/interface/queries';
import type {
  BrowserSupportFeature,
  SupportStatus,
} from '@/features/browser-support/interface/queries';

import { matchesFeatureFilters } from '../_utils/matches-feature-filters';
import type { StatusVisibility } from '../_utils/matches-feature-filters';
import { browserSupportListParsers } from '../_utils/search-params';

import styles from './browser-support-feature-list.module.css';

const STATUS_META: Record<
  SupportStatus,
  { label: string; tone: 'success' | 'info' | 'warning' }
> = {
  widely: { label: 'Widely', tone: 'success' },
  newly: { label: 'Newly', tone: 'info' },
  limited: { label: 'Limited', tone: 'warning' },
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getAvailableYears = (features: BrowserSupportFeature[]): string[] => {
  const years = new Set<string>();
  for (const feature of features) {
    years.add(feature.resolvedDate.slice(0, 4));
  }
  return [...years].toSorted((a, b) => b.localeCompare(a));
};

const BrowserSupport: FC<{ feature: BrowserSupportFeature }> = ({
  feature,
}) => (
  <ul className={styles.support}>
    {toBrowserFamilies(feature.support).map((family) => (
      <li className={styles.supportItem} key={family.label}>
        <span className={styles.supportLabel}>{family.label}</span>
        <span
          className={styles.supportVersion}
          data-supported={family.supported}
        >
          {family.supported ? (family.version ?? '対応') : '—'}
        </span>
      </li>
    ))}
  </ul>
);

const FeatureList: FC<{
  features: BrowserSupportFeature[];
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
  const filtered = useMemo(
    () =>
      features.filter((feature) =>
        matchesFeatureFilters(feature, {
          visibility,
          query,
          recentOnly,
          recentThresholdMs,
        }),
      ),
    [features, visibility, query, recentOnly, recentThresholdMs],
  );

  if (filtered.length === 0) {
    return <p className={styles.empty}>該当する機能が見つかりません</p>;
  }

  return (
    <ul>
      {filtered.map((feature) => {
        const blog = blogMap[feature.featureId];
        const meta = STATUS_META[feature.status];
        return (
          <li className={styles.item} key={feature.featureId}>
            <Badge size="sm" label={meta.label} tone={meta.tone} />
            <div className={styles.body}>
              <span className={styles.name}>{feature.name}</span>
              <span className={styles.featureId}>{feature.featureId}</span>
              <BrowserSupport feature={feature} />
            </div>
            {blog && (
              <Link
                className={styles.blogLink}
                href={`/blog/${blog.slug}` as Route}
              >
                Blog
              </Link>
            )}
            <span className={styles.date}>
              {formatDate(new Date(feature.resolvedDate), 'yyyy/MM/dd')}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export const BrowserSupportFeatureList: FC<{
  features: BrowserSupportFeature[];
  blogMap: Record<string, BlogLink>;
  currentYear: string;
  nowMs: number;
}> = ({ features, blogMap, currentYear, nowMs }) => {
  const [params, setParams] = useQueryStates(browserSupportListParsers);
  const { q: query, newly, widely, limited, recent: recentOnly } = params;
  const visibility = useMemo<StatusVisibility>(
    () => ({ newly, widely, limited }),
    [newly, widely, limited],
  );
  const recentThresholdMs = nowMs - SEVEN_DAYS_MS;

  const availableYears = useMemo(() => getAvailableYears(features), [features]);

  const dataByYear = useMemo(() => {
    const map = new Map<string, BrowserSupportFeature[]>();
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
    for (const feature of features) {
      if (
        matchesFeatureFilters(feature, {
          visibility,
          query,
          recentOnly,
          recentThresholdMs,
        })
      ) {
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
    <section className={styles.root}>
      <div className={styles.filters}>
        <div className={styles.search}>
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
        <div className={styles.toggles}>
          <div className={styles.statusToggles}>
            <Checkbox
              label="Widely"
              onChange={() => {
                void setParams({ widely: !widely });
              }}
              checked={widely}
            />
            <Checkbox
              label="Newly"
              onChange={() => {
                void setParams({ newly: !newly });
              }}
              checked={newly}
            />
            <Checkbox
              label="Limited（先取り）"
              onChange={() => {
                void setParams({ limited: !limited });
              }}
              checked={limited}
            />
          </div>
          <Checkbox
            label="直近1週間の更新のみ"
            onChange={() => {
              void setParams({ recent: !recentOnly });
            }}
            checked={recentOnly}
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
                  <span className={styles.count}>{count}</span>
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
