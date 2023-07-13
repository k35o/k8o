import { AppCard } from '@/app/_components/app-card';

export default function Page() {
  return (
    <div>
      <AppCard
        link="/characters/counter"
        emotion="📏"
        title="文字数カウンター"
        description="テキストエリアに入力した文字数をカウントします。"
      />
    </div>
  );
}
