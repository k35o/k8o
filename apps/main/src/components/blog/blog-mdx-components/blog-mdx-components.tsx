import { Alert } from '@k8ordo/ui';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

import { CodeDemo } from '@/components/blog/code-demo/code-demo';
import { FloatImage, Image } from '@/components/blog/image/image';
import { LinkCard } from '@/components/blog/link-card/link-card';
import { BrowserSupportStatus } from '@/components/site/browser-support-status/browser-support-status';

// 動く例（@repo/code-highlight が demo のメタを書いたコードブロックを包む code-demo）は、
// 記事の slug で例の URL を組むので、記事ごとに表を作る
export const blogMdxComponents = (slug: string): MDXComponents => ({
  Alert,
  BrowserSupportStatus,
  FloatImage,
  Image,
  LinkCard,
  'code-demo': ({
    name,
    allow,
    children,
  }: {
    name: string;
    allow?: string;
    children?: ReactNode;
  }) => (
    <CodeDemo allow={allow} name={name} slug={slug}>
      {children}
    </CodeDemo>
  ),
});
