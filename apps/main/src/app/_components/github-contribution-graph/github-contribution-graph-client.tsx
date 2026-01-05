'use client';

import { Tooltip } from '@k8o/arte-odyssey/tooltip';
import type {
  ContributionDay,
  ContributionWeek,
} from '@/services/github/contributions';

type GitHubContributionGraphClientProps = {
  weeks: ContributionWeek[];
};

/**
 * GitHub Contributionグラフ（クライアントコンポーネント）
 */
export const GitHubContributionGraphClient = ({
  weeks,
}: GitHubContributionGraphClientProps) => {
  const totalContributions = weeks.reduce(
    (total, week) => total + week.days.reduce((sum, day) => sum + day.count, 0),
    0,
  );

  return (
    <div className="rounded-lg border-border-base bg-bg-base p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-fg-base text-lg">
          GitHub Contributions
        </h2>
        <p className="text-fg-muted text-sm">
          {totalContributions} contributions
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div className="flex flex-col gap-1" key={weekIndex}>
              {week.days.map((day, dayIndex) => (
                <ContributionCell day={day} key={dayIndex} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-fg-muted text-xs">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-bg-muted" />
          <div
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--teal-700) 40%, var(--teal-200))',
            }}
          />
          <div
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--teal-700) 60%, var(--teal-300))',
            }}
          />
          <div
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--teal-700) 80%, var(--teal-400))',
            }}
          />
          <div className="h-3 w-3 rounded-sm bg-teal-700" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

/**
 * 個別のContribution Cellコンポーネント
 */
const ContributionCell = ({ day }: { day: ContributionDay }) => {
  return (
    <Tooltip.Root placement="top">
      <Tooltip.Trigger
        renderItem={(props) => (
          <button
            {...props}
            aria-label={`${day.count} contributions on ${day.date}`}
            className={`h-3 w-3 rounded-sm border-none p-0 transition-all duration-200 ${day.level === 0 ? 'bg-bg-muted' : day.level === 4 ? 'bg-teal-700' : ''}`}
            style={
              day.level === 1
                ? {
                    backgroundColor:
                      'color-mix(in srgb, var(--teal-700) 40%, var(--teal-200))',
                  }
                : day.level === 2
                  ? {
                      backgroundColor:
                        'color-mix(in srgb, var(--teal-700) 60%, var(--teal-300))',
                    }
                  : day.level === 3
                    ? {
                        backgroundColor:
                          'color-mix(in srgb, var(--teal-700) 80%, var(--teal-400))',
                      }
                    : undefined
            }
            type="button"
          />
        )}
      />
      <Tooltip.Content>
        <div>{day.count} contributions</div>
        <div className="text-fg-inverse-muted">{day.date}</div>
      </Tooltip.Content>
    </Tooltip.Root>
  );
};
