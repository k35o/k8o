'use client';

import { Accordion, Badge } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

type Report = {
  id: number;
  type: string;
  url: string;
  body: unknown;
  createdAt: string;
};

export const ReportTable: FC<{ reports: Report[] }> = ({ reports }) => {
  if (reports.length === 0) {
    return (
      <p className="py-16 text-center text-fg-mute text-sm">
        レポートはありません
      </p>
    );
  }

  return (
    <Accordion.Root>
      {reports.map((report) => (
        <Accordion.Item key={report.id}>
          <Accordion.Button>
            <div className="flex flex-1 items-center gap-3">
              <Badge size="sm" text={report.type} tone="neutral" />
              <span className="min-w-0 flex-1 truncate text-sm">
                {report.url}
              </span>
              <span className="hidden shrink-0 text-fg-mute text-xs sm:block">
                {formatDate(new Date(report.createdAt), 'yyyy/MM/dd HH:mm')}
              </span>
            </div>
          </Accordion.Button>
          <Accordion.Panel>
            <pre className="overflow-x-auto rounded-xl bg-bg-subtle p-4 text-xs leading-relaxed">
              {JSON.stringify(report.body, null, 2)}
            </pre>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};
