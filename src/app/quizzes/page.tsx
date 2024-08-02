import { AppCard } from '@/app/_components/app-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/quizzes/fish-kanji"
        emotion="🐟"
        title="魚編クイズ"
        description="魚編を持つ漢字の問題を出します"
      />
    </div>
  );
}
