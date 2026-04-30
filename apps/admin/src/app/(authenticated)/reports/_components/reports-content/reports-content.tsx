import { Card, Separator } from '@k8o/arte-odyssey';
import { getReportsOverview } from '@/features/reports/interface/queries';
import { ReportTable } from '../report-table/report-table';

export const ReportsContent = async () => {
  const { reports, typeCounts, totalCount } = await getReportsOverview();

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
