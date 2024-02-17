import { AppCard } from '../_components/app-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/sql-statement/creating"
        emotion="📄"
        title="テーブル作成"
        description="テーブルを作成するSQL文を生成します"
      />
    </div>
  );
}
