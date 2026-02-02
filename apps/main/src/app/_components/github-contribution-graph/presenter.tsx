'use client';

import { AlertIcon, IconButton } from '@k8o/arte-odyssey';
import { Card } from '@k8o/arte-odyssey/card';
import { Tooltip } from '@k8o/arte-odyssey/tooltip';
import { cn } from '@repo/helpers/cn';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';
import type {
  ContributionDay,
  ContributionWeek,
} from '@/services/github/contributions';

/**
 * GitHub Contributionグラフ（プレゼンター）
 */
export const Presenter: FC<{
  errorMessage?: string;
  isError?: boolean;
  weeks: ContributionWeek[];
}> = ({ errorMessage, isError = false, weeks }) => {
  const totalContributions = weeks.reduce(
    (total, week) => total + week.days.reduce((sum, day) => sum + day.count, 0),
    0,
  );

  // 期間を計算（実際の日数に基づいて）
  const totalDays = weeks.reduce((total, week) => total + week.days.length, 0);
  const period =
    totalDays >= 365
      ? '過去1年間'
      : totalDays >= 60
        ? `過去${Math.floor(totalDays / 7)}週間`
        : `過去${totalDays}日間`;

  return (
    <Card>
      <div className="flex flex-col gap-4 p-6">
        {/* タイトル */}
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-fg-base text-sm">開発の足あと</h3>
          {isError ? (
            <span className="text-fg-mute text-xs">
              データの取得に失敗しました。しばらくしてから再度お試しください。
              {process.env.NODE_ENV === 'development' && errorMessage ? (
                <span className="ml-1 text-[10px]">({errorMessage})</span>
              ) : null}
            </span>
          ) : null}
          <Tooltip.Root placement="top">
            <Tooltip.Trigger
              renderItem={(props) => (
                <IconButton {...props} label="このグラフについて" size="sm">
                  <AlertIcon size="sm" status="info" />
                </IconButton>
              )}
            />
            <Tooltip.Content>k8oリポジトリへのコミット履歴</Tooltip.Content>
          </Tooltip.Root>
        </div>

        {/* グラフ */}
        <div className="flex justify-center">
          <div className="inline-flex w-fit gap-0.5">
            {weeks.map((week, weekIndex) => (
              <div className="flex flex-col gap-0.5" key={weekIndex}>
                {week.days.map((day, dayIndex) => (
                  <ContributionCell day={day} key={dayIndex} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 件数と凡例 */}
        <div className="flex items-center justify-between text-fg-muted text-xs">
          <div>
            {period}で{totalContributions}件
          </div>
          <div className="flex items-center gap-2">
            <span>-</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  className="h-4 w-4 rounded-full"
                  key={level}
                  style={_getCellStyle(level)}
                />
              ))}
            </div>
            <span>+</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

/**
 * レベルに応じたスタイルを取得（0: 枠線のみ, 1-4: コミット量）
 */
const _getCellStyle = (
  level: number,
): { backgroundColor?: string; border?: string } => {
  switch (level) {
    case 0:
      return { border: '1px solid var(--border-base)' };
    case 1:
      return {
        backgroundColor:
          'color-mix(in srgb, var(--teal-700) 40%, var(--teal-200))',
      };
    case 2:
      return {
        backgroundColor:
          'color-mix(in srgb, var(--teal-700) 60%, var(--teal-300))',
      };
    case 3:
      return {
        backgroundColor:
          'color-mix(in srgb, var(--teal-700) 80%, var(--teal-400))',
      };
    case 4:
      return { backgroundColor: 'var(--teal-700)' };
    default:
      return { border: '1px solid var(--border-base)' };
  }
};

/**
 * 個別のContribution Cellコンポーネント
 */
const ContributionCell: FC<{ day: ContributionDay }> = ({ day }) => {
  const formattedDate = formatDate(new Date(day.date), 'yyyy年M月d日(E)');
  const cellStyle = _getCellStyle(day.level);

  return (
    <Tooltip.Root placement="top">
      <Tooltip.Trigger
        renderItem={(props) => (
          <button
            {...props}
            aria-label={`${day.count}件のコミット ${formattedDate}`}
            className={cn(
              'h-4 w-4 rounded-full p-0 transition-all duration-200',
              'hover:scale-110 hover:ring-2 hover:ring-teal-500',
            )}
            style={cellStyle}
            type="button"
          />
        )}
      />
      <Tooltip.Content>
        <div className="font-semibold">{day.count}件のコミット</div>
        <div className="text-fg-inverse-muted text-xs">{formattedDate}</div>
      </Tooltip.Content>
    </Tooltip.Root>
  );
};
