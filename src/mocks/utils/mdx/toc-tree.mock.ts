import * as actual from '@/utils/mdx/toc-tree';
import { fn } from '@storybook/test';

export const getTocTree = fn(actual.getTocTree).mockName(
  'getTocTreeWithCache',
);

export const getTocTreeWithCache = fn(
  actual.getTocTreeWithCache,
).mockName('getTocTreeWithCache');
