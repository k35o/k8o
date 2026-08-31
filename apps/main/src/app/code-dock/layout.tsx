import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

const TITLE = 'コードドック';
const DESCRIPTION =
  'JavaScript/TypeScriptのコードをoxlintで検査し、oxfmtで整形します。';

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/code-dock',
});

export default function Layout({ children }: LayoutProps<'/code-dock'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading level="h2">{TITLE}</Heading>
        {children}
      </div>
    </div>
  );
}
