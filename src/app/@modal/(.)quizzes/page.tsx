import { AppCard } from '../_components/app-card';
import { Modal } from '../_components/modal';

export default function Page() {
  return (
    <Modal title="💡 Quizzes">
      <div className="flex w-full flex-col gap-4">
        <AppCard
          link="/quizzes/fish-kanji"
          emotion="🐟"
          title="うおへんクイズ"
          description="うおへんを持つ漢字の問題を出します"
        />
      </div>
    </Modal>
  );
}
