import { Heading } from '@k8o/arte-odyssey';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

export const metadata = buildPageMetadata({
  title: 'Artifacts',
  description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
  path: '/artifacts',
});

export default function Layout({ children }: LayoutProps<'/artifacts'>) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-6">
        <Heading level="h2">Artifacts</Heading>
        {children}
      </div>
    </div>
  );
}
