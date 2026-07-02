/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- 棒グラフの各データ点をキーボードフォーカスで参照（ツールチップ表示）できるようにするため */
import { Card } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { ContributionDay } from '@/features/github/interface/queries';

import { InfoTooltip } from './info-tooltip';

// ツールチップがカード外へはみ出さないよう、端寄りの棒は端揃えにする
const tooltipPositionClass = (index: number, total: number): string => {
  const edge = Math.ceil(total / 3);
  if (index < edge) return 'left-0';
  if (index >= total - edge) return 'right-0';
  return 'left-1/2 -translate-x-1/2';
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
  const scaleMax = Math.max(2, Math.ceil(maxCount / 2) * 2);

  return (
    <Card>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <h3 className="text-fg-base text-sm font-bold">開発の足あと</h3>
          <InfoTooltip />
        </div>

        <div className="grid h-48 grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-x-2 gap-y-1">
          <div
            aria-hidden="true"
            className="text-fg-mute relative col-start-1 row-start-1 min-w-4 text-xs"
          >
            <span className="absolute top-0 right-0 -translate-y-1/2">
              {scaleMax}
            </span>
            <span className="absolute top-1/2 right-0 -translate-y-1/2">
              {scaleMax / 2}
            </span>
            <span className="absolute right-0 bottom-0 translate-y-1/2">0</span>
          </div>

          <div className="relative col-start-2 row-start-1">
            <div aria-hidden="true">
              <div className="border-border-mute absolute inset-x-0 top-0 border-t border-dashed" />
              <div className="border-border-mute absolute inset-x-0 top-1/2 border-t border-dashed" />
              <div className="border-border-mute absolute inset-x-0 bottom-0 border-t border-dashed" />
            </div>
            <ul
              aria-label={`日別のコントリビューション数（${period}）`}
              className="relative flex h-full"
            >
              {days.map((day, index) => {
                const label = formatDate(new Date(day.date), 'yyyy年M月d日(E)');
                return (
                  <li
                    aria-label={`${label}: ${day.count}件のコントリビューション`}
                    className="group focus-visible:ring-border-info relative flex flex-1 items-end rounded-sm px-0.5 focus-visible:ring-2 focus-visible:outline-hidden"
                    key={day.date}
                    tabIndex={0}
                  >
                    <div
                      aria-hidden="true"
                      className="bg-bg-subtle absolute inset-0 rounded-sm opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus:opacity-100"
                    />
                    <div
                      aria-hidden="true"
                      className="bg-primary-bg-emphasize relative w-full rounded-t"
                      style={{ height: `${(day.count / scaleMax) * 100}%` }}
                    />
                    <div
                      aria-hidden="true"
                      className={cn(
                        'bg-bg-base text-fg-base pointer-events-none absolute top-0 z-10 w-max rounded-xl px-3 py-2 opacity-0 shadow-md transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus:opacity-100',
                        tooltipPositionClass(index, days.length),
                      )}
                    >
                      <p className="text-sm font-semibold">
                        {day.count}件のコントリビューション
                      </p>
                      <p className="text-fg-mute text-xs">{label}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="relative col-start-2 row-start-2 h-4"
          >
            {days.map((day, index) =>
              (days.length - 1 - index) % 2 === 0 ? (
                <span
                  className="text-fg-mute absolute top-0 -translate-x-1/2 text-xs whitespace-nowrap"
                  key={day.date}
                  style={{ left: `${((index + 0.5) / days.length) * 100}%` }}
                >
                  {formatDate(new Date(day.date), 'M/d')}
                </span>
              ) : null,
            )}
          </div>
        </div>

        <div className="text-fg-mute text-xs">
          {period}で{totalContributions}件
        </div>
      </div>
    </Card>
  );
};
