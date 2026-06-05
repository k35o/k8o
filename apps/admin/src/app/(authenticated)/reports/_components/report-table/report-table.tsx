'use client';

import { Accordion, Badge, Card } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components/empty-state';

type Report = {
  id: number;
  type: string;
  url: string;
  body: unknown;
  createdAt: string;
};

export const ReportTable: FC<{ reports: Report[] }> = ({ reports }) => {
  if (reports.length === 0) {
    return <EmptyState message="レポートはありません" />;
  }

  return (
    <Card appearance="shadow">
      <Accordion.Root>
        {reports.map((report) => (
          <Accordion.Item key={report.id}>
            <Accordion.Button>
              <div className="flex flex-1 items-center gap-3">
                <Badge size="sm" text={report.type} tone="neutral" />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {report.url}
                </span>
                <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
                  {formatDate(new Date(report.createdAt), 'yyyy/MM/dd HH:mm')}
                </span>
              </div>
            </Accordion.Button>
            <Accordion.Panel>
              <pre className="bg-bg-subtle overflow-x-auto rounded-xl p-4 text-xs leading-relaxed">
                {JSON.stringify(report.body, null, 2)}
              </pre>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Card>
  );
};
