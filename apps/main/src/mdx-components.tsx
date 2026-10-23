import type { MDXComponents } from 'mdx/types';

import { BrowserSupportStatus } from '@/app/_components/browser-support-status/browser-support-status';
import { mdxBaseComponents } from '@/app/_components/mdx-base';

const components: MDXComponents = {
  ...mdxBaseComponents,
  BrowserSupportStatus,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
