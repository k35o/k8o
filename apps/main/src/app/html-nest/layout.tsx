import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

const TITLE = 'HTMLいれ子マップ';
const DESCRIPTION =
  'HTMLタグを選ぶと、親に置ける要素と中に入れられる子要素が浮かび上がります。';

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/html-nest',
});

export default function Layout({ children }: LayoutProps<'/html-nest'>) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">{TITLE}</Heading>
        {children}
      </div>
    </div>
  );
}
