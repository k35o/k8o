import { Card, Separator } from '@k8o/arte-odyssey';
import { db } from '@repo/database';
import { count, desc } from 'drizzle-orm';
import { cacheLife } from 'next/cache';
import { ReportTable } from '../report-table/report-table';

export const ReportsContent = async () => {
  'use cache';
  cacheLife('minutes');

  const [reports, typeCounts] = await Promise.all([
    db.query.reportingReports.findMany({
      orderBy: (reports) => [desc(reports.createdAt)],
      limit: 100,
    }),
    db
      .select({
        type: db._schema.reportingReports.type,
        count: count(),
      })
      .from(db._schema.reportingReports)
      .groupBy(db._schema.reportingReports.type),
  ]);

  const totalCount = typeCounts.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="flex flex-col gap-10">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card appearance="shadow">
          <div className="flex flex-col gap-2 p-6">
            <p className="text-fg-mute text-sm">総レポート数</p>
            <p className="font-bold text-3xl">{totalCount}</p>
          </div>
        </Card>
        {typeCounts.map((t) => (
          <Card appearance="shadow" key={t.type}>
            <div className="flex flex-col gap-2 p-6">
              <p className="text-fg-mute text-sm">{t.type}</p>
              <p className="font-bold text-3xl">{t.count}</p>
            </div>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="flex flex-col gap-6">
        <div>
          <h3 className="font-bold text-lg">最新レポート</h3>
          <p className="mt-1 text-fg-mute text-sm">直近100件のレポートを表示</p>
        </div>
        <Card appearance="shadow">
          <ReportTable reports={reports} />
        </Card>
      </section>
    </div>
  );
};
