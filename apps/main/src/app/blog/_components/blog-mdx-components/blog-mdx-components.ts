import { Alert } from '@k8ordo/ui';
import type { MDXComponents } from 'mdx/types';

import { BrowserSupportStatus } from '@/app/_components/browser-support-status/browser-support-status';
import { mdxBaseComponents } from '@/app/_components/mdx-base';
import { PlaygroundEmbed } from '@/app/_components/playgrounds/playground-embed';
import { FloatImage, Image } from '@/app/blog/_components/image';
import { LinkCard } from '@/app/blog/_components/link-card';
import { Playground } from '@/playgrounds/playground';

export const blogMdxComponents: MDXComponents = {
  ...mdxBaseComponents,
  Alert,
  BrowserSupportStatus,
  FloatImage,
  Image,
  LinkCard,
  Playground,
  PlaygroundEmbed,
};
