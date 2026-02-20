'use client';

import { AlertIcon, IconButton } from '@k8o/arte-odyssey';
import { Card } from '@k8o/arte-odyssey/card';
import { Tooltip } from '@k8o/arte-odyssey/tooltip';
import { cn } from '@repo/helpers/cn';
import { formatDate } from '@repo/helpers/date/format';
import {
  type FC,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
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
                <span className="ml-1">({errorMessage})</span>
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
        <ContributionGrid weeks={weeks} />

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
 * 矢印キーで移動可能なContributionグリッド（roving tabindex）
 */
const ContributionGrid: FC<{ weeks: ContributionWeek[] }> = ({ weeks }) => {
  const [focusedWeek, setFocusedWeek] = useState(() =>
    Math.max(0, weeks.length - 1),
  );
  const [focusedDay, setFocusedDay] = useState(() => {
    const lastWeek = weeks.at(-1);
    return lastWeek ? Math.max(0, lastWeek.days.length - 1) : 0;
  });
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setCellRef = useCallback(
    (weekIndex: number, dayIndex: number, el: HTMLButtonElement | null) => {
      const key = `${weekIndex}-${dayIndex}`;
      if (el) {
        cellRefs.current.set(key, el);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  const focusCell = useCallback((weekIndex: number, dayIndex: number) => {
    const cell = cellRefs.current.get(`${weekIndex}-${dayIndex}`);
    if (cell) {
      setFocusedWeek(weekIndex);
      setFocusedDay(dayIndex);
      cell.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let nextWeek = focusedWeek;
      let nextDay = focusedDay;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextWeek = focusedWeek + 1;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextWeek = focusedWeek - 1;
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextDay = focusedDay + 1;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextDay = focusedDay - 1;
          break;
        default:
          return;
      }

      // 範囲チェック
      const targetWeek = weeks[nextWeek];
      if (!targetWeek) {
        return;
      }
      // 移動先の週の日数が少ない場合は最終セルにクランプ
      const clampedDay = Math.min(nextDay, targetWeek.days.length - 1);
      if (clampedDay < 0) {
        return;
      }

      focusCell(nextWeek, clampedDay);
    },
    [focusedWeek, focusedDay, weeks, focusCell],
  );

  const maxDays = Math.max(...weeks.map((w) => w.days.length));

  return (
    <div className="flex justify-center">
      <table
        aria-label="コントリビューショングラフ"
        className="border-collapse"
      >
        <tbody>
          {Array.from({ length: maxDays }, (_, dayIndex) => (
            <tr key={dayIndex}>
              {weeks.map((week, weekIndex) => {
                const day = week.days[dayIndex];
                return (
                  <td className="p-px leading-0" key={weekIndex}>
                    {day ? (
                      <ContributionCell
                        day={day}
                        isFocusable={
                          weekIndex === focusedWeek && dayIndex === focusedDay
                        }
                        onKeyDown={handleKeyDown}
                        ref={(el) => setCellRef(weekIndex, dayIndex, el)}
                      />
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 個別のContribution Cellコンポーネント
 */
const ContributionCell: FC<{
  day: ContributionDay;
  isFocusable: boolean;
  onKeyDown: (e: KeyboardEvent) => void;
  ref: (el: HTMLButtonElement | null) => void;
}> = ({ day, isFocusable, onKeyDown, ref }) => {
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
              'focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-teal-500',
            )}
            onKeyDown={onKeyDown}
            ref={ref}
            style={cellStyle}
            tabIndex={isFocusable ? 0 : -1}
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
