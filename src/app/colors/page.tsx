import { AppCard } from '@/app/_components/app-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/colors/contrasts"
        emotion="⚖️"
        title="コントラスト比チェッカー"
        description="コントラスト比をチェックします"
      />
      <AppCard
        link="/colors/converter"
        emotion="🧬"
        title="色変換ツール"
        description="カラーコードの形式を変換します"
      />
    </div>
  );
}
