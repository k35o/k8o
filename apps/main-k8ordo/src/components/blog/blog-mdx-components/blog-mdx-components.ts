import { Alert } from '@k8ordo/ui';
import type { MDXComponents } from 'mdx/types';

import { FloatImage, Image } from '@/components/blog/image/image';
import { LinkCard } from '@/components/blog/link-card/link-card';
import { LazyPlayground } from '@/components/playgrounds/lazy-playground';
import { PlaygroundEmbed } from '@/components/playgrounds/playground-embed/playground-embed';
import { BrowserSupportStatus } from '@/components/site/browser-support-status/browser-support-status';

export const blogMdxComponents: MDXComponents = {
  Alert,
  BrowserSupportStatus,
  FloatImage,
  Image,
  LinkCard,
  Playground: LazyPlayground,
  PlaygroundEmbed,
};
