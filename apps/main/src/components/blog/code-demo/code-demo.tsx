import { href } from '@k8ordo/framework';
import { RefreshIcon } from '@k8ordo/ui/icons';
import type { FC, ReactNode } from 'react';

import { CodeDemoView } from './code-demo-view';

type Props = {
  slug: string;
  name: string;
  children?: ReactNode;
};

// RefreshIcon をどのページも読むファイルに載せないよう、サーバーで描いて渡す
export const CodeDemo: FC<Props> = ({ slug, name, children }) => (
  <CodeDemoView
    name={name}
    replayIcon={<RefreshIcon size="sm" />}
    src={href('/blog/:slug/demos/:demo', { slug, demo: name })}
  >
    {children}
  </CodeDemoView>
);
