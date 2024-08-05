import { AppCard } from '../_components/app-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/number/converter"
        emotion="🧬"
        title="基数変換ツール"
        description="10進数から2進数のように基数を変換します"
      />
    </div>
  );
}
