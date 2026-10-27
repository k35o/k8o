import { Alert } from '@k8ordo/ui';
import type { MDXComponents } from 'mdx/types';

import { FloatImage, Image } from '@/components/blog/image/image';
import { LinkCard } from '@/components/blog/link-card/link-card';
import { BrowserSupportStatus } from '@/components/site/browser-support-status/browser-support-status';

export const blogMdxComponents: MDXComponents = {
  Alert,
  BrowserSupportStatus,
  FloatImage,
  Image,
  LinkCard,
};
