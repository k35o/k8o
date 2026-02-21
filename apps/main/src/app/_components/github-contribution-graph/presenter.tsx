'use client';

import { AlertIcon, IconButton } from '@k8o/arte-odyssey';
import { Card } from '@k8o/arte-odyssey/card';
import { Tooltip as ArteTooltip } from '@k8o/arte-odyssey/tooltip';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ContributionDay } from '@/services/github/contributions';

type ChartDataItem = {
  date: string;
  label: string;
  count: number;
};

export const Presenter: FC<{
  days: ContributionDay[];
}> = ({ days }) => {
  const totalContributions = days.reduce((total, day) => total + day.count, 0);

  // 期間を計算（実際の日数に基づいて）
  const period =
    days.length >= 365
      ? '過去1年間'
      : days.length >= 60
        ? `過去${Math.floor(days.length / 7)}週間`
        : `過去${days.length}日間`;

  const data: ChartDataItem[] = days.map((day) => ({
    date: day.date,
    label: formatDate(new Date(day.date), 'M/d'),
    count: day.count,
  }));

  return (
    <Card>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-fg-base text-sm">開発の足あと</h3>
          <ArteTooltip.Root placement="top">
            <ArteTooltip.Trigger
              renderItem={(props) => (
                <IconButton {...props} label="このグラフについて" size="sm">
                  <AlertIcon size="sm" status="info" />
                </IconButton>
              )}
            />
            <ArteTooltip.Content>
              k8o・ArteOdysseyリポジトリへのコミット履歴
            </ArteTooltip.Content>
          </ArteTooltip.Root>
        </div>

        <div className="h-48">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data}>
              <CartesianGrid
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: 'var(--fg-mute)', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: 'var(--fg-mute)', fontSize: 12 }}
                tickLine={false}
                width={30}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'var(--bg-subtle)' }}
                position={{ y: 0 }}
              />
              <Bar
                activeBar={{ fill: 'var(--teal-700)' }}
                dataKey="count"
                fill="var(--teal-600)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-fg-muted text-xs">
          {period}で{totalContributions}件
        </div>
      </div>
    </Card>
  );
};

const CustomTooltip: FC<{
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}> = ({ active, payload }) => {
  if (!(active && payload?.[0])) {
    return null;
  }

  const item = payload[0].payload;
  const formattedDate = formatDate(new Date(item.date), 'yyyy年M月d日(E)');

  return (
    <div className="rounded-md border border-border-base bg-bg-base px-3 py-2 text-fg-base shadow-sm">
      <p className="font-semibold text-sm">{item.count}件のコミット</p>
      <p className="text-fg-mute text-xs">{formattedDate}</p>
    </div>
  );
};
