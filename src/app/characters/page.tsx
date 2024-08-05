import { AppCard } from '@/app/_components/app-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/characters/counter"
        emotion="📏"
        title="文字数カウンター"
        description="テキストエリアに入力した文字数をカウントします"
      />
      <AppCard
        link="/characters/check-syntax"
        emotion="🧐"
        title="日本語校正くん"
        description="テキストエリアに入力した文章の校正を行います"
      />
    </div>
  );
}
