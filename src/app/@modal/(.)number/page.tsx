import { AppCard } from '../_components/app-card';
import { Modal } from '../_components/modal';

export default function Page() {
  return (
    <Modal title="🔢 Number">
      <div className="flex w-full flex-col gap-4">
        <AppCard
          link="/number/converter"
          emotion="🧬"
          title="基数変換ツール"
          description="10進数から2進数のように基数を変換します"
        />
      </div>
    </Modal>
  );
}
