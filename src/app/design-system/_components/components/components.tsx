import { Anchor } from '@/components/anchor';
import { FC } from 'react';

export const Components: FC = () => {
  return (
    <section className="flex h-full flex-col gap-4">
      <iframe
        className="h-full"
        src="https://main--647acebb9da23d6c605c4afd.chromatic.com"
        title="Chromaticでビルドしたコンポーネントの一覧"
      />
      <div className="text-end">
        <Anchor href="https://main--647acebb9da23d6c605c4afd.chromatic.com/">
          <span className="text-sm">
            別のウィンドウでStorybookを開く
          </span>
        </Anchor>
      </div>
    </section>
  );
};
