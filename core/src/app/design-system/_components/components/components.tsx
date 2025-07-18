import { Anchor } from '@k8o/components/anchor';
import { FC } from 'react';

export const Components: FC = () => {
  return (
    <section className="flex h-full flex-col gap-4">
      <iframe
        className="h-full"
        src="https://main--687a213c85e2e4589d8db1bb.chromatic.com"
        title="Chromaticでビルドしたコンポーネントの一覧"
      />
      <div className="text-end">
        <Anchor href="https://main--687a213c85e2e4589d8db1bb.chromatic.com/">
          <span className="text-sm">
            別のウィンドウでStorybookを開く
          </span>
        </Anchor>
      </div>
    </section>
  );
};
