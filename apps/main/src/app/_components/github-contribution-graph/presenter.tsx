/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- 棒グラフの各データ点をキーボードフォーカスで参照（ツールチップ表示）できるようにするため */
import { Card } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { ContributionDay } from '@/features/github/interface/queries';

import { InfoTooltip } from './info-tooltip';

import styles from './presenter.module.css';

// ツールチップがカード外へはみ出さないよう、端寄りの棒は端揃えにする
const tooltipPositionClass = (index: number, total: number): string => {
  const edge = Math.ceil(total / 3);
  if (index < edge) return styles.tooltipStart;
  if (index >= total - edge) return styles.tooltipEnd;
  return styles.tooltipCenter;
};

export const Presenter: FC<{
  days: ContributionDay[];
}> = ({ days }) => {
  const totalContributions = days.reduce((total, day) => total + day.count, 0);

  const period =
    days.length >= 365
      ? '過去1年間'
      : days.length >= 60
        ? `過去${Math.floor(days.length / 7)}週間`
        : `過去${days.length}日間`;

  const maxCount = Math.max(0, ...days.map((day) => day.count));
  const scaleMax = Math.max(4, Math.ceil(maxCount / 4) * 4);

  return (
    <Card>
      <div className={styles.root}>
        <div className={styles.header}>
          <h3 className={styles.title}>開発の足あと</h3>
          <InfoTooltip />
        </div>

        <div className={styles.chart}>
          <div aria-hidden="true" className={styles.axis}>
            <span className={cn(styles.tick, styles.scaleMax)}>{scaleMax}</span>
            <span className={cn(styles.tick, styles.scaleThreeQuarters)}>
              {(scaleMax / 4) * 3}
            </span>
            <span className={cn(styles.tick, styles.scaleHalf)}>
              {scaleMax / 2}
            </span>
            <span className={cn(styles.tick, styles.scaleQuarter)}>
              {scaleMax / 4}
            </span>
            <span className={cn(styles.tick, styles.scaleZero)}>0</span>
          </div>

          <div className={styles.plot}>
            <div aria-hidden="true">
              <div className={cn(styles.gridline, styles.scaleMax)} />
              <div className={cn(styles.gridline, styles.scaleThreeQuarters)} />
              <div className={cn(styles.gridline, styles.scaleHalf)} />
              <div className={cn(styles.gridline, styles.scaleQuarter)} />
              <div className={cn(styles.gridline, styles.scaleZero)} />
            </div>
            <ul
              aria-label={`日別のコントリビューション数（${period}）`}
              className={styles.bars}
            >
              {days.map((day, index) => {
                const label = formatDate(new Date(day.date), 'yyyy年M月d日(E)');
                return (
                  <li
                    aria-label={`${label}: ${day.count}件のコントリビューション`}
                    className={styles.bar}
                    key={day.date}
                    tabIndex={0}
                  >
                    <div aria-hidden="true" className={styles.highlight} />
                    <div
                      aria-hidden="true"
                      className={styles.fill}
                      style={{ height: `${(day.count / scaleMax) * 100}%` }}
                    />
                    <div
                      aria-hidden="true"
                      className={cn(
                        styles.tooltip,
                        tooltipPositionClass(index, days.length),
                      )}
                    >
                      <p className={styles.count}>
                        {day.count}件のコントリビューション
                      </p>
                      <p className={styles.date}>{label}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div aria-hidden="true" className={styles.labels}>
            {days.map((day, index) => (
              <span
                className={cn(
                  styles.label,
                  // グラフが狭いとラベルが重なるため、コンテナ幅を基準に最新日から1日おきの表示へ間引く
                  (days.length - 1 - index) % 2 !== 0 && styles.labelThinned,
                )}
                key={day.date}
                style={{ left: `${((index + 0.5) / days.length) * 100}%` }}
              >
                {formatDate(new Date(day.date), 'M/d')}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.total}>
          {period}で{totalContributions}件
        </div>
      </div>
    </Card>
  );
};
