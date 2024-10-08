import { AppCard } from '../_components/app-card';
import { Modal } from '../_components/modal';

export default function Page() {
  return (
    <Modal title="🧑‍💻 Engineerings">
      <div className="flex w-full flex-col gap-4">
        <AppCard
          link="/engineerings/creating"
          emotion="📄"
          title="テーブル作成"
          description="テーブルを作成するSQL文を生成します"
        />
      </div>
    </Modal>
  );
}
