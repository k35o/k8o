import { AppCard } from '../_components/app-card';
import { Modal } from '../_components/modal';

export default function Page() {
  return (
    <Modal title="🎨 Colors">
      <div className="flex w-full flex-col gap-4">
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
    </Modal>
  );
}
