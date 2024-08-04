import { AppCard } from '@/app/_components/app-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/quizzes/fish-kanji"
        emotion="🐟"
        title="うおへんクイズ"
        description="うおへんを持つ漢字の問題を出します"
      />
    </div>
  );
}
