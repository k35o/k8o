import { fn } from '@storybook/test';

import * as actual from '@/app/blog/_actions';

export const getBlog = fn(actual.getBlog).mockName('getBlog');

export const getBlogView = fn(actual.getBlogView).mockName(
  'getBlogView',
);

export const incrementBlogView = fn(
  actual.incrementBlogView,
).mockName('incrementBlogView');
