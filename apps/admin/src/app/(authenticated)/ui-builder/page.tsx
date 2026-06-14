import { PageHeader } from '@/app/(authenticated)/_components';

import { UiBuilder } from './_components/ui-builder';

export default function Page() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="チャットで指示すると、ArteOdysseyのコンポーネントだけでUIを生成します。"
        title="AI UIビルダー"
      />
      <UiBuilder />
    </div>
  );
}
