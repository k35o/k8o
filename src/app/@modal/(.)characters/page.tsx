import { AppCard } from '../_components/app-card';
import { Modal } from '../_components/modal';

export default function Page() {
  return (
    <Modal title="📄 Characters">
      <div className="flex w-full flex-col gap-4">
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
    </Modal>
  );
}
