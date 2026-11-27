import { href } from '@k8ordo/framework';
import { MaximizeIcon, RefreshIcon, XIcon } from '@k8ordo/ui/icons';
import type { FC, ReactNode } from 'react';

import { CodeDemoView } from './code-demo-view';

type Props = {
  slug: string;
  name: string;
  allow?: string | undefined;
  children?: ReactNode;
};

// アイコンをどのページも読むファイルに載せないよう、サーバーで描いて渡す
export const CodeDemo: FC<Props> = ({ slug, name, allow, children }) => (
  <CodeDemoView
    allow={allow}
    closeIcon={<XIcon size="sm" />}
    expandIcon={<MaximizeIcon size="sm" />}
    name={name}
    replayIcon={<RefreshIcon size="sm" />}
    src={href('/blog/:slug/demos/:demo/document.txt', { slug, demo: name })}
  >
    {children}
  </CodeDemoView>
);
